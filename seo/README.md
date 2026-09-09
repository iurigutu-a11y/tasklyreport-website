# Taskly multilingual SEO foundation

This directory is the source of truth for the localized SEO landing pages. The five landing-page families are live in Italian, English, German, Russian, and Romanian.

## URL policy

- Italian remains on the existing canonical paths in `locale-map.json`; do not create `/it/...` duplicates.
- Localized pages use a language prefix: `/en/<slug>/`, `/de/<slug>/`, `/ru/<slug>/`, and `/ro/<slug>/`.
- Additional locales follow the same prefix rule only when a real translated page is ready.
- The homepage may keep its current JavaScript language system. Search-intent landing pages must use separate, indexable locale URLs and must not switch language on one URL at runtime.

## Page template contract

Every localized page must have:

1. `html[lang]` matching its locale.
2. A self-referencing canonical URL.
3. `hreflang` links only for alternate pages that already exist and return HTTP 200.
4. No `/it/` alternate unless a real Italian `/it/` page is intentionally created; current Italian pages are the Italian alternates.
5. `x-default` only when a neutral landing page exists and is the deliberate default target.

Example for a future English page whose German version does not exist yet:

```html
<link rel="canonical" href="https://tasklyreport.com/en/job-report-app/">
<link rel="alternate" hreflang="en" href="https://tasklyreport.com/en/job-report-app/">
<link rel="alternate" hreflang="it" href="https://tasklyreport.com/rapportino-di-lavoro-app/">
```

Once the German page is live, add its two-way alternate links to both pages. Do not add a guessed or future URL just to complete a language matrix.

## Sitemap policy

Keep the current single `sitemap.xml` while the site is small. Add a localized URL only after the page is live, self-canonical, and linked from its real alternates. A sitemap index or locale-specific sitemaps are unnecessary until volume makes the single sitemap unwieldy.

`locale-map.json` provides the live slugs and keyword intent for the five page families. `validate-locale-architecture.py` checks all 25 localized pages, their reciprocal alternates, self-canonicals, language switches, internal links, and sitemap membership.

## Legacy crawl noise

`/cdn-cgi/l/email-protection` is Cloudflare's email-obfuscation service endpoint generated from `mailto:` links. It is not a content page and must be excluded by SEO validation/crawlers only; do not block or rewrite it in the site and do not change Cloudflare settings.
