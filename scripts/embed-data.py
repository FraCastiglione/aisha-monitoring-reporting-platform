"""Bundle public dashboard JSON for browsers that block runtime fetches."""

import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = {
    "catalogue": root / "assets/dashboard-catalogue.json",
    "snapshot": root / "dashboard-data.json",
    "detail": root / "assets/dashboard-detail.json",
}
data = {name: json.loads(path.read_text(encoding="utf-8")) for name, path in files.items()}
payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
(root / "assets/embedded-data.js").write_text(
    "// Generated from the public dashboard JSON files by scripts/embed-data.py.\n"
    f"window.AISHA_EMBEDDED_DATA = Object.freeze({payload});\n",
    encoding="utf-8",
)
