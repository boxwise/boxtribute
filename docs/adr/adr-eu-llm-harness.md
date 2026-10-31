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
| 1 | Partnerships lead: standardised call notes, added to Slack canvases and posted in Slack (**priority**) | 2 | 2 |
| 2 | Team member suggests a tech improvement in chat; AI drafts a user story and scoping, then creates a Trello ticket | 2 | 1 |
| 3 | Alerts on developments across monthly reports (active users, beneficiary reach, stock moved), compared between metrics, not only against prior periods | 2 | 1 |
| 4 | User researcher: analyse a batch of interview calls, rank repeated requests, suggest follow-up questions | 2 | 2 |
| 5 | Board: first draft of annual report from last year's report and the #stand-up channel notes | 2 | 1 |

**Current situation for the priority use case:** calls run on Google Meet, are recorded locally (participants are asked for permission, and the consent is part of the recording), are almost exclusively in English, and number a few tens per month. Transcription is done locally on one person's device. This does not scale to the team.

**Current stack:** Slack, Google Workspace, Google Cloud, Trello. We will migrate off these eventually, but the targets and the timing are not yet known. Level 2 data already lives in some of these tools today.

**Constraints**
- Setup capacity: one person, half-time. Maintenance capacity: one person, 4 to 8 hours per month.

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

- **A. Managed EU inference API plus a thin, unified agent gateway we own.** We run a single, lightweight Python orchestration service (prompts, redaction, logging, connectors) on container infrastructure in the EU (e.g., Scaleway Serverless Containers or Cloud Run in an EU region). The service interfaces with a managed EU inference provider via an OpenAI-compatible endpoint.
- **B. Self-hosted open-weights models on EU rented or owned GPUs.** *Deferred.* Market benchmarks and mentorship feedback indicate upfront hardware costs of €7,000–€8,000 (e.g., dedicated GPU boxes) plus substantial setup labor (quantization, evals, security patching). This exceeds both our capital budget and monthly maintenance capacity. Retained only as a long-term fallback.
- **C. Local-only tools per person.** Low setup, but fragmented and no shared Slack/Trello integration.
- **D. Wait and use Claude with synthetic data only.** Unblocks none of the five use cases.

**Transcription** (needed for use cases 1 and 4)

- **T1. Third-party EU transcription-and-summary tool.** Fastest start. Must pass the same hosting rule, including its sub-processors, which for such tools often include US services.
- **T2. Speech-to-text through the same harness.** Transcription goes through the gateway to the chosen EU provider, if that provider offers a speech-to-text service that meets the same rules. One vendor and one place to maintain; depends on what the provider offers, including speaker labelling.

Local transcription on one person's device (the current situation) and a separately self-hosted speech-to-text service were considered and dropped: the first does not scale to the team, and the second adds a second service to operate within our maintenance budget.

## Decision

[PROPOSED, to be confirmed by reviewers]

1.. **LLM layer & Architecture: Option A.**
   - Consolidate all five level-2 use cases into a **single Python repository/service** using multi-agent workflows. Avoid separate micro-deployments to preserve the 4–8 hours/month maintenance budget.
   - For rapid prototyping and agent orchestration, adopt **Google Agent Development Kit (ADK)** (or a lightweight Python agent loop). ADK provides an out-of-the-box local testing web UI, native container packaging, and avoids the vendor lock-in.
   - The gateway will communicate with external inference models strictly via **OpenAI-compatible endpoints**, ensuring seamless provider portability.
2. **Transcription:** use a third-party EU transcription tool (T1) if there is a clear candidate that passes the hosting checks. Otherwise route transcription through the same harness (T2). Either replaces the current transcription on one person's device.
3. **Provider Shortlist & Vetting:**
   - A time-boxed spike will test shortlisted EU providers with synthetic call notes, then with a few real transcripts inside the EU setup.
   - Candidates to check: **Mistral AI, Scaleway, OVHcloud, Nebius AI, IONOS, STACKIT, Aleph Alpha**.
   - Vetting criteria:
     - Compliance with Driver 1 (EU headquarters/ownership, EU-only infrastructure and sub-processors).
     - Executed Data Processing Agreement (DPA) with zero data retention beyond inference and explicit no-training clauses.
     - **OpenAI-compatible API specification** for chat and completions.
     - Availability of proven open-weights model architectures (e.g., Mistral, Llama, Gemma).
     - Acceptable English summarisation quality on our note format.
     - Available speech-to-text service (if targeting T2).
4. **Gateway Deployment & Operational Profile:**
   - **Compute:** Deploy the gateway as a stateless container on an event-driven serverless platform (e.g., Google Cloud Run in an EU region for the interim, or Scaleway Serverless Containers). No GPUs required on our side; compute scales to zero to keep fixed hosting costs minimal.
   - **Pseudonymisation:** Redact or pseudonymise partner names before payload dispatch where the use case allows.
   - **Telemetry & Logging:** Log request metadata only (user, timestamp, use case, token count) via open-source OpenTelemetry standards. Request/response content is never persisted in logs.
   - **Connectors:** Abstract connectors for Slack, Trello, and Google tools into swappable adapters.
5. **Declassification flow (use cases 2, 3, 5):** the draft appears in Slack for approval first. Only the approved version is pushed to Trello or other level 1 systems.
6. **Priority use case first:** call notes (level 2 in, level 2 out). The remaining stories are built on the same gateway afterwards.

## Consequences

**More difficult / residual risks**
- **Residual legal risk:** tolerating minor US ties means a US legal claim against the provider is unlikely but not impossible. We accept this knowingly and document it.
- **Operator access:** under Option A the provider's staff and subcontractors could in principle access data, protected by contract. Option B is deferred until partner demand and dedicated funding justify the hardware investment.
- **Redaction can fail:** a missed partner name could move level 2 data into a level 1 system. The human approval step before pushing is the safeguard, and reviewers must actively review output before declassifying.
- **Intermediate US Tools:** Until the broader migration occurs, results still land in US-owned tools (Slack, Trello, Google Workspace), and calls run on Google Meet. This ADR secures the AI processing step, not the full lifecycle.
- **Audio retention:** moving recordings to a shared service makes level 2 audio files a new storage question. A clear retention and auto-deletion policy (e.g., delete audio immediately after transcription confirmation) is required.

## Next Steps & Action Items

- [ ] **Token Economics Calculation (Hans):** Calculate approximate token volumes for an average 45-minute transcript and verify cost projections across Mistral AI, Scaleway, and Nebius AI.
- [ ] **Spike Prototype (Hans):** Scaffold a single Python repository using Google Agent Development Kit (ADK) to test the Use Case 1 workflow against synthetic transcripts.
