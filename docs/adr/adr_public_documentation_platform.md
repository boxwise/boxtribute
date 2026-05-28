# ADR: Public Documentation Hosting Platform

Decision Deadline: 2025-07-15

Author: @pylipp

## Status

Proposed

## Context or Problem Statement

As a humanitarian-aid tech non-profit, Boxtribute needs a public-facing place to share documentation, FAQs, guides, case studies, and best practices about its web application. This knowledge hub should also be linked from within the app at the right touchpoints to guide users.

Currently, documentation is scattered (GitHub README files, internal wikis, ad-hoc Notion pages), there is no central and publicly accessible place for end-users or partner organisations to find help, and no structured way for non-technical team members to contribute content.

## Decision Drivers

1. **Non-tech editability** – content editors (operations, partnerships) must be able to add or modify pages without developer involvement.
2. **Tech maintenance burden** – the platform must require minimal ongoing effort from the engineering team.
3. **Free / affordable** – Boxtribute is an open-source non-profit; solutions must have a perpetually free or OSS plan.
4. **Anonymized visitor analytics** – GDPR-compliant, cookie-free tracking of page visits, clicks, and time on page.
5. **Search** – full-text search across all content.
6. **Theming / branding** – ability to match Boxtribute's visual identity.
7. **Offline / low connectivity caching** – aids deployed to refugee camps often work in low-connectivity environments; docs should be accessible after a first visit.
8. **Custom domain** – the docs site should live under a Boxtribute-owned domain.
9. **Blog / guides / case studies** – the platform must support rich long-form content, not only reference pages.
10. **"How to get in touch" page** – a static contact/support subpage.

Nice-to-have:
- Release log / What's New section.
- GraphQL API reference for developers.
- MCP (Model Context Protocol) integration so docs can be consumed by an AI assistant.

## Considered Options

### Option A – Google Doc / collection of Markdown links

**Description:** Use a shared Google Drive folder for guides and link to individual documents from the README or in-app tooltips.

- ✅ Zero setup cost, non-tech friendly
- ❌ No search across documents
- ❌ No branding / theming
- ❌ No offline support
- ❌ No analytics
- ❌ No custom domain
- ❌ Does not scale; no navigation structure

**Verdict:** Does not meet must-have requirements.

---

### Option B – GitHub Wiki

**Description:** Activate the built-in GitHub Wiki on the Boxtribute repository.

- ✅ Free, already available, markdown-based
- ✅ Basic non-tech editing via GitHub web UI
- ❌ Search is extremely limited (no full-text across all pages)
- ❌ No theming or branding at all
- ❌ No offline caching / PWA support
- ❌ No analytics
- ❌ Permanently on `github.com` — no custom domain
- ❌ No blog / guide section
- ❌ Poor discoverability outside GitHub

**Verdict:** Does not meet must-have requirements.

---

### Option C – GitBook (SaaS, free Community plan for OSS/non-profits)

**Description:** GitBook is a cloud-hosted documentation platform with a WYSIWYG block editor. It offers a free Community plan for qualifying open-source and non-profit organisations (requires an application and approval).

Key characteristics:
- Block-based WYSIWYG editor — non-tech friendly out of the box.
- Two-way GitHub sync — docs can live in the repo and be edited via GitBook UI.
- Fast full-text search built in.
- Reasonable theming (predefined themes, limited CSS customisation on free plan).
- Basic "site insights" on the free plan; **advanced analytics require a paid plan**.
- **No custom domain on the free plan** (forced `*.gitbook.io` subdomain).
- **No offline / PWA support** — requires an active internet connection at all times.
- Not open source; vendor lock-in risk.

**Verdict:** Fails the offline/low-connectivity requirement and the custom domain requirement on the free tier. Advanced analytics are behind a paywall. Vendor lock-in is a concern for a long-lived OSS project.

---

### Option D – Docusaurus (open-source static site generator)

