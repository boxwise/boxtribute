# Public sharing of statistics data - state and ideas

Related [Trello card](https://trello.com/c/TkDc1GHV/1384-20-epic-public-sharing-of-embedded-viz-and-or-single-number-data).

Extending https://github.com/boxwise/boxtribute/issues/1093  .

Copied from https://docs.google.com/document/d/1ZgEs594JmswfqMdSxtG_fnV1AEouHO4CtGjmMNCH4HY/edit

## Current state

We have/use

- a read-only replica of the database to fetch the data from
    - to split the load on the database (requests for statviz should not slow down the database for Boxtribute)
- datacubes containing data for certain visualizations, for the duration of the user request
    - the back-end creates them on-the-fly by reading data from the read-only replica, transforming it, and sending it over to the front-end
- only one endpoint to operate on data, regardless of statviz data or other app data. Only authenticated (logged-in) users can use this endpoint
    - therefore no security concerns, but also restricted use to boxtribute users

The original plan was to create an embeddable widget that Boxtribute partners can use on their public website. However, we ran into some technical issues that are described in more detail in Scenario 2 below.

## Future plans

Now our current plan, to keep in the spirit of being able to share and publicize data, is to make it possible for Boxtribute partners to share visualizations with each other, while continuing to explore the possibility of making the data publicly available in a secure way.

We want to

- Make live data & visualizations based on live data publicly available via shareable link
    - single number (i.e. quantity of boxes moved out)
    - visualizations based on live data (i.e. stock overview as table or as donut chart with current stock)
    - (as above, including possibility to interactively group & filter data just as in dashboard itself)

This can be realized in two scenarios:

1. Grant access within boxtribute to users of another base
1. Grant public access via public link

### 1. Sharing within boxtribute across different bases

This feature is already implemented in boxtribute v2.4 and available to beta users.

**Issues**:

- how to implement this without running into security issues?
- how to manage authorization flow between FE and BE?

**What exactly are the security concerns?**

- uncontrolled read access to complete (unfiltered) data set tied to the specific visualization

**What exactly are the technical issues in facing this challenge?**

- authorization flow between FE and BE
    - solved: only authenticated users can retrieve the data
- authorization flow within boxtribute between several users/bases
    - solved: only users with an active mutual transfer agreement can retrieve the data

### 2. Public sharing

The idea is to introduce a second, public endpoint for the single-number data sharing.

**Issues:**

- how to implement this without running into security issues?
- how to manage authorization flow between FE and BE, if existing at all?

**What exactly are the security concerns?**

- uncontrolled read access to complete (unfiltered) data set tied to the specific embedded visualization
    - especially concerning beneficiary data insofar bases collect those
- uncontrolled read access to data beyond what was intended to be exposed, especially read access to personal data of vulnerable people

**What exactly are the technical issues in facing this challenge?**

- How to provide the single number to the public?
    - actually just something we can copy from the existing implementation (for the BE at least)
    - maybe some control to prevent people from abusing it by making too many simultaneous requests (DoS attack)

**How to provide the embedded visualization to the public?**

- authorization flow between FE and BE
    - For public sharing a single number in its bare form, there's neither authentication nor authorization. The users who read the "simple number" are anonymous (see my comment asking for clarification above though). Hence there won't be any authz flow between FE and BE (here, FE can refer to any usage of the endpoint: the boxtribute FE, the boxtribute website, websites of partner orgs, arbitrary users "downloading" the number via their command line, …)
    - There are techniques to force e.g. organisations hosting a website to use a token when requesting data from the single-number endpoint. If the token is incorrect or missing, BE refuses to give the number. This technique is rather weak because the token will be embedded in the website code and can be extracted by savvy people; also it's extra work for us because we have to provide a way for orgs to obtain this token

**Implementation ideas and concepts**

From [Slack Canvas](https://boxwise.slack.com/docs/T99PBKNTU/F06QQS70XQT):

1. James suggests custom DB view that has no access to sensitive data so even if authz code is totally broken, confidentiality is not compromised
2. Strategy: expose only public API endpoint or provide library with embedded API endpoint(s)?
3. consider: public API means maintaining it until the end of time essentially
    1. embed code might be better suited for the use case, but the contrary risk is to make sure it doesn’t break
    2. embed code allows to "version"/update the used API endpoint
    3. embed code might need additional data filters
4. isolation: new db user, new environment, one line of code should not change everything
5. idea for endpoint design:
    1. have authenticated users confirm publishing certain numbers, generate corresponding random ID and save
    2. /data/random-id endpoint, then resolve this URL to data: allows to monitor usage of endpoint
    3. very granular control but
    4. need to generate many endpoints for large data sets
    5. OR: more open /organisation/<id> endpoint but needs server-side permissioning
6. consider rate-limiting or DDoS protection
