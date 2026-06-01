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

- ❌ Does not scale; no navigation structure

**Verdict:** Does not meet must-have requirements.

---

### Option B – GitHub Wiki

**Description:** Activate the built-in GitHub Wiki on the Boxtribute repository.

- ✅ Basic non-tech editing via GitHub web UI
- ❌ Poor discoverability outside GitHub

**Verdict:** Does not meet must-have requirements.

---

### Option C – GitBook (SaaS, free Community/Sponsored plan for OSS/non-profits)

**Description:** GitBook is a cloud-hosted documentation platform with a WYSIWYG block editor. It offers two free options for qualifying open-source and non-profit organisations:

1. **Community Plan** (requires application and approval): Access to nearly all Ultimate plan features (except SAML SSO), including custom domains, custom branding, AI assistant, advanced analytics, and unlimited contributors.
2. **Sponsored Plan** (no application required): Free for open-source projects; includes custom domains, most features, but shows small ethical ads on the documentation site. Revenue from ads supports the project.

Key characteristics:
- Block-based WYSIWYG editor — non-tech friendly out of the box.
- Two-way GitHub sync — docs can live in the repo and be edited via GitBook UI.
- Fast full-text search built in.
- AI-powered search and content assistant.
- ✅ **Custom domain available on Community/Sponsored plans** (corrected from initial research).
- ✅ **Advanced analytics and site insights available on Community plan**.
- Custom fonts and branding (Community plan).
- Slack, GitHub, and Linear integrations.
- ❌ **No native offline / PWA support** — GitBook is a cloud-first platform and requires an active internet connection at all times. There is no service worker or PWA caching built in. Users can export to PDF for offline reading, but this is not the same as browsing cached pages offline.
- Not open source; vendor lock-in risk.

**Verdict:** GitBook's Community plan is significantly more capable than initially assessed—it includes custom domains, advanced analytics, and AI features. However, **it still fails the offline/low-connectivity requirement**, which is critical for aid workers in refugee camps with intermittent connectivity. Vendor lock-in remains a concern for a long-lived OSS project.

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

- ✅ Framework-agnostic component support
- ❌ Younger project with a smaller plugin ecosystem
- ❌ Team has no prior Astro experience (vs. React which is already used)

**Verdict:** Promising but less mature. Lacks the plugin ecosystem needed to satisfy all requirements today.

---

### Option F – VitePress (Vue-based)

