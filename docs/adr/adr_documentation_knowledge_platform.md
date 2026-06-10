# ADR: Documentation and Knowledge Platform Selection

Author: GitHub Copilot

Decision Deadline: 2026-06-24

## Status

Proposed

## Context or Problem Statement

As a humanitarian-aid tech non-profit, Boxtribute needs a centralized platform to provide extended contextual information to users. This includes FAQs, guided training/microlearning, best practices, common scenarios, and platform documentation. Currently, documentation is scattered across GitHub README files, internal wikis, and ad-hoc Notion pages with no central, publicly accessible location for end-users or partner organisations.

**Primary Goals:**
1. Engage onboarding users to quickly and effectively learn how to use Boxtribute for humanitarian programming
2. Help users experiencing operational challenges discover relevant knowledge and solutions in an easily absorbable format

## Decision Drivers

### Must-Have Requirements
1. **Non-tech usability** – Content editors (operations, partnerships) must be able to add/modify content without developer involvement. Fast learning curve with polished output.
2. **Low tech maintenance burden** – Minimal ongoing effort from the engineering team.
3. **Free/affordable** – Perpetually free or OSS plan suitable for open-source nonprofit.
4. **Anonymized visitor analytics** – GDPR-compliant, cookie-free tracking of page visits, clicks, and time on page.
5. **Search** – Full-text search across all content.
6. **Theming/branding** – Ability to match Boxtribute's visual identity.
7. **Custom domain** – Docs site should live under a Boxtribute-owned domain.
8. **Interactivity and multimedia** – Clickable sections, branching scenarios, quizzes, and engagement features.

### Nice-to-Have
- Offline/low-connectivity caching (PWA) for field deployment in refugee camps
- Release log / What's New section
- GraphQL API reference for developers
- MCP (Model Context Protocol) integration for AI assistant consumption
- SCORM/xAPI support for future LMS integration

## Considered Options

### Category A: E-Learning Authoring Tools (Interactive Learning Focus)

#### 1. Genially
- **Description**: Interactive presentation and e-learning platform with visual editor
- **Pricing**: $30/year nonprofit discount via TechSoup (budget <$1M); 85% discount for larger orgs. Free tier available with limitations.
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

#### 4. iSpring Suite
- **Description**: PowerPoint-based e-learning authoring tool
- **Pricing**: $970/author/year
- **Strengths**: Excellent branching scenarios, role-play simulations, SCORM 1.2/2004/xAPI, quiz creation
- **Weaknesses**: Windows-only (PowerPoint plugin); expensive for nonprofit; not documentation-focused

#### 5. Articulate Rise 360
- **Description**: Cloud-based responsive e-learning authoring
- **Pricing**: $1,449-$1,749/user/year (£650/user/year nonprofit pricing)
- **Strengths**: Excellent mobile-responsive design, SCORM/xAPI, collaboration tools, 20M+ stock assets
- **Weaknesses**: Very expensive even with nonprofit discount; overkill for documentation needs

#### 6. Elucidat
- **Description**: Enterprise e-learning platform
- **Pricing**: From $1,650/user/year
- **Strengths**: AI-powered authoring, branching, SCORM/xAPI, analytics, instant updates
- **Weaknesses**: Enterprise pricing unsuitable for nonprofit; focused on large organizations

### Category B: Documentation Platforms

#### 7. GitBook
- **Description**: Cloud-based documentation platform with clean editor
- **Pricing**: Free Basic plan; Community plan (free for qualifying nonprofits/OSS with Ultimate features); Premium $65/mo/site; Ultimate $249/mo/site
- **Strengths**: WYSIWYG + Markdown, real-time collaboration, GitHub sync, custom domains (paid), built-in analytics, AI-powered features
- **Weaknesses**: Limited interactivity; no branching scenarios; paid tiers required for full customization

#### 8. Docusaurus
- **Description**: Open-source static site generator by Meta
- **Pricing**: Free (self-hosted)
- **Strengths**: Fully customizable (React-based), PWA plugin for offline, full-text search (Algolia), version control, GraphQL API docs support, MCP integration possible
- **Weaknesses**: Requires developer setup; Git-based workflow; no built-in analytics (needs Plausible/Fathom integration); no native interactive learning features

#### 9. Notion
- **Description**: All-in-one workspace for docs, wikis, databases
- **Pricing**: Free tier; Plus $10/user/mo ($5/user/mo nonprofit discount via TechSoup)
- **Strengths**: Extremely easy WYSIWYG editing, real-time collaboration, public pages, powerful search, databases
- **Weaknesses**: Limited customization/branding; no offline support; basic versioning; performance issues with large workspaces; no interactive learning features

