# ADR: Call transcription and notes – Sally or our own EU agent

| Status | Proposed |
| Decider | Managing director |
| Author | Hans |
| Reviewers | Roanna, Philipp |
| Parent | ADR "EU-hosted LLM harness for processing partner data (sensitivity level 2)", decision point 4 (transcription: T1 or T2) |

## Decision requested

Should our partner calls and user interviews be transcribed and summarised by **Sally**, a German meeting-notes tool, or by **our own EU agent**, the service we are building anyway? I propose **Sally, on a monthly plan** pending cost.

## Context

Today one person records partner calls on Google Meet locally, with participants' consent captured in the recording, and transcribes them on their own device. That does not scale to the team. Volume is a few tens of calls per month, almost all in English.

Call content is sensitivity level 2 (information from our partners). Our rule for level 2: no US hyperscaler and no US-headquartered company may process or store it, including a tool's sub-processors. Results may still land in Slack, Google Workspace and Trello until we migrate off them.

## Options

**A. Sally (Aliru GmbH, Mannheim).** A ready-made tool. A visible bot joins the Google Meet call (or a phone app records in-person meetings), transcribes, and writes notes from our own template. Notes can be posted to Slack. Hosting is at Hetzner in Germany, and since September 2026 Sally runs its own language model, with no external AI provider.

**B. Our own EU agent.** The service from the parent ADR gets a transcription step. We keep recording locally, upload the audio to our service, send it to an EU speech-to-text provider, then generate the notes with our EU model. We should build another storage automation to keep track of the recording permissions. "Self-hosted" here means our own service on EU cloud infrastructure, not our own GPUs (those stay deferred in the parent ADR).

## Comparison

Sally wins on time, effort and audio handling; our own agent wins on control and running cost.

| Criterion | A. Sally | B. Our own EU agent |
| --- | --- | --- |
| Hosting rule (level 2) | Passes on paper. Sub-processors: Hetzner, DeepL, Strato (Germany); Stripe (Ireland, billing only). DPA is public; two inconsistencies to clarify. | Passes by design |
| Time to first use | Days after the DPA is signed. 30-day free trial. | Realistically multiple weeks. |
| Build and maintenance | Close to zero. Admin only: seats, DPA, sub-processor change notices. | Adds upload flow, speech-to-text, speaker labels, note template and audio deletion to our service. |
| Running cost (excl. VAT) | Pro plan €34 per seat per month (annual billing): about €408 a year for 1 seat, €816 for 2. | About €5 per month for 40 calls, plus a share of hosting . |
| Transcript quality | Vendor says up to 94.1% accuracy on Pro. Few independent reviews. | Unknown until tested; speaker labelling depends on the provider. |
| Consent in the call | Bot announces itself; anyone can type "opt out" to remove it and delete the recording so far. We still ask verbally. | Unchanged from today: verbal consent, captured in the recording. |
| Audio retention | Raw audio deleted after processing unless we ask to keep it. | We must build and enforce deletion ourselves. |
| Control and exit | Monthly plan has no minimum term. Export as DOCX or Markdown. Vendor may change models and sub-processors with 30 days' notice. | Full control of prompts, retention and approval. No new vendor. |
| Main risk | Small vendor; terms accept price rises unless we object, and charge €5,000 per shared account. | Use case 1 waits; adds load to a one-person service. |

Pro is needed: Starter (€8) allows 1,200 minutes per month, while 40 calls of 45 minutes are 1,800, and only Pro has custom prompts for our note template. The English pricing page shows $40 instead of €34, so we confirm the price in writing.

## Recommendation

Go with Sally (option A) for use cases 1 and 4, starting with one Pro seat for the partnerships lead. It is the only third-party tool whose DPA we could read and whose sub-processors all clear our hosting rule. It also frees our limited build time for use case 2, which no tool covers.

Conditions:

- Monthly billing for the first year, so we can leave without penalty if the vendor changes course.
- Sally's integrations (Slack, Trello, n8n, MCP) are connected only to tools allowed by the hosting rule. Never to Claude or other US AI services.
- We review the choice in 12 months, when our own agent is running. Moving use case 1 onto it then is a small step.

## Consequences

**If Sally:**

- Partner call notes work for the team within weeks, not months.
- We add a second vendor holding level 2 data, with its own DPA, terms and sub-processor notices to watch.
- Partners see a visible bot in the call. Verbal consent stays our responsibility, and in-person recordings have no in-meeting notice.
- Our liability claims against Sally are capped at 12 months of fees (except GDPR damage claims).

**If our own agent:**

- One vendor set and one place to enforce the hosting rule and retention.
- Use case 1 stays manual on one person's device until the agent is ready.
- Our build and maintenance budget is shared with use cases 2, 3 and 5, so transcription competes with them.

## Other tools checked

Four other EU tools were researched in October 2026; none is a clear candidate today.

| Tool | Why not now |
| --- | --- |
| [Noota](https://trust.noota.io/) (France) | Standard hosting is on Google Cloud. The sovereign option is Enterprise-only, unpriced, and its DPA is only on request. |
| [HappyScribe](https://www.happyscribe.com/privacy) (Ireland/Spain) | Privacy policy names OpenAI and Anthropic for AI features, which breaks the hosting rule. |
| [Recapro](https://www.recapro.ai) (France) | No DPA or terms text available; very small company. |
| [DeepScript](https://deepscript.com/) (Germany) | Same company as Sally, transcription only. A fallback speech-to-text provider for option B. |

## Before signing

- [ ] Sally explains two DPA inconsistencies in writing: it says no data leaves Germany but lists Stripe (Ireland), and it lists DeepL while saying no external AI is used. Also confirm the data centre (Falkenstein in the DPA, Nuremberg on DeepScript's site).
- [ ] Written quote for Pro in euros, monthly and annual, and whether a non-profit discount exists (none is published).
- [ ] Sign the DPA before any real partner call goes through Sally. Use the trial with internal or test calls only.
- [ ] Short legal read of the terms: automatic acceptance of price rises, liability cap, €5,000 penalty per shared account (one seat per person, no shared logins).

## Open questions

- How many seats: the partnerships lead only, or also the user researcher for use case 4?
- Use case 4 needs analysis across many interviews. Sally offers that only on Enterprise. Do we buy that, or let our own agent analyse exported transcripts later?
- Do our most sensitive partners accept a visible note-taking bot in their calls?

## Sources

Research done 15 to 31 October 2026; prices may have changed since.

- [Sally sample DPA](https://help.sally.io/downloads/sample_dpa_for_sally.pdf)
- [Sally pricing (English)](https://www.sally.io/pricing) and [Sally pricing (German)](https://www.sally.io/de/preise)
- [Sally SaaS terms](https://www.sally.io/de/saas-nutzungsbedingungen)
- [Sally privacy note](https://help.sally.io/downloads/privacy_note.pdf)
- Full tool comparison: eu-transcription-tools-comparison.md