**Description:** [Docusaurus](https://docusaurus.io/) is a React-based open-source static site generator maintained by Meta, widely adopted by major OSS projects (React, Jest, Redux, etc.). The generated site can be deployed as a static site on any host.

Key characteristics:

| Requirement | How Docusaurus addresses it |
|---|---|
| Free pricing | MIT license; hosting on Vercel (already used by Boxtribute for `boxtribute.org`) at zero cost |
| Search | Algolia DocSearch — free for qualifying OSS projects; full-text, instant |
| Theming / branding | Full React + CSS customisation; first-class dark mode; swizzling for component overrides |
| Offline / low-connectivity | Official `@docusaurus/plugin-pwa` adds a service worker; previously visited pages are served from cache |
| Custom domain | Full control; can live at `docs.boxtribute.org` |
| Blog / guides / case studies | Built-in blog plugin with tags, authors, pagination, RSS |
| FAQ / documentation | Core feature (docs plugin, sidebar navigation, versioning) |
| "How to get in touch" page | Any static page in MDX |
| Anonymized analytics | Plausible Analytics integration (GDPR compliant, cookie-free, script tag in `docusaurus.config.js`) — free self-hosted or paid cloud |
| Release log | Blog plugin doubles as a changelog; dedicated `changelog` page possible |
| GraphQL API docs | [`@graphql-markdown/docusaurus`](https://graphql-markdown.dev/) plugin generates docs from the existing GraphQL schema, complementing or replacing the current SpectaQL setup |
| MCP integration | [`docusaurus-plugin-mcp-server`](https://www.npmjs.com/package/docusaurus-plugin-mcp-server) exposes an MCP server endpoint so docs can be used as context for AI assistants |
| Hosting maintenance | Vercel CI/CD deploy on push; essentially zero ongoing ops |

**Non-technical editing:** The main trade-off is that content changes go through Git (markdown files in the repository). Non-tech editors can use the GitHub web UI to create/edit markdown files and open pull requests without touching the terminal. For teams that prefer a WYSIWYG interface, [Decap CMS](https://decapcms.org/) (formerly Netlify CMS, open-source) can be layered on top of Docusaurus to provide a browser-based editor backed by Git — no proprietary dependency. Alternatively, editors can draft in Google Docs and have a developer commit the markdown; the frequency of documentation updates at Boxtribute is low enough that this is manageable.

**Verdict:** Meets all must-have requirements. Covers all nice-to-have requirements with available plugins. Fits Boxtribute's existing infrastructure (Vercel, GitHub, React).

---

### Option E – Starlight (Astro-based)

**Description:** [Starlight](https://starlight.astro.build/) is a documentation framework built on Astro, gaining traction as an alternative to Docusaurus.

- ✅ Free, open-source
- ✅ Built-in search, dark mode, i18n
- ✅ Framework-agnostic component support
- ❌ Younger project with a smaller plugin ecosystem
- ❌ Team has no prior Astro experience (vs. React which is already used)
- ❌ No PWA/offline plugin as mature as Docusaurus's
- ❌ No equivalent to `@graphql-markdown/docusaurus`

**Verdict:** Promising but less mature. Lacks the plugin ecosystem needed to satisfy all requirements today.

---

### Option F – VitePress (Vue-based)

**Description:** [VitePress](https://vitepress.dev/) is a Vue-powered static site generator optimised for speed.

- ✅ Free, open-source, very fast builds
- ❌ Vue ecosystem — Boxtribute frontend is React-based
- ❌ No built-in blog plugin
- ❌ No versioning support
- ❌ No PWA plugin as capable as Docusaurus's

**Verdict:** Mismatch with existing React ecosystem; missing blog and offline features.

---

### Option G – Mintlify (SaaS)

**Description:** [Mintlify](https://mintlify.com/) is a developer-documentation SaaS with native OpenAPI support and built-in AI chat.

- ✅ Excellent API-docs experience
- ✅ AI chat / MCP support
- ❌ Primarily targeted at developer API docs — not general end-user guides
- ❌ Free plan is limited; advanced features require paid tiers
- ❌ No offline/PWA support
- ❌ Proprietary SaaS; vendor lock-in

**Verdict:** Strong for API docs but does not cover the non-developer audience Boxtribute needs to serve.

## Decision

**Adopt Docusaurus** as Boxtribute's public documentation platform.

The site will be:
- Maintained as a directory (e.g. `/docs-site`) inside the existing monorepo, or as a dedicated repository (`boxwise/docs`).
- Deployed to Vercel (already in use for `boxtribute.org`) under `docs.boxtribute.org`.
- Built and deployed automatically on every push to `main` via Vercel's GitHub integration.
- Tracked with Plausible Analytics (cookie-free, GDPR-compliant, anonymized).
- Equipped with `@docusaurus/plugin-pwa` for offline/low-connectivity caching.
- Integrated with Algolia DocSearch (free for OSS) for full-text search.

Content will be authored in Markdown/MDX and committed to Git. Non-technical team members will use the GitHub web UI for edits. If the editing friction proves too high after a trial period, Decap CMS will be evaluated as a WYSIWYG overlay.

The SpectaQL GraphQL API documentation workflow (built in CircleCI, hosted on GCloud) can be migrated or supplemented by the `@graphql-markdown/docusaurus` plugin at a later stage, consolidating all documentation into one place.

## Consequences

**Positive:**
- Single, searchable, branded, publicly accessible documentation hub.
- Full control over content, hosting, and data — no vendor lock-in.
- Offline caching satisfies the low-connectivity requirement for field teams.
- Docs live alongside code in Git, enabling code-review-style quality control and version history.
- Extensible: GraphQL API docs and MCP server can be added incrementally.
- Zero additional hosting cost (Vercel free tier).

**Negative / trade-offs:**
- Initial setup requires engineering effort (estimated 1–2 days to scaffold and configure).
- Non-technical editors must learn basic GitHub markdown editing or use the GitHub web UI; this is an unfamiliar workflow for some team members.
- Algolia DocSearch requires an application and review period for the free OSS plan.
- PWA offline cache only covers pages the user has already visited; first-time load requires connectivity.

**Out of scope for this ADR:**
- Specific information architecture / content structure of the docs site.
- Decision on monorepo vs. separate repo for the docs source.
- Migration timeline for existing SpectaQL API docs.
