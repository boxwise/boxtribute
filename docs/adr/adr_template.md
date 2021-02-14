# ADR process

- Whoever makes the core architecture decision has to write up an ADR. If someone makes an adjustment to the architecture down the road, this person is responsible for updating the ADR.

- When you are facing an issue and you need to make an architecture decision, please create a copy of the `adr_template`-file and fill it out.
- The moment you are ready to make a proposal please create a Pull Request to master.
- In the document you can set a deadline until when you need a decision.
- Please request reviews from the people you want input. Remind them to review in slack if nothing happens.
- Depending on the input, please go back to step 1. and build a new proposal. Best include the reviewer with the input in the new proposal.
- If your proposal was approved, please merge the PR.

# ADR template

This is a template for architecture decisions based partly on [Documenting architecture decisions - Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).

In each ADR file, write these sections:

# Title

Trello-card:
Decision Deadline

## Status

What is the status, such as proposed, accepted, rejected, deprecated, superseded, etc.?

## Context or Problem Statement

What is the issue that we're seeing that is motivating this decision or change?

## Decision Drivers

What are the key criterias on which the decision is based.

## Considered Options

Which alternatives were considered?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?
