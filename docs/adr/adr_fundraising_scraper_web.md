# ADR: Web page acquisition for funding-opportunity monitoring

Author: @HaGuesto

## Status

Proposed

## Context or Problem Statement

- The fundraising scraper must read funders' public web pages to fill opportunity fields and to detect new or changed opportunities.
- In a first test scrape (9 real funders, trafilatura + BeautifulSoup,robots.txt honoured, identifying user agent), 6 start URLs gave usable text and 3 failed on access (robots.txt, HTTP 403, HTTP 404).
- Of 24 pages read, 1 was empty because of JavaScript.
- Pages also vary in meaning: one funder listed no open calls, and a 2022 call link led to the current call via subpages.
- The team has limited scraping experience.
- Scale (about 750-1,500 rows x ~10 sources) is a guess; 
- central Boxtribute vs per-organisation/per-fundraiser fetching; Do we want to build a central registry of funding opportunities? For now, one fetch per URL, shareable across fundraisers (central registry).

## Decision Drivers

- Hosting in EU
- Low cost: fetch cheaply, call the LLM only when content changed.
- Honest failure: unreadable pages are shown as such, never guessed.
- Maintainable by a small team.

## Considered Options

1. Plain HTTP fetch + trafilatura, self-hosted (current test setup).
2. Option 1 + headless browser (Playwright) fallback for empty or thin pages.
3. Third-party scraping/reader API.
4. Fetch pages even where robots.txt disallows.

## Decision (WIP)

Option 1 as the default, with Option 2 added only when real failures justify it.
- Honour robots.txt, send an identifying user agent with contact, rate-limit per host.
- Run on EU infrastructure.
- Store per URL: cleaned text, content hash, fetch status, timestamp. Re-extract
  with the LLM only when the hash changes.
- Fetch status is a first-class value: ok, blocked, disallowed by robots.txt,
  unreachable, thin/suspected JavaScript. It is shown to the fundraiser.

## Open questions

- When are Third-party scraping APIs a valid option?
- When do we need really a headless browser for scraping?

- legal implications if we do not adhere to robots.txt
- legal implications if we store funding opportunities centrally and publicize/license
