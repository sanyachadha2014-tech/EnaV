"""
Swytchcode Service Integration (Backend)
========================================
Integrates the Swytchcode CLI kernel for AI-driven emergency incident triage & severity analysis.
Uses `mistral.classification.create` via Swytchcode without mocking or fake data.
"""

import os
import json
import logging
import shutil
import subprocess
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SwytchcodeService:
    """
    Client for executing Swytchcode kernel tools (Mistral AI).
    """
    def __init__(self, cli_bin: Optional[str] = None, cwd: Optional[str] = None):
        # Resolve swytchcode binary from PATH or common Windows npm location
        self.cli_bin = (
            cli_bin
            or shutil.which("swytchcode.cmd")
            or shutil.which("swytchcode")
            or r"C:\Users\psing\AppData\Roaming\npm\swytchcode.cmd"
        )
        # Working directory containing .swytchcode configuration
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        enav_dir = os.path.dirname(backend_dir)
        ev_dir = os.path.join(enav_dir, "ev-route-optimizer")
        if cwd:
            self.cwd = cwd
        elif os.path.exists(os.path.join(ev_dir, ".swytchcode")):
            self.cwd = ev_dir
        else:
            self.cwd = backend_dir

    def _exec_swytchcode(self, args: list, timeout: float = 15.0) -> Dict[str, Any]:
        """
        Executes a tool command via the Swytchcode CLI with non-blocking stdin and sanitized output.
        """
        if not self.cli_bin or not os.path.exists(self.cli_bin):
            logger.error("Swytchcode CLI binary not found on system.")
            return {
                "status": "error",
                "error": "Swytchcode CLI binary not found on system.",
                "category": "execution"
            }

        cmd = [self.cli_bin, "exec"] + args + ["--json"]
        logger.info(f"Swytchcode Executing: {' '.join(args[:2])} (cwd={self.cwd})")

        try:
            res = subprocess.run(
                cmd,
                cwd=self.cwd,
                stdin=subprocess.DEVNULL,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout
            )

            sanitized_err = (res.stderr or "").replace("\n", " ").strip()

            if res.returncode != 0:
                logger.warning(f"Swytchcode tool failed (exit {res.returncode}): {sanitized_err[:300]}")
                # Parse JSON error from stderr if available
                err_msg = sanitized_err
                try:
                    for line in res.stderr.splitlines():
                        line = line.strip()
                        if line.startswith("{") and line.endswith("}"):
                            parsed_err = json.loads(line)
                            if "error" in parsed_err:
                                err_msg = parsed_err["error"]
                                break
                except Exception:
                    pass

                return {
                    "status": "error",
                    "exit_code": res.returncode,
                    "error": err_msg or f"Swytchcode exited with code {res.returncode}",
                    "provider": "Swytchcode → Mistral"
                }

            output_str = res.stdout.strip()
            if not output_str:
                return {
                    "status": "error",
                    "error": "Empty response received from Swytchcode",
                    "provider": "Swytchcode → Mistral"
                }

            parsed = json.loads(output_str)
            return {"status": "success", "data": parsed}

        except subprocess.TimeoutExpired:
            logger.error("Swytchcode tool execution timed out (>15s).")
            return {
                "status": "error",
                "error": "Swytchcode execution timed out after 15 seconds.",
                "provider": "Swytchcode → Mistral"
            }
        except Exception as exc:
            logger.error(f"Swytchcode execution exception: {exc}")
            return {
                "status": "error",
                "error": str(exc),
                "provider": "Swytchcode → Mistral"
            }

    def classify_incident_mistral(
        self,
        incident_type: str,
        description: str,
        severity: str = "high"
    ) -> Dict[str, Any]:
        """
        Invokes `mistral.classification.create` via Swytchcode using real incident description.
        Returns the real Mistral classification, priority, and risk indicators without mock data.
        """
        body = {
            "model": "mistral-moderation-latest",
            "input": [
                {
                    "role": "user",
                    "content": f"Emergency Category: {incident_type}. Description: {description}"
                }
            ]
        }

        exec_res = self._exec_swytchcode([
            "mistral.classification.create",
            "--body", json.dumps(body)
        ])

        if exec_res.get("status") == "success":
            raw_parsed = exec_res.get("data", {})
            status_code = raw_parsed.get("status_code", 200)
            if status_code != 200:
                err_data = raw_parsed.get("data", {})
                err_msg = err_data.get("message") if isinstance(err_data, dict) else str(err_data)
                return {
                    "provider": "Swytchcode → Mistral",
                    "status": "error",
                    "error": f"Mistral HTTP {status_code}: {err_msg}",
                    "model": "mistral-moderation-latest",
                    "flagged_high_risk": None,
                    "high_risk_indicators": [],
                    "ai_triage_category": incident_type,
                    "recommended_priority": severity
                }

            data = raw_parsed.get("data", raw_parsed)
            results = data.get("results", [])
            categories = results[0].get("categories", {}) if results else {}
            category_scores = results[0].get("category_scores", {}) if results else {}
            flagged = any(v is True for v in categories.values()) if categories else False

            # Identify high risk categories
            high_risk_indicators = [
                k.replace("_", " ").title() for k, v in categories.items() if v
            ]

            return {
                "provider": "Swytchcode → Mistral",
                "status": "live",
                "model": data.get("model", "mistral-moderation-latest"),
                "classification_id": data.get("id"),
                "flagged_high_risk": flagged,
                "high_risk_indicators": high_risk_indicators,
                "categories": categories,
                "category_scores": category_scores,
                "ai_triage_category": incident_type.upper(),
                "recommended_priority": "critical" if flagged else severity,
                "summary": f"Mistral live moderation: {incident_type.upper()}" + (" (HIGH RISK FLAGGED)" if flagged else " (Normal risk verified)")
            }

        # Real error reporting - no silent mock data
        return {
            "provider": "Swytchcode → Mistral",
            "status": "error",
            "error": exec_res.get("error", "Unknown Swytchcode execution error"),
            "exit_code": exec_res.get("exit_code"),
            "model": "mistral-moderation-latest",
            "flagged_high_risk": None,
            "high_risk_indicators": [],
            "ai_triage_category": incident_type,
            "recommended_priority": severity
        }

_instance: Optional[SwytchcodeService] = None

def get_swytchcode_service() -> SwytchcodeService:
    global _instance
    if _instance is None:
        _instance = SwytchcodeService()
    return _instance
