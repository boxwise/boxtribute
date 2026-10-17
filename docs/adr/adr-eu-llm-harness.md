# ADR: EU-hosted LLM harness for processing partner data (sensitivity level 2)

Decision Deadline: 29 October 2026

Discussion Participants:
- Author: Hans (GitHub: HaGuesto)
- Reviewers: Roanna, Philipp [TO CONFIRM: GitHub/email]

## Status

Proposed (first draft, 15 October 2026)

## Context or Problem Statement

We have a list of AI use cases that are blocked because their input data is too sensitive to send to US-based AI providers. We committed ourselves to reduce our dependence on US hyperscalers, and some of our partners (small, locally-led humanitarian organisations) are highly sensitive about where information about them is stored.

**Our data sensitivity levels**

| Level | Description |
|---|---|
| 0 | Public information |
| 1 | Boxtribute internal information |
| 2 | Information including information from our partners |
| 3 | Information including information about individual beneficiaries of our partners |

**Blocked use cases** (all five have level 2 input)

| # | Use case | Input | Output |
|---|---|---|---|
| 1 | Partnerships lead: standardised call notes, added to Slack canvases and posted in Slack (**priority**) | 2 | 2 |
| 2 | Team member suggests a tech improvement in chat; AI drafts a user story and scoping, then creates a Trello ticket | 2 | 1 |
| 3 | Alerts on developments across monthly reports (active users, beneficiary reach, stock moved), compared between metrics, not only against prior periods | 2 | 1 |
| 4 | User researcher: analyse a batch of interview calls, rank repeated requests, suggest follow-up questions | 2 | 2 |
| 5 | Board: first draft of annual report from last year's report and the #stand-up channel notes | 2 | 1 |

**Current situation for the priority use case:** calls run on Google Meet, are recorded locally (participants are asked for permission, and the consent is part of the recording), are almost exclusively in English, and number a few tens per month. Transcription is done locally on one person's device. This does not scale to the team.

**Current stack:** Slack, Google Workspace, Google Cloud, Trello. We will migrate off these eventually, but the targets and the timing are not yet known. Level 2 data already lives in some of these tools today.

**Constraints**
- Setup capacity: one person, half-time. Maintenance capacity: one person, 4 to 8 hours per month.
- Decision needed within two weeks.

## Decision Drivers

1. **Hosting rule for level 2 and above:** no US hyperscaler and no US-headquartered operator may process or store the data. European firms with minor US ties (a US subsidiary, some US investors) are tolerated. This is a deliberate practical rule, not a legal guarantee against the CLOUD Act.
2. **Level 3 is out of scope** for this ADR.
3. **Transition:** the sensitive use cases must not wait for the migration. Until then, the AI step must not involve US actors, while results may still be stored in Slack, Google Workspace and Trello.
4. **Capacity:** half a person to set up, 4 to 8 hours per month to maintain. This favours managed services over components we have to patch and secure ourselves.
5. **Human approval before declassification:** whenever level 2 input becomes level 1 output (use cases 2, 3, 5), a person approves the draft before it leaves the level 2 environment.
6. **Swappable connectors:** Slack, Trello and Google tools must be replaceable without redesigning the system.
7. **Quality:** good enough for English summarisation and structuring. Lower than frontier-model quality is acceptable for level 2, provided a human reviews the output.
8. **Level 0 and 1 work is handled pragmatically** (for example with a Claude nonprofit subscription). Synthetic partner data may be used with Claude for prototyping and for comparing quality.

## Considered Options

**LLM layer**

- **A. Managed EU inference API plus a thin gateway we own.** We run only the gateway (prompts, redaction, logging, connectors) on EU infrastructure.
- **B. Self-hosted open-weights models on EU rented or owned GPUs.** Only we can see the data, but we run model servers, updates, monitoring and security.
- **C. Local-only tools per person.** Low setup, but fragmented and no shared Slack/Trello integration.
- **D. Wait and use Claude with synthetic data only.** Unblocks none of the five use cases.

**Transcription** (needed for use cases 1 and 4)

- **T1. Third-party EU transcription-and-summary tool.** Fastest start. Must pass the same hosting rule, including its sub-processors, which for such tools often include US services.
- **T2. Speech-to-text through the same harness.** Transcription goes through the gateway to the chosen EU provider, if that provider offers a speech-to-text service that meets the same rules. One vendor and one place to maintain; depends on what the provider offers, including speaker labelling.