**Description:** [VitePress](https://vitepress.dev/) is a Vue-powered static site generator optimised for speed.

- ❌ Vue ecosystem — Boxtribute frontend is React-based
- ❌ No versioning support

**Verdict:** Mismatch with existing React ecosystem; missing blog and offline features.

---

### Option G – Mintlify (SaaS)

**Description:** [Mintlify](https://mintlify.com/) is a developer-documentation SaaS with native OpenAPI support and built-in AI chat.

- ✅ AI chat / MCP support
- ❌ Primarily targeted at developer API docs — not general end-user guides
- ❌ Free plan is limited; advanced features require paid tiers
- ❌ Proprietary SaaS; vendor lock-in

**Verdict:** Strong for API docs but does not cover the non-developer audience Boxtribute needs to serve.

---

### Option H – MkDocs with Material theme (open-source static site generator)

**Description:** [MkDocs](https://www.mkdocs.org/) is a Python-based static site generator designed for project documentation. Combined with the popular [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme, it offers a polished documentation experience.

Key characteristics:
- ⚠️ Python-based — Boxtribute has Python in the backend, but frontend team is React-focused
- ❌ No equivalent to `@graphql-markdown/docusaurus` for GraphQL API docs
- ❌ No MCP server plugin
- ❌ Single maintainer, last release in Aug 2024; uncertainty about [version 2](https://github.com/mkdocs/mkdocs/discussions/4077)

**Verdict:** Strong contender with excellent PWA/offline support. However, less alignment with the React-based frontend team, less mature blog capabilities, and missing GraphQL documentation plugin make it slightly less optimal than Docusaurus for Boxtribute's specific needs.

---

### Option I – Read the Docs (open-source hosting platform)

**Description:** [Read the Docs](https://readthedocs.org/) is a leading platform for hosting documentation automatically built from Git repositories. Very popular in the Python ecosystem.

- ✅ Automatic builds on commit
- ✅ Version management (multiple doc versions per release)
- ❌ Primarily suited for technical reference docs, not user guides or case studies

**Verdict:** Excellent for open-source project reference docs but lacks offline support, blog features, and the flexibility needed for Boxtribute's diverse content requirements.

---

### Option J – BookStack (self-hosted open-source wiki)

**Description:** [BookStack](https://www.bookstackapp.com/) is a self-hosted, open-source wiki platform with a hierarchical book-chapter-page structure.

- ✅ WYSIWYG and Markdown editors — very non-tech friendly
- ✅ Fine-grained role-based permissions
- ❌ **Requires self-hosting** — adds maintenance burden (server, backups, updates)

**Verdict:** Excellent WYSIWYG editing and organisation, but requires ongoing server maintenance (counter to minimal tech maintenance requirement) and lacks offline support.

---

### Option K – Wiki.js (self-hosted open-source wiki)

**Description:** [Wiki.js](https://js.wiki/) is a modern, lightweight, open-source wiki engine built on Node.js.

- ✅ WYSIWYG, Markdown, and code editors
- ✅ Git sync for content versioning
- ✅ Granular permissions and SSO support

**Verdict:** Feature-rich wiki with good analytics and theming, but requires self-hosting and lacks offline support.

---

### Option L – Outline (open-source knowledge base)

**Description:** [Outline](https://www.getoutline.com/) is a beautifully designed, team-focused knowledge base with real-time collaboration, available as self-hosted or cloud.

- ✅ Modern, fast UI with WYSIWYG editing
- ✅ Real-time collaboration
- ✅ Slack integrations
- ⚠️ Cloud version available (paid) or self-hosted (free but requires maintenance)
- ❌ No public-facing docs site out of the box (primarily for internal wikis)

**Verdict:** Excellent for internal team knowledge bases but not designed as a public-facing documentation site. Lacks offline support and blog functionality.

---

### Option M – Notion (SaaS workspace with nonprofit discount)

**Description:** [Notion](https://www.notion.so/) is an all-in-one workspace popular for wikis, project management, and documentation. Offers 50% discount for nonprofits (via TechSoup).

- ✅ Extremely user-friendly for non-technical users
- ✅ Block-based editor, databases, templates
- ✅ Real-time collaboration
- ❌ Not open source
- ❌ Not designed for structured public documentation sites

**Verdict:** Great for internal wikis and team collaboration but not ideal for structured public-facing documentation. Still has ongoing cost even with nonprofit discount.

---

### Option N – Document360 (SaaS knowledge base)

**Description:** [Document360](https://document360.com/) is an AI-enhanced knowledge base platform for public and private documentation.

- ✅ Powerful Markdown editor
- ✅ Localisation features
- ❌ Commercial SaaS with limited free tier
- ❌ Not open source; vendor lock-in

**Verdict:** Feature-rich but commercial SaaS not aligned with Boxtribute's free/open-source requirement.

## Decision

**Adopt Docusaurus** as Boxtribute's public documentation platform.

### Summary of Options Evaluated

| Option | Free | Non-tech editing | Offline/PWA† | Search | Theming | Custom domain | Blog | Analytics | Self-hosted burden |
|--------|:----:|:----------------:|:------------:|:------:|:-------:|:-------------:|:----:|:---------:|:------------------:|
| A. Google Docs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | N/A |
| B. GitHub Wiki | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | N/A |
| **C. GitBook** | ✅* | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | N/A |
| **D. Docusaurus** | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| E. Starlight | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ⚠️ | N/A |
| F. VitePress | ✅ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ❌ | ⚠️ | N/A |
| G. Mintlify | ⚠️ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | N/A |
| H. MkDocs Material | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | N/A |
| I. Read the Docs | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | N/A |
| J. BookStack | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| K. Wiki.js | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| L. Outline | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ⚠️ |
| M. Notion | ⚠️ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | N/A |
| N. Document360 | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |

*Legend: ✅ = meets requirement, ⚠️ = partial/limited, ❌ = does not meet*

*\* GitBook Community plan requires application and approval*

*† PWA = Progressive Web App — a web application that uses service workers and modern browser APIs to cache content locally, enabling pages to load offline or in low-connectivity environments after a first visit.*

**Analytics column notes:**
- **C. GitBook**: Advanced analytics and site insights available on the Community plan.
- **D. Docusaurus**: Plausible Analytics integration (GDPR-compliant, cookie-free); configured via a script tag in `docusaurus.config.js`. Free self-hosted or paid cloud.
- **E. Starlight / F. VitePress / G. Mintlify**: No built-in analytics; external scripts (e.g. Plausible, Google Analytics) can be injected via head configuration.
- **H. MkDocs Material**: Supports Google Analytics, Plausible, and Matomo via built-in configuration.
- **I. Read the Docs**: Basic built-in page-view analytics; limited detail and not GDPR-focused.
- **J. BookStack**: No built-in analytics; requires external tools.
- **K. Wiki.js**: Built-in page-view analytics plus integrations with Google Analytics and Matomo.
- **L. Outline / M. Notion**: No analytics for public-facing pages.
- **N. Document360**: Built-in analytics included.

### Key Findings

**GitBook (Option C)** is more capable than initially assessed—the Community plan includes custom domains, advanced analytics, and AI features. However, its **lack of offline/PWA support is a critical blocker** for Boxtribute's use case (aid workers in refugee camps with intermittent connectivity).

**Docusaurus (Option D) and MkDocs Material (Option H)** are the only options that meet all must-have requirements, including offline/PWA caching. Docusaurus is preferred because:
1. **React alignment** — Boxtribute's frontend is React-based; Docusaurus uses React/MDX.
2. **Mature blog plugin** — Built-in, well-documented blog functionality.
3. **GraphQL API docs** — `@graphql-markdown/docusaurus` plugin can generate docs from the existing schema.
4. **MCP integration** — `docusaurus-plugin-mcp-server` available for AI assistant context.
5. **Ecosystem** — Larger community, more themes, more plugins.

### Implementation Plan

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