#### 10. Mintlify
- **Description**: Modern documentation platform with AI features
- **Pricing**: Free tier (limited); Pro $150/mo
- **Strengths**: AI-powered search and chat, custom domains, analytics dashboard, beautiful design
- **Weaknesses**: Expensive for full features; focused on API documentation; limited interactivity

#### 11. ReadMe
- **Description**: Developer documentation platform
- **Pricing**: Free Starter; Pro $250/mo; Enterprise $3000+/mo
- **Strengths**: Interactive API reference, custom domains, built-in analytics, GitHub sync
- **Weaknesses**: API-documentation focused; very expensive for full features; not suited for general user documentation

#### 12. Stonly
- **Description**: Interactive knowledge base with step-by-step guides
- **Pricing**: Custom pricing (Small Business: 4000 views/mo, 5 team members; Enterprise: custom)
- **Strengths**: Decision trees, conditional workflows, branching guides, analytics, embeddable widgets
- **Weaknesses**: No public pricing; focused on support knowledge base; limited documentation features

### Category C: Open-Source/Self-Hosted Interactive Content

#### 13. H5P
- **Description**: Open-source framework for interactive content
- **Pricing**: Free (self-hosted); H5P.com hosted plans available
- **Strengths**: MIT license, branching scenarios, quizzes, 40+ content types, xAPI support, integrates with WordPress/Moodle/Drupal
- **Weaknesses**: Requires CMS/LMS hosting; not a complete documentation solution; no native search across content

#### 14. Adapt Learning
- **Description**: Open-source responsive e-learning framework
- **Pricing**: Free (self-hosted)
- **Strengths**: SCORM 1.2/2004 support, branching via plugins, offline HTML5 export, fully customizable
- **Weaknesses**: Requires technical setup; focused on courses not documentation; limited analytics

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

## Decision

**Recommended Hybrid Approach: Docusaurus + H5P Integration**

Given the dual requirements for traditional documentation AND interactive learning content, a hybrid approach is recommended:

### Primary Platform: Docusaurus
- **Rationale**: Free, open-source, fully customizable, supports PWA for offline use, custom domain via self-hosting, excellent for traditional documentation, API reference (GraphQL), release logs, and technical content.
- **Analytics**: Integrate Plausible Analytics ($9/mo) for GDPR-compliant, cookie-free tracking.
- **MCP Integration**: Feasible through custom development.

### Interactive Learning: H5P
- **Rationale**: Free open-source, excellent branching scenarios, quizzes, knowledge checks, and interactive content. Can be embedded within Docusaurus pages or linked separately.
- **Hosting Options**: 
  - Self-host via WordPress/Drupal plugin
  - Use H5P.com for managed hosting
  - Embed interactive content via iframes in Docusaurus

### Alternative Consideration: Genially
If the primary goal shifts toward learning-first content with less emphasis on traditional documentation:
- **Genially** offers exceptional nonprofit pricing ($30/year via TechSoup) with excellent interactive features, branching scenarios, and quizzes.
- Best for teams where non-technical content editors are the primary authors.
- Limitation: Not suitable as a comprehensive documentation platform.

## Consequences

### Benefits
- **Full ownership**: Self-hosted Docusaurus provides complete control over content and branding
- **Cost-effective**: Core infrastructure is free; only analytics requires minimal cost
- **Flexible interactivity**: H5P provides excellent branching scenarios without vendor lock-in
- **Future-proof**: Open standards (xAPI) support future LMS integration
- **Offline-capable**: PWA support addresses low-connectivity field deployment needs

### Trade-offs
- **Initial setup effort**: Requires developer time to configure Docusaurus, H5P integration, and analytics
- **Dual-platform management**: Content editors need to work across two systems
- **Analytics complexity**: GDPR-compliant analytics requires separate integration (Plausible)
- **Learning curve**: Non-technical editors may need initial training on Markdown/Docusaurus workflow

### Mitigation Strategies
1. Create comprehensive content contribution guidelines
2. Set up Git-based workflows with preview deployments for content review
3. Develop templates and H5P presets for common interactive content types
4. Consider GitBook Community Plan as a simpler alternative if developer resources are constrained

## References

- [Docusaurus Documentation](https://docusaurus.io/)
- [H5P Official Site](https://h5p.org/)
- [Genially for Nonprofits](https://www.techsoup.org/genially)
- [GitBook Community Plan](https://gitbook.com/docs/account-management/plans/community)
- [Plausible Analytics](https://plausible.io/)
