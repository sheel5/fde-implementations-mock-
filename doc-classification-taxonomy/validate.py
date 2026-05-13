"""Validate a taxonomy.json: tree shape, unique node paths, descriptions present.

Usage:
    python validate.py taxonomy.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def walk(node: dict, prefix: str, errors: list[str], seen: set[str]) -> None:
    for key, value in node.items():
        path = f"{prefix}.{key}" if prefix else key
        if path in seen:
            errors.append(f"duplicate node path: {path}")
        seen.add(path)
        if not isinstance(value, dict):
            errors.append(f"{path}: node must be an object, got {type(value).__name__}")
            continue
        if "description" not in value:
            errors.append(f"{path}: missing description")
        children = value.get("children", {})
        if children and not isinstance(children, dict):
            errors.append(f"{path}.children: must be an object")
            continue
        walk(children, path, errors, seen)


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    path = Path(argv[1])
    data = json.loads(path.read_text(encoding="utf-8"))
    root = data.get("root")
    if not isinstance(root, dict):
        print("error: missing or invalid `root` object", file=sys.stderr)
        return 1
    errors: list[str] = []
    walk(root, "", errors, set())
    if errors:
        print("Validation failed:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