Local transcription on one person's device (the current situation) and a separately self-hosted speech-to-text service were considered and dropped: the first does not scale to the team, and the second adds a second service to operate within our maintenance budget.

## Decision

[PROPOSED, to be confirmed by reviewers]

1. **LLM layer: Option A.** Build a thin gateway on EU infrastructure operated by a non-US provider, calling a managed EU inference API. Option B stays a later migration path if a partner requires that no third party can see their data. The gateway is designed so that the provider can be replaced.
2. **Transcription:** use a third-party EU transcription tool (T1) if there is a clear candidate that passes the hosting checks. Otherwise route transcription through the same harness (T2). Either replaces the current transcription on one person's device.
3. **The provider is not chosen in this ADR.** A time-boxed spike [TO CONFIRM: suggest about 3 weeks] shortlists providers and tests them with synthetic call notes, then with a few real transcripts inside the EU setup. A provider must pass these checks:
   - Headquarters, ownership and hosting comply with driver 1 (current status verified, including sub-processors and the infrastructure underneath). Examples to check, none verified yet: Mistral AI, Scaleway, OVHcloud, IONOS, STACKIT, Aleph Alpha. [TO VERIFY]
   - A data processing agreement exists, with no retention beyond processing and no training on our data.
   - Acceptable English summarisation quality on our note format.
   - Open-weights models are available, so a move to Option B stays possible.
   - Offers a speech-to-text service that meets the same rules (needed for T2). If not, a separate transcription tool (T1) is vetted instead.
   - Price per usage fits a low-volume setup.
4. **The gateway's responsibilities:**
   - Pseudonymise or redact partner names before text goes to the model, where the use case allows it.
   - Log metadata of each request (who, what use case, when), not the content. [TO CONFIRM]
   - Expose one interface to the use cases, with adapters for Slack, Trello and Google that can be replaced.
5. **Declassification flow (use cases 2, 3, 5):** the draft appears in Slack for approval first. Only the approved version is pushed to Trello or other level 1 systems.
6. **Priority use case first:** call notes (level 2 in, level 2 out). The remaining stories are built on the same gateway afterwards.

## Consequences

**Easier**
- The five blocked use cases can be built on one shared foundation instead of five separate setups.
- Call transcription is no longer tied to one person's laptop.
- Partners get a clear, defensible answer to where their information is processed.
- Replacing Slack, Trello or the model provider later does not require rebuilding the use cases.

**More difficult / residual risks**
- **Residual legal risk:** tolerating minor US ties means a US legal claim against the provider is unlikely but not impossible. We accept this knowingly and document it. [TO CONFIRM: check once with someone qualified. Ask one or two highly sensitive partners whether they accept this rule, and be able to exclude their data if not.]
- **Operator access:** under Option A the provider's staff and subcontractors could in principle access data, protected by contract. Option B is the answer if a partner requires more.
- **We now operate a service:** the gateway must be patched, backed up, access-controlled and monitored within 4 to 8 hours per month. This is a security commitment for a small team.
- **Redaction can fail:** a missed partner name could move level 2 data into a level 1 system. The approval step before pushing is the safeguard, and reviewers need to know that's their job.
- **Lower quality than frontier models** is likely, especially on long inputs such as a batch of interviews or an annual report. These stories may need chunking, or a later decision.
- **Until the migration,** results still land in US-owned tools (Slack, Trello, Google Workspace), and the call itself runs on Google Meet. This ADR secures the AI step, not the whole data chain.
- **Audio retention:** moving recordings to a shared service makes level 2 audio files a new storage question. [TO CONFIRM: how long are recordings kept after transcription?]
- **Recording consent** currently relies on asking in the call and is error-prone. A more reliable approach (for example a standard consent text in the calendar invite plus the spoken consent) is a follow-up, not part of this decision.

## Open Questions

- Who owns security for the new service, and who is the backup?
- Length of the spike, and who runs it?
- Are partners fine with the practical hosting rule? Which partner or partners do we ask first?
- Log content or metadata only?
- What are the migration targets and timeline for Slack, Trello and Google Workspace? (Not blocking this ADR, but it shapes the connectors.)
