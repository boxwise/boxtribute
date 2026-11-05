# ADR: EU-hosted LLM harness for processing partner data (sensitivity level 2)

Discussion Participants:
- Author: Hans (GitHub: HaGuesto)
- Reviewers: Roanna, Philipp
- Technical Advisor / Mentor: Mateusz

## Status

Proposed

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
| 1 | Partnerships lead: standardised call notes, added to Slack canvases and posted in Slack | 2 | 2 |
| 2 | Team member suggests a tech improvement in chat; AI drafts a user story and scoping, then creates a Trello ticket (**first to build**) | 2 | 1 |
| 3 | Alerts on developments across monthly reports (active users, beneficiary reach, stock moved), compared between metrics, not only against prior periods | 2 | 1 |
| 4 | User researcher: analyse a batch of interview calls, rank repeated requests, suggest follow-up questions | 2 | 2 |
| 5 | Board: first draft of annual report from last year's report and the #stand-up channel notes | 2 | 1 |

**Current situation for use case 1:** calls run on Google Meet, are recorded locally (participants are asked for permission, and the consent is part of the recording), are almost exclusively in English, and number a few tens per month. Transcription is done locally on one person's device. This does not scale to the team. Use case 1 may be covered by a third-party EU tool (T1, see the child ADR), which is why the harness starts with use case 2.

**Current stack:** Slack, Google Workspace, Google Cloud, Trello. We will migrate off these eventually, but the targets and the timing are not yet known. Level 2 data already lives in some of these tools today.

**Constraints**
- Setup capacity: one person, half-time. Maintenance capacity: one person, 4 to 8 hours per month.

## Decision Drivers

Security and maintainability are our top priorities. Drivers 1 and 2 carry the most weight; the others refine them or set the scope.

1. **Security and data protection.**
   - **Hosting rule for level 2 and above:** no US hyperscaler and no US-headquartered operator may process or store the data. European firms with minor US ties (a US subsidiary, some US investors) are tolerated. This is a deliberate practical rule, not a legal guarantee against the CLOUD Act. Two consequences follow directly:
     - The rule covers the whole runtime, not only the model provider. The agent framework's state, checkpoints, traces, sandboxes and model routing all hold level 2 data, so their hosting and default integrations must follow it.
     - Claude and Claude Code (US provider) only ever see synthetic data for level 2 work. No real level 2 data in the repository, the development environment or a Claude session. Real data exists only in the deployed EU service. Development and production credentials are separate.
   - **Human approval before declassification:** whenever level 2 input becomes level 1 output (use cases 2, 3, 5), a person approves the result before it leaves the level 2 environment. Review rules are defined per use case and enforced in code, not in prompts.
   - **Untrusted input:** call transcripts and Slack messages may contain instructions aimed at the model (prompt injection). The model gets least-privilege tools; actions that write to other systems are code steps after approval, not tools the model can call freely.
2. **Maintainability.** Half a person to set up, 4 to 8 hours per month to maintain. This favours managed services over components we have to patch and secure ourselves, mature libraries over preview frameworks with frequent breaking changes, and one service over several.
3. **Transition:** the sensitive use cases must not wait for the migration off Slack, Google Workspace and Trello. Until then, the AI step must not involve US actors, while results may still be stored in those tools. Because the migration targets are not known yet, connectors to these tools must be swappable without redesigning the system.
4. **Quality:** good enough for English summarisation, structuring and short multi-turn dialogue, and reliable enough at tool calling for the chosen use cases. Lower than frontier-model quality is acceptable for level 2, provided a human reviews the output.
5. **Scope:** level 3 is out of scope for this ADR. Level 0 and 1 work is handled pragmatically (for example with a Claude nonprofit subscription).

## Considered Options

**LLM layer**

- **A. Managed EU inference API plus a thin, unified agent service we own.** We run a single, lightweight Python service (Slack bot, workflows, model access, redaction, logging, connectors) on EU container infrastructure operated by a non-US provider (for example Scaleway Serverless Containers). The service calls a managed EU inference provider via an OpenAI-compatible endpoint.
- **B. Self-hosted open-weights models on EU rented or owned GPUs.** *Deferred.* Market benchmarks and mentorship feedback indicate upfront hardware costs of €7,000–€8,000 (e.g., dedicated GPU boxes) plus substantial setup labor (quantization, evals, security patching). This exceeds both our capital budget and monthly maintenance capacity. Retained only as a long-term fallback, for example if a partner requires that no third party can see the data.

