"""Build _meta/index.json from every <component>/component.md frontmatter.

Walks top-level directories of the repo, skips directories starting with `.` or `_`,
parses the YAML frontmatter from each `component.md`, and emits a single JSON catalog
the agent can read to filter components by domain / type / uipath-products / etc.

Run from the repo root:
    python _meta/build_index.py
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = REPO_ROOT / "_meta" / "index.json"

REQUIRED_FRONTMATTER = {
    "name",
    "type",
    "domain",
    "maturity",
    "languages",
    "uipath-products",
    "created",
    "contributors",
    "source-engagement",
}


def parse_frontmatter(md_path: Path) -> dict:
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{md_path} missing frontmatter delimiter")
    _, fm, _ = text.split("---", 2)
    data = yaml.safe_load(fm) or {}
    return data


def discover_components() -> list[dict]:
    entries: list[dict] = []
    errors: list[str] = []
    for child in sorted(REPO_ROOT.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith(".") or child.name.startswith("_"):
            continue
        component_md = child / "component.md"
        if not component_md.exists():
            errors.append(f"{child.name}: missing component.md")
            continue
        try:
            fm = parse_frontmatter(component_md)
        except Exception as exc:
            errors.append(f"{child.name}: {exc}")
            continue
        missing = REQUIRED_FRONTMATTER - fm.keys()
        if missing:
            errors.append(f"{child.name}: missing frontmatter keys {sorted(missing)}")
            continue
        fm["path"] = child.name
        entries.append(fm)
    if errors:
        sys.stderr.write("Index build errors:\n  " + "\n  ".join(errors) + "\n")
        sys.exit(1)
    return entries


def main() -> None:
    components = discover_components()
    catalog = {
        "generated": date.today().isoformat(),
        "count": len(components),
        "components": components,
    }
    INDEX_PATH.write_text(
        json.dumps(catalog, indent=2, default=str, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {INDEX_PATH.relative_to(REPO_ROOT)} with {len(components)} components.")


if __name__ == "__main__":
    main()
