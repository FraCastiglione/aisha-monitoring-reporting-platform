"""Embed the dashboard's three source JSON files into its existing script."""

import json
from pathlib import Path


root = Path(__file__).resolve().parents[1]
script = root / "assets" / "dashboard.js"
start = "/* DASHBOARD_DATA_START */"
end = "/* DASHBOARD_DATA_END */"
source = script.read_text(encoding="utf-8")
assert source.count(start) == source.count(end) == 1
before, remainder = source.split(start, 1)
_, after = remainder.split(end, 1)
data = {
    "source": json.loads((root / "assets" / "dashboard-catalogue.json").read_text(encoding="utf-8")),
    "data": json.loads((root / "dashboard-data.json").read_text(encoding="utf-8")),
    "detailData": json.loads((root / "assets" / "dashboard-detail.json").read_text(encoding="utf-8")),
}
payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
script.write_text(before + start + payload + end + after, encoding="utf-8")
