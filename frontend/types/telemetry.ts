export interface VehicleTelemetry {
  id: number;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  battery_percentage: number;
  speed: number;
  motor_temperature: number;
  timestamp: string;
}

export interface VehicleTelemetryCreate {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  battery_percentage: number;
  speed: number;
  motor_temperature: number;
}