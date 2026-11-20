# ADR: Newsletter acquisition for funding-opportunity monitoring

Trello-card: Add link

Decision Deadline: Add date

Author: Add name

## Status

Proposed

## Context or Problem Statement

Funders often announce new calls in newsletters, sometimes before or instead of
updating their web pages. The proper fundraising scraper probably needs that signal. 

Funders offer newsletters in different ways: some publish a public archive or
RSS feed (for example NLnet), others only a signup form (for example Minneapolis
Foundation, Namati). The web page scraper currently collects links only and
misses signup forms. The content feeds a central database of funding
opportunities whose audience (internal or published) is undecided.

## Decision Drivers

- No private data enters the system.
- Content from outside is untrusted input to an LLM.
- The mailbox is hosted in the EU.
- Relationship follow-ups stay human

## Considered Options

1. Public archive or RSS feed only.
2. Boxtribute-operated mailbox for every newsletter.
3. Archive or RSS first, Boxtribute mailbox as fallback.
4. Fundraisers forward newsletters they already receive.
5. Fundraiser- or organisation-owned inbox: each organisation signs up with its
   own dedicated address and the system reads that inbox.
   - For: the funder sees the real, eligible subscriber; no mailbox for
     Boxtribute to run for every fundraiser; consent sits with the organisation.
   - Against: every organisation subscribes separately, so the same newsletter
     is processed many times; the system needs read access to each organisation's mail, or set up an AI email for each fundraiser; support effort grows with every
     organisation.

## Decision

Option 3.

- Use a public archive or RSS feed when one exists and is current and complete.
  It goes through the web page pipeline (robots.txt, rate limits, content hash).
- The mailbox takes over when there is no archive or feed, it is stale, or it
  is partial.
- The mailbox signs up as Boxtribute, is hosted in the EU, and is read-only: it
  never replies or writes to funders.
- Options 4 and 5 are not in the first version. Both bring in mail we don't
  control, forwarded mail can hold private information. Reopen if funders turn out to send
  different content to eligible local organisations than to Boxtribute.

Proposed defaults:
- The mailbox does not follow links.
- Mail that is not a newsletter (personal replies, anything addressed to a
  person) goes to a named human and is never sent to the LLM or stored in the
  registry.
- Tracking pixels and tracked links are stripped before processing.

## Open Questions

- It feels like if we want to include newsletter sign-ups we might need to do them manually?
- How to handle potential prompt injection? If the AI inbox is open, anybody could send emails to it. --> validation of sender necessary?
- legal implications if we want to publicize/license newsletter content?
