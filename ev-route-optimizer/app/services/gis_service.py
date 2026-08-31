import os
import logging
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
from shapely.geometry import Polygon, Point

from app.models.route_models import Coordinate

logger = logging.getLogger(__name__)

class GISService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(GISService, cls).__new__(cls, *args, **kwargs)
            cls._instance.zones = []
            # Automatically load on instantiation
            cls._instance.load_kml()
        return cls._instance

    def _strip_ns(self, tag: str) -> str:
        """Strips XML namespaces from tag names."""
        if '}' in tag:
            return tag.split('}', 1)[1]
        return tag

    def _find_elements_by_tag(self, element: ET.Element, tag_name: str) -> List[ET.Element]:
        """Finds all sub-elements matching tag name recursively, ignoring namespaces."""
        tag_clean = tag_name.lower()
        matches = []
        for el in element.iter():
            if self._strip_ns(el.tag).lower() == tag_clean:
                matches.append(el)
        return matches

    def load_kml(self, file_path: Optional[str] = None) -> int:
        """
        Parses polygon zones/districts from a KML or KMZ file.
        Returns the number of loaded polygons.
        """
        if file_path is None:
            # Default production path
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            kmz_path = os.path.join(base_dir, "data", "gis", "district_nwic.kmz")
            kml_fallback = os.path.join(base_dir, "data", "gis", "administrative_boundaries.kml")
            
            if os.path.exists(kmz_path):
                file_path = kmz_path
            else:
                file_path = kml_fallback

        if not os.path.exists(file_path):
            logger.warning(f"GIS boundary file not found at: {file_path}. GIS service initialized empty.")
            self.zones = []
            return 0

        try:
            is_kmz = file_path.lower().endswith(".kmz")
            if is_kmz:
                import zipfile
                with zipfile.ZipFile(file_path, "r") as z:
                    kml_filename = "doc.kml"
                    if kml_filename not in z.namelist():
                        kml_files = [n for n in z.namelist() if n.lower().endswith(".kml")]
                        if kml_files:
                            kml_filename = kml_files[0]
                        else:
                            raise FileNotFoundError("No KML file found inside KMZ.")
                    with z.open(kml_filename) as f:
                        root = ET.fromstring(f.read())
            else:
                tree = ET.parse(file_path)
                root = tree.getroot()

            placemarks = self._find_elements_by_tag(root, "Placemark")
            loaded_zones = []

            for pm in placemarks:
                # 1. Extract metadata from ExtendedData if available
                ext_data_el = self._find_elements_by_tag(pm, "ExtendedData")
                metadata = {}
                if ext_data_el:
                    data_els = self._find_elements_by_tag(ext_data_el[0], "Data")
                    for d in data_els:
                        attr_name = d.attrib.get("name")
                        val_els = self._find_elements_by_tag(d, "value")
                        if attr_name and val_els:
                            metadata[attr_name] = val_els[0].text.strip() if val_els[0].text else ""

                # Fallback to standard elements if ExtendedData is missing
                district_name = metadata.get("district")
                district_code = metadata.get("dtcode")
                state_name = metadata.get("state_name")
                state_code = metadata.get("state")
                object_id = metadata.get("objectid") or metadata.get("id")

                if not district_name:
                    name_els = self._find_elements_by_tag(pm, "name")
                    district_name = name_els[0].text.strip() if name_els else "Unnamed District"
                
                if not district_code:
                    desc_els = self._find_elements_by_tag(pm, "description")
                    district_code = desc_els[0].text.strip() if desc_els else district_name.upper().replace(" ", "-")

                if not state_name:
                    state_name = "Unknown State"

                # 2. Extract geometries (Polygon elements)
                poly_els = self._find_elements_by_tag(pm, "Polygon")
                
                for poly_el in poly_els:
                    coords_els = self._find_elements_by_tag(poly_el, "coordinates")
                    if coords_els:
                        coord_str = coords_els[0].text.strip()
                        points_str = coord_str.split()
                        coords = []
                        for pt_str in points_str:
                            parts = pt_str.split(",")
                            if len(parts) >= 2:
                                try:
                                    lng = float(parts[0])
                                    lat = float(parts[1])
                                    coords.append((lng, lat))
                                except ValueError:
                                    continue
                        
                        if len(coords) >= 3:
                            poly = Polygon(coords)
                            loaded_zones.append({
                                "district_id": district_code,
                                "district_name": district_name,
                                "state_name": state_name,
                                "state_code": state_code,
                                "object_id": object_id,
                                "polygon": poly
                            })

            self.zones = loaded_zones
            logger.info(f"Loaded {len(self.zones)} GIS polygons successfully from {file_path}.")
            return len(self.zones)

        except Exception as exc:
            logger.error(f"Failed to load or parse GIS file {file_path}: {exc}")
            self.zones = []
            return 0

    def locate_point(self, coordinate: Coordinate) -> Dict[str, Any]:
        """
        Determines which KML/KMZ polygon contains the coordinate.
        Returns details of the matching district or an outside boundary result.
        """
        # Shapely Point uses (x, y) format which corresponds to (longitude, latitude)
        point = Point(coordinate.lng, coordinate.lat)

        for zone in self.zones:
            polygon = zone["polygon"]
            if polygon.contains(point):
                return {
                    "district_id": zone["district_id"],
                    "district_name": zone["district_name"],
                    "state_name": zone["state_name"],
                    "inside_boundary": True
                }

        # Fallback if outside all boundaries
        return {
            "district_id": "OUTSIDE",
            "district_name": "Outside Configured Boundaries",
            "state_name": "Unknown State",
            "inside_boundary": False
        }
