# Choose an Email Provider for Auth0 Integration

Author: Hans

## Status

proposed, implemented as quick fix

## Context or Problem Statement

We need to select an email provider that integrates with Auth0 for sending transactional emails (sign-up verifications, password resets, etc.). Auth0 itselfs can send emails, but does not allow to customize their emails in their case and is only recommended for dev and test tennant.
Until now we used sendgrid and signed up to it via Google cloud marketplace. Unfortunately, our account was put on "under review" without warning and no emails were sent anymore. The reason was inactivity (no emails were tracked in the sendgrid stats) even though each day there were a few emails sent out via the Email API. Sendgrid was not able to remove the "Under review" state and asked us to create a new account.

## Decision Drivers

1. **Cost**: We send fewer than 100 emails per day, so ideally we want a free tier or minimal monthly cost.
2. **Delivery Reputation**: The provider should have reliable inbox delivery and low spam complaint rates.
3. **GDPR Considerations**: Prefer an option that processes data in the EU or offers an EU data center.
4. **Integration with GCP**: Since we run our application on Google Cloud, is there any synergy or reduced cost if we use a certain provider?
5. **Auth0 Support**: We must pick from Auth0’s officially supported providers for a smoother integration.

## Considered Options

Auth0 currently supports the following providers:

1. **Mandrill (Mailchimp)**

   - Primarily a paid service; no perpetually free tier for low-volume.

2. **Amazon SES**

   - Very low per-email cost at scale, but no free tier unless the app is hosted on AWS (which we are not).

3. **Azure Communication Services**

   - Ties in with Azure environment, not GCP.

4. **Microsoft 365**

   - Usually part of a paid subscription (e.g., Office 365 Business).

5. **SendGrid**

   - Auth0-specific documentation and official support.
   - Free tier allows 100 emails/day, which meets our current needs.
   - Through Google Cloud we can create a free account that increases the free emails per day to about 400.
   - Good deliverability reputation.
   - EU data center is available for higher-tier plans.

6. **SparkPost**

   - Historically offered a generous free tier (e.g., 15k emails/month), though terms can change.
   - Reputable deliverability.
   - EU data options exist, but need to confirm if the free plan supports it.

7. **Mailgun**
   - Developer-friendly, but free trial only lasts 3 months (after which it’s pay-as-you-go).

## Decision

I propose using **SendGrid** on its free tier and a sign up through sendgrid itself and not the Google Cloud marketplace for the following reasons:

- It provides **100 emails/day at no cost**, which aligns with our current usage (under 100 emails/day).
- We will input warnings to track the usage so that we can quickly upgrade using sendgrid from the Google Cloud market place if need be.
- With this set up we will not be closed down again due to inactivity because the stats from the Email API are recorded correctly.

## Consequences

I'd also suggest to put some monitoring up for Auth0. We could have also caught the problem here earlier.
