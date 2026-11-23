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
| Non-US Hosting rule | Passes on paper. Sub-processors: Hetzner, DeepL, Strato (Germany); Stripe (Ireland, billing only). DPA is public (nobody else does that) | Passes by design |
| Time to first use | Days after the DPA is signed. 30-day free trial. | Realistically multiple weeks. |
| Build and maintenance | Close to zero. Admin only: seats, DPA, sub-processor change notices. | Adds permission flow, upload flow, speech-to-text, speaker labels, note template and audio deletion to our service. |
| Running cost (excl. VAT) | Start plan €12 per seat and per month, Pro plan €39 per seat per month | About €5 per month for 40 calls, plus a share of hosting (total. €20 to €60 per month) |
| Transcript quality | Vendor says up >90% for Start plan and 94.1% accuracy on Pro. | Unknown until tested; speaker labelling depends on the provider. |
| Number of calls per month | 20x 1 hr calls at Start. Unlimited at Pro | Unlimited |
| Summary formats | 40 template meeting formats for summaries at Start. custom meeting formats possible at Pro | We define the summary format ourselves |
| Search  across meetings | unlimited | not sure how to implement yet (extra agent probably) |
| ask AI across meetings | up to 30 questions per month on single calls or all calls at Start, unlimited and ask questions of call in a certain folder at Pro  | not sure how to implement yet (extra agent probably). It would also be possible to connect to Sally through API, MCP. |
| Consent in the call | Bot announces itself; anyone can type "opt out" to remove it and delete the recording so far. We still ask verbally and update our privacy policy. | We might want to build a proper (automated) flow for this: verbal consent or asked in email before, saved in always the same, correct place |
| Audio retention | Raw audio deleted after processing unless we ask to keep it. | We must build and enforce deletion ourselves. |
| Control and exit | Monthly plan has no minimum term. Export as DOCX or Markdown. Vendor may change models and sub-processors with 30 days' notice. | Full control of prompts, retention and approval. No new vendor. |
| Main risk | Small vendor; terms accept price rises unless we object, and charge €5,000 if they find out that we share our account with a third party. | Maintenance |

Other interesting features at Sally Pro Plan:
- organize meetings in folders and ask AI questions across the the calls in a folder
- you can define "Benchmark" questions for a call beforehand (like "What is their budget?") and it gives you a conscrete answer

## Recommendation

Test Sally (option A) in Pro for one month for free and then review again.
Access through a Google Group address

## Other tools checked

Four other EU tools were researched in October 2026; none is a clear candidate today.

| Tool | Why not now |
| --- | --- |
| [Noota](https://trust.noota.io/) (France) | Standard hosting is on Google Cloud. The sovereign option is Enterprise-only, unpriced, and its DPA is only on request. |
| [HappyScribe](https://www.happyscribe.com/privacy) (Ireland/Spain) | Privacy policy names OpenAI and Anthropic for AI features, which breaks the hosting rule. |
| [Recapro](https://www.recapro.ai) (France) | No DPA or terms text available; very small company. |
| [DeepScript](https://deepscript.com/) (Germany) | Same company as Sally, transcription only. A fallback speech-to-text provider for option B. |

## Sources

Research done 15 to 31 October 2026;

- [Sally sample DPA](https://help.sally.io/downloads/sample_dpa_for_sally.pdf)
- [Sally pricing (English)](https://www.sally.io/pricing) and [Sally pricing (German)](https://www.sally.io/de/preise)
- [Sally SaaS terms](https://www.sally.io/de/saas-nutzungsbedingungen)
- [Sally privacy note](https://help.sally.io/downloads/privacy_note.pdf)
