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
- low set-up and maintainence effort
- integration into existing NextJS website
- no cookie-banner required (no data storage acc. to GDPR)
- tracking of call-to-actions (CTA), downloads, page visits (with source via UTM tags)
- distinguish human and robot traffic

## Considered Options

1. [Umami Cloud](https://docs.umami.is/docs/cloud)
1. [Plausible Cloud](https://plausible.io/)
1. [PostHog](https://posthog.com/pricing)
1. [Heap](https://heap.io)

### Comparison

All options feature CTA, download, and UTM tracking. All have bot filtering enabled, and come with a dashboard for viewing analytics.

Tool | Umami | Plausible | PostHog | Heap
:--- | :--- | :--- | :--- | :---
Cost | free for 100k events/mo and one website, then $20/mo | 9€/mo | free for 1M events/mo and one project | free for one project (and 5 users), then 375$/mo
Cookie banner | not required | not required | can be configured off | required
Open-source | MIT | AGPLv3 | MIT | -
GitHub stars | 38k | 29k | 38k | -

<details>
  <summary>References</summary>

#### Tool comparison

- https://umami.is/compare
- https://www.opensourcealternatives.to/blog/self-hosted-analytics

#### Set up

- [Umami](https://docs.umami.is/docs/guides/track-single-page-apps#nextjs-app-router) guide
- [PostHog](https://posthog.com/docs/libraries/next-js#client-side-setup)

#### Cookie usage

- [You get the data you need to understand your site. Your visitors get an experience that doesn’t track, profile or follow them around the web. No cookies, no personal data, no consent banners required](https://plausible.io/privacy-focused-web-analytics)
- [Heap’s tracking code uses first-party cookies set by your domain](https://help.heap.io/hc/en-us/articles/37271939081617-What-cookies-does-Heap-set-and-what-are-they-used-for)
- [Normally, PostHog stores some information about the user in their browser using a cookie. This approach is typical for analytics tools and enables user tracking across sessions, caching feature flag data, and more](https://posthog.com/tutorials/cookieless-tracking#if-you-want-to-delete-your-cookie-banner)

#### Pricing

- https://plausible.io/when-not-to-use-plausible#plausible-is-not-the-best-fit-if-you-need-free-hosted-analytics-forever

#### Dashboard sharing

- https://posthog.com/docs/product-analytics/sharing#sharing-a-dashboard

</details>

## Decision

**Implement website tracking using Umami.**

PostHog also provides a cloud-based, free-tier with even 10x more events tracked per month, however

- PostHog is suitable for SaaS projects that need thorough product analytics. It's too complex for a SPA
- the Umami docs are more developer-friendly (easier to navigate and read)
- PostHog does not have [bot detection enabled](https://posthog.com/tutorials/cookieless-tracking#limitations) in cookieless mode

## Consequences

- no worries about GDPR compliance/cookie banner
- does not scale beyond 3k/day events. Risk that Umami changes their free tier
