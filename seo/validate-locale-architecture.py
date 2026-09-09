#!/usr/bin/env python3
"""Validate the locale plan without requiring any localized pages to exist yet."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "seo" / "locale-map.json"
EXCLUSIONS = ROOT / "seo" / "validation-exclusions.json"


def main() -> None:
    data = json.loads(MAP.read_text())
    exclusions = json.loads(EXCLUSIONS.read_text())
    locales = data["locales"]
    assert data["defaultLocale"] == "it"
    assert data["italianCanonicalPolicy"] == "keep-existing-paths"
    assert "/cdn-cgi/l/email-protection" in {
        item["path"] for item in exclusions["nonContentPaths"]
    }

    ids = set()
    for page in data["pages"]:
        assert page["id"] not in ids, f"duplicate page id: {page['id']}"
        ids.add(page["id"])
        assert page["it"]["path"].startswith("/")
        assert "/it/" not in page["it"]["path"]
        slugs = set()
        for locale in locales:
            entry = page[locale]
            assert entry["slug"] and not entry["slug"].startswith("/"), (
                f"invalid {locale} slug for {page['id']}"
            )
            assert entry["slug"] not in slugs, f"duplicate slug in {page['id']}"
            slugs.add(entry["slug"])

    print(f"locale architecture valid: {len(data['pages'])} pages x {len(locales)} future locales")
    print("no /it/ duplicate namespace; current Italian paths remain primary")
    print("Cloudflare email-protection endpoint excluded as non-content")


if __name__ == "__main__":
    main()