**Agent framework**

- **F1. Google Agent Development Kit (ADK).** Recommended to us. Model-agnostic, but optimised for Gemini; non-Google models go through the LiteLLM wrapper. Local dev UI and evaluation tooling included.
- **F2. LangGraph (optionally Deep Agents on top).** Python, open-source runtime, direct provider integrations, pause-for-human-approval with checkpointing as a core feature. LangSmith and the paid platform are US SaaS and are not used.
- Considered and dropped for now: Vercel eve (coupled to Vercel's platform by default, public preview), Flue and pi (TypeScript, experimental or more plumbing to build; our preference is Python).

**Transcription** (needed for use cases 1 and 4)

- **T1. Third-party EU transcription-and-summary tool.** Fastest start. Must pass the same hosting rule, including its sub-processors, which for such tools often include US services.
- **T2. Speech-to-text through the same harness.** Transcription goes through the service to the chosen EU provider, if that provider offers a speech-to-text service that meets the same rules. One vendor and one place to maintain; depends on what the provider offers, including speaker labelling.

Local transcription on one person's device (the current situation) and a separately self-hosted speech-to-text service were considered and dropped: the first does not scale to the team, and the second adds a second service to operate within our maintenance budget.

## Decision

[PROPOSED, to be confirmed by reviewers]

1. **LLM layer and architecture: Option A.**
   - All level 2 use cases live in a **single Python repository and service**. No separate micro-deployments, to stay within the 4–8 hours/month maintenance budget.
   - Model access goes through **one internal module** (the "gateway"). No other code calls the inference API directly. It can be split into its own service later if a second application needs model access.
   - The service talks to inference providers via **OpenAI-compatible endpoints**, for provider portability.
   - Each use case gets **as much autonomy as it needs and no more**. Use cases with a fixed shape (for example 3 and 5) are explicit workflows with LLM steps. Use cases that need dialogue (for example 2) are conversational agents. In every case, writing to Trello, posting outside the requester's thread and any other declassifying action are deterministic code steps after approval, never tools the model can call (Driver 1).
2. **Agent framework: chosen in the spike between ADK (F1) and LangGraph (F2).** Use case 2 is built with both on synthetic data and compared on: reliability with the shortlisted EU models, multi-turn conversation state tied to a Slack thread, support for per-use-case approval gates, self-hosted state storage, and effort to understand and maintain. Prompts are kept as plain Markdown files and tools as plain functions, so the framework stays replaceable.
3. **Entry point: one Slack bot.** It starts with slash commands per use case (for example `/ticket`). LLM-based routing between use cases is added only once three or more use cases exist, and it confirms its choice with the user before acting.
4. **Transcription:** use a third-party EU transcription tool (T1) if there is a clear candidate that passes the hosting checks. Otherwise route transcription through the same harness (T2). Either replaces the current transcription on one person's device.
5. **Provider shortlist and vetting:**
   - A time-boxed spike of about three weeks (run by Hans) tests shortlisted EU providers and both frameworks with a synthetic test set for use case 2.
   - Candidates to check: **Mistral AI, Scaleway, OVHcloud, Nebius AI, IONOS, STACKIT, Aleph Alpha**.
   - Vetting criteria:
     - Compliance with Driver 1 (EU headquarters/ownership, EU-only infrastructure and sub-processors).
     - Executed Data Processing Agreement (DPA) with zero data retention beyond inference and explicit no-training clauses.
     - Commercial terms that fit Boxtribute (for example, Mistral's API is limited to business customers since August 2026).
     - **OpenAI-compatible API** for chat and tool calling.
     - Availability of proven open-weights models (e.g., Mistral, Llama, Gemma, Qwen).
     - Tool-calling reliability and English summarisation quality on our test set.
     - Available speech-to-text service (if targeting T2).
6. **Deployment and operational profile:**
   - **Compute:** stateless container on an EU serverless platform operated by a non-US provider (for example Scaleway Serverless Containers). No GPUs on our side; scale to zero to keep fixed costs low. Google Cloud Run is not used for this service, because Google is a US hyperscaler (Driver 1). The spike checks whether cold starts fit Slack's response-time limits.
   - **State:** workflow state and approval checkpoints in a managed EU Postgres from the same provider.
   - **Pseudonymisation:** redact or pseudonymise partner names before sending to the model where the use case allows.
   - **Logging and observability:**
     - Request metadata (user, timestamp, use case, workflow step, model, token count, latency, error type) as structured logs via OpenTelemetry.
     - Full request and response content stored only in the EU Postgres and access limited to the service owner and a backup, for debugging.
     - An external observability tool may be added later for an explicit allowlist of metadata fields only. The exported record is built field by field in our code, never by relying on an SDK's redaction settings. Content, error messages and free-text metadata (such as channel names) are never exported.
   - **Connectors:** Slack, Trello and Google tools sit behind swappable adapters.
7. **Declassification flow (use cases 2, 3, 5):** the draft appears in Slack for approval first. Only the approved version is pushed to Trello or other level 1 systems. Each use case documents its own review rule.
8. **Shape of use case 2:** the requester starts with `/ticket` and a rough idea. The agent holds a conversation in that Slack thread over several turns: it asks clarifying questions (problem, users affected, acceptance criteria, scope), proposes a user story and scoping, and revises it on feedback. The conversation is level 2 and stays in the thread. When the requester marks the draft as final, the approval rule for use case 2 applies, and only the approved story is pushed to Trello by code. The model has no Trello tool.
9. **Order:** use case 2 first, because it builds the reusable declassification flow and the conversational pattern. Use case 1 follows via T1 or T2. Use cases 3 to 5 are built on the same service afterwards.

## Consequences

**More difficult / residual risks**
- **Residual legal risk:** tolerating minor US ties means a US legal claim against the provider is unlikely but not impossible. We accept this knowingly and document it.
- **Operator access:** under Option A the provider's staff and subcontractors could in principle access data, protected by contract. Option B is deferred until partner demand and dedicated funding justify the hardware investment.
- **Redaction can fail:** a missed partner name could move level 2 data into a level 1 system. The human approval step before pushing is the safeguard, and reviewers must actively review output before declassifying.
- **Intermediate US tools:** until the broader migration occurs, results still land in US-owned tools (Slack, Trello, Google Workspace), and calls run on Google Meet. This ADR secures the AI processing step, not the full lifecycle.
- **Stored content:** keeping request content for debugging creates a level 2 store we must secure and delete on schedule.
- **Model capability:** EU-hosted open-weights models may be weaker at multi-step tool calling and longer dialogue than frontier models. This limits how autonomous the use cases can be.
- **Testing conversations is harder:** a multi-turn agent cannot be checked with fixed input and expected output alone. The test set needs scripted or simulated requester conversations.
- **Audio retention:** moving recordings to a shared service makes level 2 audio files a new storage question. A clear retention and auto-deletion policy (e.g., delete audio immediately after transcription confirmation) is required.

**Easier**
- **Running cost is low.** Rough estimate, not a quote: at about 5 million input and 0.5 million output tokens per month across all five use cases, inference costs about €5 to €15 per month at current Scaleway list prices; transcription for 40 calls of 45 minutes costs about €5 per month; hosting and Postgres are estimated at €20 to €60 per month. The main cost is staff time.
- **One service, one repository** keeps maintenance within budget and gives one place to enforce the hosting rule.


## Next Steps & Action Items

- [ ] **Spike plan (Hans):** synthetic test set for use case 2, two or three providers, ADK and LangGraph side by side, pass/fail criteria, three-week timeline.
- [ ] **Spike (Hans):** build use case 2 in one Python repository with both frameworks against synthetic data; record results in this ADR.
- [ ] **Token and cost check (Hans):** confirm the cost estimate with measured token counts from the spike, across the shortlisted providers.
- [ ] **Open the PR** to master with Roanna and Philipp as reviewers; remind in Slack if there is no review by the deadline.
