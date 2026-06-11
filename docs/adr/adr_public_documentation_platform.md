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

### Category A: E-Learning Authoring Tools (Interactive Learning Focus)

#### 1. Genially
- **Description**: Interactive presentation and e-learning platform with visual editor
- **Pricing**: $30/year nonprofit discount via TechSoup (budget \<$1M); 85% discount for larger orgs. Free tier available with limitations.
- **Strengths**: 1000+ templates, branching scenarios, quizzes, gamification, SCORM export (higher tiers), AI-assisted editing, analytics
- **Weaknesses**: Not designed as documentation platform; limited search across content; hosted solution

#### 2. Compozer
- **Description**: E-learning authoring tool with drag-and-drop interface
- **Pricing**: Freemium (A$0/mo, 1 course); Lite A$19/mo; Grow A$49/mo; Pro A$99/mo
- **Strengths**: 100+ templates, quiz engine, SCORM/xAPI export, white labeling, mobile-friendly
- **Weaknesses**: Limited complex branching; not a documentation platform; primarily course-focused

#### 3. Raptivity
- **Description**: Interactive e-learning content creation tool
- **Pricing**: $30/month; $199/year annual subscription
- **Strengths**: 200+ interaction templates, quizzes/knowledge checks, gamification, no coding required
- **Weaknesses**: No free tier; focused on learning objects not documentation; limited integration options

### Category B: Documentation Platforms

#### 4. GitBook
- **Description**: Cloud-based documentation platform with clean editor
- **Pricing**: Free Basic plan; Community plan (free for qualifying nonprofits/OSS with Ultimate features); Premium $65/mo/site; Ultimate $249/mo/site
- **Strengths**: WYSIWYG + Markdown, real-time collaboration, GitHub sync, custom domains (paid), built-in analytics, AI-powered features
- **Weaknesses**: Limited interactivity; no branching scenarios; paid tiers required for full customization

#### 5. Docusaurus
- **Description**: Open-source static site generator by Meta
- **Pricing**: Free (self-hosted)
- **Strengths**: Fully customizable (React-based), PWA plugin for offline, full-text search (Algolia), version control, GraphQL API docs support, MCP integration possible
- **Weaknesses**: Requires developer setup; Git-based workflow; no built-in analytics (needs Plausible/Fathom integration); no native interactive learning features

#### 6. Notion
- **Description**: All-in-one workspace for docs, wikis, databases
- **Pricing**: Free tier; Plus $10/user/mo ($5/user/mo nonprofit discount via TechSoup)
- **Strengths**: Extremely easy WYSIWYG editing, real-time collaboration, public pages, powerful search, databases
- **Weaknesses**: Limited customization/branding; no offline support; basic versioning; performance issues with large workspaces; no interactive learning features

#### 7. Mintlify
- **Description**: Modern documentation platform with AI features
- **Pricing**: Free tier (limited); Pro $150/mo
- **Strengths**: AI-powered search and chat, custom domains, analytics dashboard, beautiful design
- **Weaknesses**: Expensive for full features; focused on API documentation; limited interactivity

<details>
  <summary>Extended evaluation of documentation platforms. </summary>

**GitBook**

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

**Mintlify**

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

**Docusaurus**

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

**MkDocs + Material for MkDocs**

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

**Starlight (Astro)**

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
</details>

---

### Category C: Open-Source/Self-Hosted Interactive Content

#### 8. H5P
- **Description**: Open-source framework for interactive content
- **Pricing**: Free (self-hosted); H5P.com hosted plans available
- **Strengths**: MIT license, branching scenarios, quizzes, 40+ content types, xAPI support, integrates with WordPress/Moodle/Drupal
- **Weaknesses**: Requires CMS/LMS hosting; not a complete documentation solution; no native search across content

## Summary Evaluation Table

