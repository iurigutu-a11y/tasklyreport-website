#!/usr/bin/env python3
"""Validate the multilingual SEO architecture and the pages currently shipped."""
import json
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://tasklyreport.com"
MAP = ROOT / "seo" / "locale-map.json"
EXCLUSIONS = ROOT / "seo" / "validation-exclusions.json"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.lang = None; self.title = ""; self.description = ""; self.h1 = ""; self.canonical = None; self.alternates = {}; self.links = []; self.capture = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html": self.lang = attrs.get("lang")
        if tag in ("title", "h1"): self.capture = tag
        if tag == "meta" and attrs.get("name") == "description": self.description = attrs.get("content", "")
        if tag == "link":
            rel = attrs.get("rel", "").split()
            if "canonical" in rel: self.canonical = attrs.get("href")
            if "alternate" in rel and attrs.get("hreflang"): self.alternates[attrs["hreflang"]] = attrs.get("href")
        if tag == "a" and attrs.get("href"): self.links.append(attrs["href"])
    def handle_data(self, data):
        if self.capture in ("title", "h1"): setattr(self, self.capture, getattr(self, self.capture) + data)
    def handle_endtag(self, tag):
        if tag == self.capture: self.capture = None

def page_path(site_path):
    path = site_path.lstrip("/")
    return ROOT / path / "index.html" if path.endswith("/") else ROOT / path

def site_path(href, source="/"):
    href = urljoin(BASE + source, href)
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc:
        return parsed.path or "/" if href.startswith(BASE) else None
    return parsed.path or "/"

def main():
    data = json.loads(MAP.read_text()); exclusions = json.loads(EXCLUSIONS.read_text())
    assert data["defaultLocale"] == "it" and data["italianCanonicalPolicy"] == "keep-existing-paths"
    assert "/cdn-cgi/l/email-protection" in {item["path"] for item in exclusions["nonContentPaths"]}
    families = {}
    for p in data["pages"]:
        families[p["id"]] = {"it": p["it"]["path"], "en": f"/en/{p['en']['slug']}/", "de": f"/de/{p['de']['slug']}/"}
    pages = {}
    for key, family in families.items():
        for locale, site in family.items():
            path = page_path(site); assert path.is_file(), f"missing page: {site}"
            parser = PageParser(); parser.feed(path.read_text()); pages[site] = parser
            assert parser.lang == locale, f"wrong lang on {site}: {parser.lang}"
            assert parser.title.strip() and parser.description.strip() and parser.h1.strip(), f"missing metadata on {site}"
            assert parser.canonical == BASE + site, f"canonical is not self-referencing: {site}"
            assert set(parser.alternates) == {"it", "en", "de"}, f"incomplete hreflang set: {site}"
            assert parser.alternates[locale] == BASE + site, f"missing self hreflang: {site}"
            for alt_locale, alt_url in parser.alternates.items(): assert alt_url == BASE + family[alt_locale], f"wrong {alt_locale} alternate on {site}"
    for site, parser in pages.items():
        for href in parser.links:
            target = site_path(href, site)
            if target is None or target.startswith("/cdn-cgi/") or href.startswith("#"): continue
            assert page_path(target).is_file(), f"broken internal link on {site}: {href}"
    root = ET.parse(ROOT / "sitemap.xml").getroot(); ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = {node.text for node in root.findall("sm:url/sm:loc", ns)}
    all_family_urls = {u for family in families.values() for u in family.values()}
    expected = {BASE + "/", *(BASE + u for u in all_family_urls), BASE + "/download.html", BASE + "/faq.html", BASE + "/support.html", BASE + "/privacy.html", BASE + "/terms.html"}
    assert expected <= locs, f"sitemap missing URLs: {sorted(expected - locs)}"; assert len(locs) == 21, f"unexpected sitemap count: {len(locs)}"
    print(f"locale architecture valid: {len(families)} families x 3 live locales")
    print(f"validated pages: {len(pages)}; reciprocal hreflang: it/en/de")
    print(f"sitemap valid: {len(locs)} URLs")

if __name__ == "__main__": main()
