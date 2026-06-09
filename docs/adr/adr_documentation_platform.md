# ADR: Documentation and Knowledge-Base Platform for Boxtribute Users

Trello-card: N/A

Decision Deadline: N/A

Discussion Participants: @pylipp, @jdomnitz

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

[GitBook](https://www.gitbook.com) is a managed SaaS documentation platform with a browser-based WYSIWYG editor.

**Cost**: Free **Community Plan** for qualifying non-profits (requires application). Grants access to nearly all Ultimate-tier features (custom domain, advanced analytics, AI-powered search, theming, GitHub/GitLab sync, API playgrounds, adaptive content) with the sole exception of SAML SSO.

**Non-tech editing**: Native browser editor comparable to Notion. Non-technical content editors can create, reorder, and publish pages with no Markdown or Git knowledge. Supports content blocks, embeds, callouts, tables, and reusable content snippets.

**Search**: Built-in full-text search and AI-powered semantic answers (included in Community plan).

**Theming / branding**: Custom primary colours, logo, favicon, font, and header/footer links.

**Custom domain**: Fully supported on the Community plan.

**Interactivity**: Expandable sections, tabs, hints, inline code runners, embeds (YouTube, Figma, Loom, etc.), and API playground for interactive API exploration. Supports MDX/custom components via GitHub sync.

**Analytics**: Native [Plausible Analytics](https://plausible.io) integration – cookieless, GDPR-compliant, no consent banner required, EU-hosted data.

**Self-hosted burden**: None – fully managed SaaS; zero infrastructure to maintain.

**Offline / PWA**: Not supported natively; no service-worker caching.

**MCP**: An official MCP server (`gitbook-mcp`) exists, enabling AI assistants (Claude, Copilot, etc.) to read and reason over the documentation.

**Setup time**: Hours to a couple of days to get a polished, branded, public site live.

---

### Option 2: Mintlify

[Mintlify](https://mintlify.com) is a SaaS platform primarily aimed at developer / API documentation, with a sleek out-of-the-box design.

**Cost**: Free tier for public repositories (up to 3 projects); paid plans from ~$150/month. No formal non-profit programme.

**Non-tech editing**: Primarily MDX / Git-based authoring. A web editor is available but the workflow is still code-centric; non-technical editors require developer support for all but the simplest changes.

**Search**: Built-in full-text search and AI chat assistant.

**Theming / branding**: Excellent – full colour, logo, font, and dark/light mode configuration via a declarative `docs.json`.

**Custom domain**: Supported on the free tier.

**Interactivity**: Rich built-in MDX components (cards, tabs, accordions, API playground, code groups).

**Analytics**: Basic analytics included; custom analytics (Plausible, etc.) injectable via scripts.

**Self-hosted burden**: None.

**Offline / PWA**: Not natively supported; would require manual engineering.

**Setup time**: 1–2 days for a developer to configure; ongoing edits require developer involvement.

**Assessment**: Strong for developer-facing API docs but the Git-centric authoring model is a barrier for non-technical content editors, which is a primary requirement.

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

**Assessment**: Powerful but requires significant and ongoing developer investment; non-technical editing is not native.

---

### Option 4: MkDocs + Material for MkDocs

[MkDocs](https://www.mkdocs.org) with the [Material](https://squidfunk.github.io/mkdocs-material/) theme is a Python-based static-site generator.

**Cost**: Free (MIT); hosting on GitHub Pages / Netlify free tiers.

**Non-tech editing**: Markdown files in Git. No native browser editor; non-technical editors need Git access and training.

**Search**: Excellent built-in offline-capable search.

**Theming / branding**: Extensive Material theme customisation.

**Custom domain**: Yes.

**Interactivity**: Admonitions, tabs, expandable sections, mermaid diagrams; less React-rich than Docusaurus.

**Analytics**: External analytics injectable.

**Offline / PWA**: Native Material PWA plugin.

**Self-hosted burden**: Low (static files); Python toolchain required for builds.

**Setup time**: 1–2 days for developers; non-technical contributors still need Git/Markdown training.

**Assessment**: Excellent for developer-authored docs; editing barrier too high for non-technical contributors.

---

### Option 5: Starlight (Astro)

[Starlight](https://starlight.astro.build) is a modern documentation theme for the Astro framework.

**Cost**: Free (MIT); hosting on Vercel / Netlify free tiers.

**Non-tech editing**: Markdown / MDX in Git. No native CMS; same barrier as MkDocs/Docusaurus.

**Search**: Pagefind (built-in, excellent, offline-capable); Algolia option.

**Theming / branding**: CSS custom properties and component overriding.

**Custom domain**: Yes.

**Interactivity**: Astro Islands architecture for high-performance interactive components.

**Analytics**: Any analytics provider injectable.

**Offline / PWA**: Via Astro PWA integrations.

**Self-hosted burden**: Low (static files); newer ecosystem with some DIY.

**Setup time**: Several days for initial setup; non-technical editing requires additional CMS layer.

**Assessment**: Strong performance and modern DX; editing barrier is the same as other static generators.

---

### Option 6: Outline (self-hosted wiki)

[Outline](https://www.getoutline.com) is an open-source collaborative wiki (similar to Notion) that can be self-hosted.

**Cost**: Free to self-host (BSL / open-core licence); cloud plan ~$10/user/month.

**Non-tech editing**: Good WYSIWYG editor; user-friendly for team wikis.

**Search**: Full-text search.

**Theming / branding**: Limited customisation; not designed as a public-facing branded docs site.

**Custom domain**: Cloud plan or self-hosted.

**Interactivity**: Standard wiki blocks; not designed for rich end-user documentation experiences.

**Analytics**: Basic internal stats; external analytics possible.

**Offline / PWA**: Not a primary design goal.

**Self-hosted burden**: High – requires Docker, PostgreSQL, Redis, file storage, and ongoing server maintenance.

**Setup time**: Days for self-hosted; significant and ongoing infrastructure effort.

**Assessment**: Best suited for internal team knowledge bases, not for a polished public-facing product documentation site.

---

## Summary Comparison Table

| Criterion | GitBook (Community) | Mintlify (Free) | Docusaurus | MkDocs + Material | Starlight | Outline |
|---|---|---|---|---|---|---|
| **Financial cost** | Free (non-profit approved) | Free (public repos) | Free | Free | Free | Free (self-host) |
| **Non-tech editing** | ✅ Native WYSIWYG | ⚠️ Git/MDX-centric | ⚠️ Needs add-on CMS | ⚠️ Git/Markdown | ⚠️ Git/Markdown | ✅ WYSIWYG (internal) |
| **Offline / PWA** | ❌ None | ❌ None | ✅ Plugin | ✅ Plugin | ✅ Plugin | ❌ Limited |
| **Search** | ✅ Built-in + AI | ✅ Built-in + AI | ✅ Algolia / lunr | ✅ Built-in offline | ✅ Pagefind offline | ✅ Full-text |
| **Theming / branding** | ✅ Full (Community) | ✅ Excellent | ✅ Full (React) | ✅ Full (Material) | ✅ Full (CSS) | ⚠️ Limited |
| **Custom domain** | ✅ Yes | ✅ Yes (free) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Interactivity** | ✅ Rich blocks, API playground, embeds | ✅ MDX components, API playground | ✅ Full React | ⚠️ Moderate | ✅ Astro Islands | ⚠️ Basic |
| **Analytics (GDPR)** | ✅ Plausible (native) | ⚠️ Script injection | ⚠️ Script injection | ⚠️ Script injection | ⚠️ Script injection | ⚠️ Script injection |
| **Self-hosted burden** | ✅ None (SaaS) | ✅ None (SaaS) | ⚠️ CI/CD pipeline | ⚠️ CI/CD pipeline | ⚠️ CI/CD pipeline | ❌ Server + DB + Redis |
| **Time to set up** | ✅ Hours–days | ⚠️ 1–2 days (dev) | ⚠️ Several days | ⚠️ 1–2 days | ⚠️ Several days | ❌ Days + infra |
| **MCP integration** | ✅ Official server | ❌ None | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual | ❌ None |

Legend: ✅ Fully meets requirement · ⚠️ Partial / needs additional work · ❌ Not supported / significant gap

## Decision

**Adopt GitBook using the Community Plan (non-profit)** as Boxtribute's public-facing documentation and knowledge-base platform.

GitBook is the only evaluated option that simultaneously satisfies all primary decision drivers:

1. **Non-tech usability**: Native browser-based WYSIWYG editor with Notion-like UX – operations and partnerships staff can create and edit content immediately without any developer involvement.
2. **Minimal maintenance burden**: Fully managed SaaS; zero infrastructure for the engineering team to operate.
3. **Free for non-profits**: The Community Plan grants access to all premium features (custom domain, advanced analytics, AI search, theming, GitHub sync) after a one-time application approval.
4. **GDPR-compliant analytics**: Native Plausible Analytics integration – cookieless, no consent banner required, EU-hosted.
5. **Search**: Built-in full-text and AI-powered semantic search out of the box.
6. **Theming / branding**: Full colour, logo, and typography customisation.
7. **Custom domain**: Supported on the Community Plan.
8. **Interactivity**: Rich content blocks, expandable sections, embedded video (YouTube, Loom, Figma), API playground, and MDX custom components via GitHub sync.
9. **MCP**: Official MCP server (`gitbook-mcp`) allows AI assistants to read and reason over the documentation, satisfying the nice-to-have AI integration requirement.

The primary gap is **offline / PWA support**, which is not available on GitBook. This is noted as a nice-to-have for field workers in low-connectivity environments. This gap is accepted for the initial rollout; offline access can be addressed later via a Progressive Web App wrapper or a cached offline bundle generated from GitBook's Git export.

### Recommended implementation steps

1. Submit a GitBook Community Plan application for the Boxtribute organisation.
2. Create a new GitBook space, connect it to the `boxwise/boxtribute` (or a dedicated `boxwise/docs`) GitHub repository for version-controlled content sync.
3. Configure the custom domain (e.g. `docs.boxtribute.org`).
4. Enable Plausible Analytics integration within the GitBook dashboard.
5. Set up initial content structure: Getting Started, Features, FAQs, What's New.
6. Grant edit access to operations and partnerships team members; provide a short onboarding session on the GitBook editor.
7. Establish a lightweight content governance process (e.g. draft → review → publish workflow using GitBook's change-request feature).

## Consequences

**Easier**:
- Non-technical team members can create and update documentation without any developer involvement.
- Polished, branded public docs site is live in hours, not weeks.
- GDPR analytics compliance is handled out of the box; no cookie banner engineering required.
- AI-powered search and MCP integration are available immediately.
- All content is backed up in Git and editable via the GitHub sync if needed.

**More difficult / watch-outs**:
- Community Plan eligibility requires application approval from GitBook; if rejected, the paid Premium plan ($65/site/month) may be needed or an alternative (e.g. Docusaurus with a CMS) must be evaluated.
- Offline / PWA support is absent; if low-connectivity access proves critical in practice, a follow-up technical solution will be needed.
- GitBook is a commercial SaaS; changes to their pricing or Community Plan eligibility rules could affect future costs. Mitigation: content is mirrored in Git, enabling migration if needed.
- Deep customisation beyond GitBook's theming options requires MDX/code changes via Git sync (developer involvement), though this is only needed for edge cases.