| Criteria | Genially | Compozer | Raptivity | H5P | GitBook | Docusaurus | Notion |
|----------|----------|----------|-----------|-----|---------|------------|--------|
| **Financial Cost** | ✅ $30/yr nonprofit | ⚠️ A$19+/mo | ❌ $30/mo | ✅ Free OSS | ✅ Free Community | ✅ Free OSS | ✅ $5/user/mo nonprofit |
| **Non-tech Editing** | ✅ Excellent | ✅ Good | ✅ Good | ⚠️ Moderate | ✅ Excellent | ❌ Requires dev | ✅ Excellent |
| **Offline/PWA** | ❌ No | ❌ No | ❌ No | ⚠️ Via LMS apps | ❌ No | ✅ PWA plugin | ❌ No |
| **Search** | ⚠️ Within creations | ⚠️ Limited | ❌ No | ❌ No | ✅ Built-in | ✅ Algolia/local | ✅ Built-in |
| **Theming/Branding** | ✅ Templates | ✅ Brand kits | ⚠️ Limited | ✅ CSS theming | ✅ Paid plans | ✅ Full control | ⚠️ Limited |
| **Custom Domain** | ❌ No | ❌ No | ❌ No | ⚠️ Depends on host | ✅ Paid plans | ✅ Self-hosted | ❌ Limited |
| **Interactivity** | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Excellent | ❌ Limited | ❌ Limited | ❌ Basic |
| **Analytics** | ✅ Built-in | ⚠️ Basic | ⚠️ Basic | ⚠️ Via xAPI/LRS | ✅ Built-in | ⚠️ Needs integration | ⚠️ Basic |
| **Self-hosted Burden** | ✅ None (SaaS) | ✅ None (SaaS) | ✅ None (SaaS) | ⚠️ Moderate | ✅ None (SaaS) | ❌ High | ✅ None (SaaS) |
| **Time to Setup** | ✅ Quick | ✅ Quick | ✅ Quick | ⚠️ Moderate | ✅ Quick | ⚠️ Moderate | ✅ Quick |
| **SCORM/xAPI** | ✅ Higher tiers | ✅ Yes | ⚠️ Limited | ✅ xAPI native | ❌ No | ❌ No | ❌ No |
| **Branching Scenarios** | ✅ Yes | ⚠️ Basic | ⚠️ Limited | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Quiz/Knowledge Check** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Learner Progress** | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ✅ Via xAPI | ❌ No | ❌ No | ❌ No |

**Legend:** ✅ Meets requirement | ⚠️ Partially meets | ❌ Does not meet

## Conclusion

Use **GitBook** as knowledge-base platform with learning experience integrated from e.g. Genially.
Given the time constraints to unblock content creation and to achieve a first prototype, we should expose ourselves to the risk of self-hosting a doc/learning platform.

> [!IMPORTANT]
> Boxtribute has to be accepted for the GitBook Community plan as non-profit/OSS project.
> Also, if Genially is selected, apply for a [Tech soup](https://www.techsoup.org/genially) membership.

### Advantages

- very little dev/tech team involvement needed for setup and maintenance
- creating content is intuitive through WYSIWYG editor for non-tech team
- content can be synced as Markdown and version-controlled in a GitHub repository
- Genially and H5P URLs are embeddable (GitBook [uses](https://iframely.com/domains/h5p) [Iframely](https://iframely.com/domains/genially) under the hood)
- lots of features enabled out-of-the-box (search, AI assistant, theming, analytics)
- also integrates with [Heap](https://www.gitbook.com/integrations/heap) for analytics
- each published GitBook site includes an MCP server (URL + `/~gitbook/mcp`)

### Drawbacks

- potential vendor lock-in, being dependent on company pricing plans
- no offline/PWA support (nice-to-have)

## Alternative

If the GitBook Community Plan application is rejected, the recommended alternative is **Docusaurus** hosted on Vercel with learning experience integrated from Genially and/or H5P.

### Advantages

- free, OSS framework
- full feature and branding/theming control
- modularity and extensibility
- integrate content from H5P or Genially

### Drawbacks

- considerate dev involvement for setup and maintenance (modules for search, MCP, PWA, analytics)
- no intuitive non-tech editing; use Git-based CMS overlay (e.g. [Tina CMS](https://tina.io/docs/guides/docusaurus)) to reduce the editing barrier
- modularity comes with risk of having to upgrade unmaintained integrations

<details>
  <summary>Recommended implementation steps</summary>

1. Contact GitBook (gitbook.com/community) and submit a Community Plan application for the Boxtribute non-profit organisation.
3. Create a new GitBook space, connect it to the `boxwise/boxtribute` (or a dedicated `boxwise/docs`) GitHub repository for version-controlled content sync.
4. Configure the custom domain (e.g. `docs.boxtribute.org`).
5. Enable Heap Analytics via the GitBook Integrations settings.
6. Set up initial content structure: Getting Started, Features, FAQs, What's New.
7. Grant edit access to operations and partnerships team members; provide a short onboarding session on the GitBook editor.
8. Establish a lightweight content governance process (e.g. draft → review → publish workflow using GitBook's change-request feature).
</details>

## References

- [Docusaurus Documentation](https://docusaurus.io/)
- [H5P Official Site](https://h5p.org/)
- [Genially for Nonprofits](https://www.techsoup.org/genially)
- [GitBook Community Plan](https://gitbook.com/docs/account-management/plans/community)
