# ADR: Documentation and Knowledge-Base Platform for Boxtribute Users

Trello-card: https://trello.com/c/uNLO1p1f

Decision Deadline: 2026-06-16

Discussion Participants: [Philipp Metzner](https://github.com/pylipp), [Roanna Kong](https://github.com/aerinsol)

## Status

Proposed

## Context or Problem Statement

As a humanitarian-aid tech non-profit, Boxtribute needs a central, publicly accessible place to provide structured contextual information to end users and partner organisations. This covers FAQs, guided training / microlearning, best practice, common scenarios, and traditional platform documentation.

Currently documentation is scattered across GitHub README files, internal wikis, and ad-hoc Notion pages. There is no central hub for end-users or partners to find help, and no structured way for non-technical team members (operations, partnerships) to contribute content without developer involvement.

The platform must serve two goals:
1. **Onboarding** – help new users quickly and effectively learn how to use Boxtribute to deliver their humanitarian programming.
2. **Operational support** – surface knowledge and solutions for users experiencing challenges in a medium that is easy to absorb and apply.

## Decision Drivers

1. **Non-tech usability** – content editors (operations, partnerships) must be able to add or modify pages without developer involvement; fast learning curve; support for versioning and interrelated content blocks.
2. **Tech maintenance burden** – minimal ongoing effort from the engineering team.
3. **Free / affordable** – must have a perpetually free or OSS plan suitable for a non-profit.
4. **Anonymized visitor analytics** – GDPR-compliant, cookie-free tracking of page visits, clicks, and time on page.
5. **Search** – full-text search across all content.
6. **Theming / branding** – ability to match Boxtribute's visual identity.
7. **Custom domain** – docs should live under a Boxtribute-owned domain.
8. **Interactivity and multimedia support** – clickable sections, embedded media, collapsible blocks to support engagement.

Nice-to-have:
- Offline / low-connectivity caching (PWA) for field workers in refugee camps.
- Release log / What's New section.
- GraphQL API reference for developers.
- MCP (Model Context Protocol) integration for AI-assistant consumption.
- SCORM/xAPI support for future LMS integration.

## Considered Options

### Option 1: GitBook (recommended)

[GitBook](https://www.gitbook.com) is a managed SaaS documentation platform with a browser-based WYSIWYG editor. Its rendering engine is open source (GPL v3); the content management back-end is proprietary SaaS.

**Cost**: Free **Community Plan** for qualifying non-profits and open-source projects (application required at gitbook.com/community). Grants access to nearly all Ultimate-tier features (custom domain, advanced analytics, AI-powered search, theming, GitHub/GitLab sync, API playgrounds, adaptive content) with the sole exception of SAML SSO. *Note: eligibility for a humanitarian NGO vs. a pure open-source software project should be confirmed with GitBook directly before adopting.*

**Non-tech editing**: Native block-based browser editor comparable to Notion. Non-technical content editors can create, reorder, and publish pages with no Markdown or Git knowledge. Supports content blocks, embeds, callouts, tables, and reusable content snippets.

**Search**: Built-in full-text search and AI-powered semantic answers ("Ask Eddy"), included in the Community plan.

**Theming / branding**: Custom primary colours, logo, favicon, font, and header/footer links. Full custom CSS injection is available on Business/Enterprise tiers; the Community plan provides constrained branding controls.

**Custom domain**: Fully supported on the Community plan.

**Interactivity**: Expandable sections, tabs, hints, inline code runners, embeds (YouTube, Figma, Loom, etc.), and API playground for interactive API exploration. Supports MDX/custom components via GitHub sync.

**Analytics**: GitBook does not provide a native Plausible/Fathom integration in the same way as Mintlify. On paid/community tiers, a Plausible tracking script can be injected via the Integrations settings tab, giving GDPR-compliant cookie-free analytics — but this is a configuration step rather than a one-click first-class integration, and plan-level availability should be verified.

**Self-hosted burden**: None – fully managed SaaS; zero infrastructure to maintain. (Technically, the rendering layer can be partially self-hosted via the GPL v3 open-source renderer, but the content back-end remains on GitBook.com.)

**Offline / PWA**: Not supported natively; no service-worker caching.

**MCP**: No official GitBook MCP server exists. A community-maintained third-party project (`gitbook-mcp` on GitHub) exposes GitBook's API over MCP, but it is not an officially supported integration.

**Setup time**: Hours to a couple of days to get a polished, branded, public site live.

---

### Option 2: Mintlify

[Mintlify](https://mintlify.com) is a fully managed docs-as-code SaaS platform primarily aimed at developer / API documentation, with a sleek out-of-the-box design and industry-leading AI/MCP integration.

**Cost**: Free "Starter" tier (1 editor seat, unlimited pages, `*.mintlify.app` subdomain). Custom domain and team collaboration require the Growth plan (~$150/month). **No formal non-profit programme is publicly documented**; Boxtribute should contact Mintlify sales to explore discounts.

**Non-tech editing**: A web editor at `app.mintlify.com` allows browser-based editing with preview. The experience is closer to "structured Markdown with a GUI" than a true WYSIWYG; non-technical editors can use it but may need orientation. The underlying content lives as MDX files in a GitHub repository.

**Search**: Built-in full-text semantic search out of the box. No external configuration required.

**Theming / branding**: Excellent — full colour palette (light/dark), logo, favicon, fonts, custom CSS, and custom JavaScript all configurable via `docs.json`. Stable CSS selectors (`data-component-name`) for reliable overrides.

**Custom domain**: Supported on Growth plan (~$150/month); not on the free Starter tier. This is a significant cost barrier without a non-profit discount.

**Interactivity**: Very rich — Tabs, Accordions, Code groups, Mermaid diagrams, OpenAPI playground, Cards, Steps, embedded videos, and full React/MDX components.

**Analytics**: The strongest of all evaluated hosted platforms. First-class native integrations for **Plausible** (cookie-free, GDPR-compliant), **Fathom** (cookie-free, GDPR-compliant), PostHog, Pirsch, Amplitude, Heap, Mixpanel, Segment, and others — all configured via a single `docs.json` field. No consent banner required when using Plausible or Fathom.

**Self-hosted burden**: None — fully managed SaaS.

**Offline / PWA**: Not natively supported.

**MCP**: **Industry-leading.** Two official MCP servers: (1) a read-only **Search MCP** hosted at `/mcp` on the docs domain, allowing AI tools (Claude, Cursor, ChatGPT) to search and retrieve published content; (2) a write-access **Admin MCP** at `mcp.mintlify.com` enabling AI tools to create/edit pages and update configuration. Mintlify also auto-generates `llms.txt` and `llms-full.txt` at the site root for LLM indexing.

**Setup time**: Under 30 minutes from sign-up to live site.

**Assessment**: Technically the strongest all-round hosted platform (analytics, MCP, setup speed), but the cost model is a barrier — custom domain requires ~$150/month without a non-profit agreement. Also primarily designed for developer/API documentation, which may not perfectly serve Boxtribute's mixed-audience knowledge base.

---

### Option 3: Docusaurus

[Docusaurus](https://docusaurus.io) (Meta, MIT) is an open-source static-site generator built on React.

**Cost**: Free (MIT); hosting on GitHub Pages / Netlify / Vercel free tiers.

**Non-tech editing**: Markdown / MDX files committed to Git. Third-party CMS front-ends (Editsaurus, Holocron, Spinal) can add a browser editor layer but require additional setup and maintenance.

**Search**: Algolia DocSearch (free for OSS) or local lunr.js plugin.

**Theming / branding**: Full via CSS variables and custom React components.

**Custom domain**: Yes.

**Interactivity**: Full React component support, rich MDX.

**Analytics**: Any analytics provider injectable.

**Offline / PWA**: Official `@docusaurus/plugin-pwa`.

**Self-hosted burden**: Low (static files); but CI/CD pipeline, build tooling, and theming require developer effort to establish and maintain.

**Setup time**: Several days of developer work for initial setup, theming, CI, and CMS integration.

**MCP / AI**: No native MCP server; sitemap.xml is auto-generated, enabling LLM crawling, but not MCP protocol.

**Assessment**: Powerful but requires significant and ongoing developer investment; non-technical editing is not native.

---

### Option 4: MkDocs + Material for MkDocs

[MkDocs](https://www.mkdocs.org) with the [Material](https://squidfunk.github.io/mkdocs-material/) theme is a Python-based static-site generator (MIT licence).

**Cost**: Free (MIT). Community features are fully featured. An optional "Insiders" tier (GitHub Sponsors, from ~$15/month) unlocks additional premium features (social cards, privacy plugin, etc.) that eventually ship to the community release.

**Non-tech editing**: Pure Markdown files committed to Git. No built-in web editor. Non-technical editors must use GitHub's web editor or a separately configured headless CMS. This is a significant barrier.

**Search**: Excellent built-in client-side lunr.js search with language support and highlighting. Works completely offline without any third-party service — verified from source as "privacy-respecting" and offline-capable by default.

**Theming / branding**: Extensive Material Design customisation via `mkdocs.yml` (colors, fonts, logo, dark/light mode) and custom CSS overrides. Professional look without custom CSS.

**Custom domain**: Yes, free on GitHub Pages / Netlify / Vercel.

**Interactivity**: Admonitions, tabs, expandable sections, Mermaid diagrams, math (MathJax/KaTeX), grids, cards. Less React-rich than Docusaurus but covers most documentation needs.

**Analytics**: Google Analytics 4 natively; any other provider (Plausible, Fathom, Umami) via a small custom `overrides/analytics/custom.html` partial. The Insiders privacy plugin can auto-download and self-host all external assets (fonts, scripts) to eliminate third-party requests entirely.

**Offline / PWA**: Native built-in offline plugin (since v9.0.0) for distributing documentation offline; the client-side lunr.js search also works fully offline.

**Self-hosted burden**: Minimal — `pip install mkdocs-material && mkdocs build` produces a static folder. GitHub Actions handles builds automatically.

**Setup time**: ~2–4 hours for a developer. Non-technical contributors still need Git/Markdown training.

**MCP / AI**: No native MCP server; static `llms.txt` can be manually added.

**Assessment**: The best offline/search experience of all evaluated options. Editing barrier remains too high for non-technical contributors without additional CMS tooling.

---

### Option 5: Starlight (Astro)

[Starlight](https://starlight.astro.build) is an Astro-based documentation framework (MIT licence). It generates fully static sites with built-in Pagefind search, i18n support, and an accessibility-first design.

**Cost**: Free (MIT). Hosting free on Netlify / Vercel / GitHub Pages / Cloudflare Pages.

**Non-tech editing**: MDX files in Git. No native browser editor; same barrier as MkDocs/Docusaurus. Can be paired with a Git-based CMS (Keystatic, Decap CMS) but requires additional developer setup.

**Search**: **Pagefind built-in** — static, local, privacy-respecting, fully offline-capable, no API keys or external services required. Algolia DocSearch is also available as an alternative plugin.

**Theming / branding**: CSS custom properties (`--sl-font`, `--sl-color-accent`, etc.), custom logo (light/dark), custom CSS files, custom fonts. Component overriding for advanced customisation.

**Custom domain**: Yes, free on any static host.

**Interactivity**: Astro Islands architecture — arbitrary React/Vue/Svelte components can be embedded, making this the most flexible for interactive content. Mermaid via community plugin, callout/aside components, tabbed content.

**Analytics**: Full control via Astro `<head>` injection; Plausible, Fathom, Umami all work. Astro's `partytown` integration can isolate analytics scripts in a web worker to improve performance.

**Offline / PWA**: Supported via `@vite-pwa/astro` integration; Pagefind search works offline once cached.

**Self-hosted burden**: Minimal — Node.js build, static HTML output.

**Setup time**: ~2–4 hours for a developer.

**MCP / AI**: No native MCP server; Pagefind index could theoretically be wrapped, but not out-of-box.

**Assessment**: Strongest offline/interactivity combination of the static generators; newer ecosystem means more DIY. Editing barrier is the same as other static generators.

---

### Option 6: Outline (self-hosted wiki)

[Outline](https://www.getoutline.com) is an open-source collaborative wiki (Prosemirror-based WYSIWYG, similar to Notion). Licensed under **BSL 1.1** (Business Source License — not OSI-approved; free for non-commercial self-hosting, but legal interpretation for humanitarian NGOs should be confirmed).

**Cost**: Self-hosted: free under BSL 1.1 (non-commercial). Cloud: ~$10/user/month (Business plan). No formal non-profit programme documented.

**Non-tech editing**: Excellent WYSIWYG editor — non-technical team members can write and organise content in collections with no training. However, Outline is designed as an *internal* team wiki, not a public-facing branded documentation site.

**Search**: Built-in full-text search (PostgreSQL full-text on the back-end).

**Theming / branding**: Limited — custom logo and basic colour accent only. Not designed for a branded public help centre; extensive customisation requires source code modification.

**Custom domain**: Self-hosted: yes. Cloud Business plan: yes.

**Interactivity**: Rich editor blocks — images, tables, checklists, embeds (YouTube, Figma, Loom), link previews, collaborative real-time editing.

**Analytics**: Cloud: admin-level only, not configurable by operators. Self-hosted: analytics scripts can be added via source-level modification only.

**Offline / PWA**: React SPA with no documented PWA or service-worker offline mode. Not suitable for field use.

**Self-hosted burden**: **High** — full application stack required: Node.js, PostgreSQL, Redis, S3-compatible storage, SMTP server, reverse proxy. Significant DevOps expertise and ongoing maintenance needed.

**Setup time**: Cloud ~2 hours; self-hosted: several days to weeks for a production-grade deployment.

**MCP / AI**: No MCP server; REST API only.

**Assessment**: Best suited for internal team knowledge bases. The combination of high self-hosting burden, limited public-facing branding, BSL licence ambiguity, and no PWA support makes this a poor fit for Boxtribute's requirements.

---

## Summary Comparison Table

| Criterion | GitBook (Community) | Mintlify (Growth) | Docusaurus | MkDocs + Material | Starlight | Outline |
|---|---|---|---|---|---|---|
| **Financial cost** | Free if approved (non-profit) | ~$150/month (no non-profit plan) | Free | Free | Free | Free (self-host, BSL 1.1) |
| **Non-tech editing** | ✅ Native WYSIWYG | ⚠️ Structured Markdown GUI | ⚠️ Needs add-on CMS | ⚠️ Git/Markdown | ⚠️ Git/Markdown | ✅ WYSIWYG (internal wiki) |
| **Offline / PWA** | ❌ None | ❌ None | ✅ Official plugin | ✅ Native built-in plugin | ✅ Via Astro PWA | ❌ None |
| **Search** | ✅ Built-in + AI | ✅ Built-in semantic | ✅ Algolia / lunr | ✅ Built-in offline (lunr) | ✅ Pagefind offline | ✅ Full-text (PostgreSQL) |
| **Theming / branding** | ✅ Good (constrained CSS) | ✅ Excellent | ✅ Full React theming | ✅ Full Material theming | ✅ Good (CSS properties) | ⚠️ Limited |
| **Custom domain** | ✅ Community plan | ✅ Growth plan ($150/mo) | ✅ Free | ✅ Free | ✅ Free | ✅ Self-host / paid cloud |
| **Interactivity** | ✅ Rich blocks, embeds, API playground | ✅ MDX components, API playground | ✅ Full React | ⚠️ Moderate (no React) | ✅ Astro Islands (any framework) | ⚠️ Wiki blocks only |
| **Analytics (GDPR)** | ⚠️ Via script injection (plan-dependent) | ✅ **Native** Plausible + Fathom | ✅ Full control (custom config) | ✅ Full control (custom partial) | ✅ Full control (Astro head) | ⚠️ Self-host source only |
| **Self-hosted burden** | ✅ None (SaaS) | ✅ None (SaaS) | ✅ Minimal (static + CI) | ✅ Minimal (static + CI) | ✅ Minimal (static + CI) | ❌ High (Node + PostgreSQL + Redis + S3) |
| **Time to set up** | ✅ Hours | ✅ < 30 minutes | ⚠️ Several days (dev) | ⚠️ 2–4 hours (dev) | ⚠️ 2–4 hours (dev) | ⚠️ Hours (cloud) / weeks (self-host) |
| **MCP / AI** | ⚠️ Community third-party only | ✅ **Two official MCPs + llms.txt** | ❌ None native | ❌ None native | ❌ None native | ❌ None |

Legend: ✅ Fully meets requirement · ⚠️ Partial / needs additional work · ❌ Not supported / significant gap

## Decision

**Adopt GitBook using the Community Plan (non-profit)** as Boxtribute's public-facing documentation and knowledge-base platform, contingent on successful Community Plan approval.

GitBook uniquely satisfies the two most critical decision drivers simultaneously:
1. **Non-tech usability**: The native WYSIWYG browser editor means operations and partnerships staff can create and edit content immediately, with no Markdown, Git, or developer involvement.
2. **Minimal maintenance burden**: Fully managed SaaS — zero infrastructure for the engineering team to operate or maintain.

No other option satisfies both. Mintlify comes closest on technical features (superior GDPR analytics, industry-leading MCP) but lacks a non-profit pricing programme and requires ~$150/month for custom domain access. The static-site generators (Docusaurus, MkDocs, Starlight) offer offline/PWA support and full analytics control but all require developer involvement for both initial setup and ongoing content authoring.

The primary gaps relative to the decision drivers are:

- **GDPR analytics**: GitBook does not have a native one-click Plausible integration comparable to Mintlify's. A Plausible tracking script can be injected via the Integrations settings on the Community plan; plan-level availability should be confirmed during onboarding.
- **MCP**: No official GitBook MCP server exists. A community third-party project (`gitbook-mcp`) exposes GitBook's API over MCP as a workaround.
- **Offline / PWA**: Not available; accepted as a nice-to-have for the initial rollout.

**Fallback**: If the GitBook Community Plan application is rejected, the recommended alternative is **Docusaurus** (or MkDocs Material) hosted on Netlify/GitHub Pages (free), paired with a Git-based CMS overlay (e.g. Decap CMS / Keystatic) to reduce the editing barrier, and a Plausible script injection for analytics. This requires a one-time developer investment of ~1–2 weeks but has zero ongoing cost and full feature control.

### Recommended implementation steps

1. Contact GitBook (gitbook.com/community) and submit a Community Plan application for the Boxtribute non-profit organisation.
2. Confirm that Plausible Analytics can be injected under the Community plan before fully committing.
3. Create a new GitBook space, connect it to the `boxwise/boxtribute` (or a dedicated `boxwise/docs`) GitHub repository for version-controlled content sync.
4. Configure the custom domain (e.g. `docs.boxtribute.org`).
5. Enable Plausible Analytics via the GitBook Integrations settings.
6. Set up initial content structure: Getting Started, Features, FAQs, What's New.
7. Grant edit access to operations and partnerships team members; provide a short onboarding session on the GitBook editor.
8. Establish a lightweight content governance process (e.g. draft → review → publish workflow using GitBook's change-request feature).

## Consequences

**Easier**:
- Non-technical team members can create and update documentation without any developer involvement.
- Polished, branded public docs site is live in hours, not weeks.
- All content is version-controlled in Git via GitHub sync, enabling migration to another platform if needed.
- Built-in AI-powered search (Ask Eddy) is available immediately without configuration.

**More difficult / watch-outs**:
- **Community Plan eligibility is not guaranteed.** If the application is rejected, the paid Premium plan ($65/site/month) or the static-site fallback (Docusaurus + CMS) must be evaluated.
- **GDPR analytics requires a setup step.** Plausible is not a native one-click integration in GitBook; it requires injecting a script via the Integrations settings. Plan-level availability and exact steps must be confirmed during onboarding.
- **MCP is community-maintained, not official.** The third-party `gitbook-mcp` server may lag behind GitBook API changes. If MCP integration becomes a firm requirement, Mintlify should be re-evaluated.
- **Offline / PWA support is absent.** If low-connectivity field access proves critical in practice, a follow-up technical solution will be needed (e.g. a PWA shell wrapping GitBook's Git-exported static content).
- **GitBook is a commercial SaaS.** Changes to pricing or Community Plan eligibility rules could affect future costs. Mitigation: content is mirrored in Git, enabling migration at low cost.
- **Advanced branding requires Business tier or Git sync.** Deep CSS customisation beyond GitBook's theming panel requires MDX/code changes via Git sync (developer involvement), though this is only needed for edge cases.
