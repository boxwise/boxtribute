# ADR: website tracking

Trello-card: https://trello.com/c/VjUWWEy3

Decision Deadline: 2026-08-12

Author: pylipp

## Status

Proposed.

## Context or Problem Statement

The boxtribute [landing page](https://boxtribute.org) is the first contact point for potential partners and for the interested public in general.
For assessing popularity and usage it is important for the team to have information about website visits and interactions.

## Decision Drivers

- no costs
- low set-up and maintenance effort
- integration into existing NextJS website
- cookieless operation, with any consent-banner requirement confirmed under applicable GDPR rules
- tracking of call-to-actions (CTA), downloads, page visits (with source via UTM tags)
- distinguish human and robot traffic

Note that in the main app, we already use Heap for tracking user interaction.

## Considered Options

1. [Umami Cloud](https://docs.umami.is/docs/cloud)
1. [Plausible Cloud](https://plausible.io/)
1. [PostHog](https://posthog.com/pricing)
1. [Heap](https://heap.io)
1. [Matomo](https://matomo.org/)

### Comparison

All options feature CTA, download, and UTM tracking and provide a dashboard.

Tool | Umami | Plausible | PostHog | Heap | Matomo
:--- | :--- | :--- | :--- | :--- | :---
Cost | free for 100k events/mo and one website, then $20/mo | 9€/mo | free for 1M events/mo and one project | free for up to 10k sessions/mo; paid plans require a quote | $26/mo for 50k hits, 30 websites, and 30 users
Cookie banner | not required | not required | can be configured off | required | can be configured off
Bot filtering | always | not in cookieless mode | always | always | has to be enabled
Open-source | MIT | AGPLv3 | MIT | - | GPLv3
GitHub stars | 38k | 29k | 38k | - | 22k

<details>
  <summary>References</summary>

#### Tool comparison

- https://umami.is/compare
- https://www.opensourcealternatives.to/blog/self-hosted-analytics
- https://tsykin.com/blog/google-analytics-vs-umami-vs-plausible (self-hosting)

#### Set up

- [Umami](https://docs.umami.is/docs/guides/track-single-page-apps#nextjs-app-router) guide
- [PostHog](https://posthog.com/docs/libraries/next-js#client-side-setup)

#### Cookie usage

- [You get the data you need to understand your site. Your visitors get an experience that doesn’t track, profile or follow them around the web. No cookies, no personal data, no consent banners required](https://plausible.io/privacy-focused-web-analytics)
- [Heap’s tracking code uses first-party cookies set by your domain](https://help.heap.io/hc/en-us/articles/37271939081617-What-cookies-does-Heap-set-and-what-are-they-used-for)
- [Normally, PostHog stores some information about the user in their browser using a cookie. This approach is typical for analytics tools and enables user tracking across sessions, caching feature flag data, and more](https://posthog.com/tutorials/cookieless-tracking#if-you-want-to-delete-your-cookie-banner)
- [To prevent cookies from ever being used, log in as a Matomo superuser and navigate to Administration matomo admin > Privacy > Anonymize data.](https://matomo.org/faq/how-to/how-do-i-enforce-tracking-without-cookies/)

#### Pricing

- https://plausible.io/when-not-to-use-plausible#plausible-is-not-the-best-fit-if-you-need-free-hosted-analytics-forever
- https://umami.is/pricing
- https://matomo.org/pricing/

#### Dashboard sharing

- https://posthog.com/docs/product-analytics/sharing#sharing-a-dashboard
- https://docs.umami.is/docs/add-a-board#share-a-board

#### APIs

- https://docs.umami.is/docs/api
- https://plausible.io/docs/stats-api

#### Bot filtering

- https://plausible.io/docs/bot-traffic-filtering
- https://posthog.com/tutorials/cookieless-tracking#limitations
- https://docs.umami.is/docs/environment-variables#disable_bot_check
- https://matomo.org/faq/how-to/block-spam-and-bot-traffic-with-tracking-spam-prevention/

#### AI-assisted research

- https://github.com/copilot/c/4cc1f57f-47ae-4518-b8ab-c519ff8699d8

#### Prototypes with existing website

- https://github.com/boxwise/boxtribute-landing-nextjs/pull/41
- https://github.com/boxwise/boxtribute-landing-nextjs/pull/42

</details>

## Decision

**Implement website tracking using Umami.**

PostHog also provides a cloud-based, free-tier with even 10x more events tracked per month, however

- PostHog is suitable for SaaS projects that need thorough product analytics. It's too complex for a SPA
- the Umami docs are more developer-friendly (easier to navigate and read)
- PostHog does not have bot detection enabled in cookieless mode, Umami has it by default

Heap always requires showing a cookie-banner.

Plausible and Matomo are ruled out because of cost and complexity.

## Consequences

- no worries about cookie banner
- the free tier stops processing events after 100k/month (about 3.3k/day only as a monthly average). There is a risk that Umami changes its free tier; self-hosting remains a fallback
