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


# Draft for prototypical implementation

The following serves as a concept for a first implementation of the "link-sharing" functionality.

## Idea

1. Authenticated user of base X creates link for statviz view
1. Authenticated user shares link with external person
1. External person opens link
1. External person sees statviz view for base X without any navigation options
1. After one week (or a custom time), the link expires. When the link is opened, a short message is displayed.

## Architecture

### Fundamental assumptions

- the shared data will be live (as opposed to "freezing" the data to the time of link creation)
- link format is `.../<code> (can't use `.../bases/X/statviz`: insecure because it's easy to navigate to other bases and view their data; also not unique (can't expire))
- the expiration time of the link is one week. Later we can make is customizable, and/or add an action to invalidate a created link
- we expose the public app in the new `shared` GAE service. Hence it won't interfer with the main `app` service

### Effects on full-stack

- there has to be a new action-based permission to allow link-creation for certain usergroups
- there has to be a public FE and a public GraphQL endpoint to fetch data
- the public FE is hosted under `shared.boxtribute.org` and deployed with the `deploy-shared` CircleCI job (depends on a new `build-statviz` job)
- the public GraphQL endpoint is exposed for the `shared` GAE service
- new DB view and user to avoid access to sensitive data

### Front-end

- the `statviz` folder already contains a public FE (showing the Dashboard at the route `/bases/X`)
- when a shared-link URL is requested, FE issues a BE query to ask for link validitity, and, if positive, return the data and view info. The FE routes to the corresponding view (under `.../<code>/`)

#### UI considerations

- public FE: there won't be any authentication (login) in the FE when the external person opens the link
- public FE: no menues or navigation options are available
- v2: action button for creating link on statviz view (only viewable for users with resp. permission)
- v2: copy created link directly to clipboard, or display it for copying?

### Back-end

- a public GraphQL endpoint is already available at `/public` (development only)
- any requested data must be validated through a code

#### GraphQL API

For v2:

```graphql
type Mutation {
  createShareableLink(creationInput: LinkCreationInput): ShareableLinkCreationResult
}

input LinkCreationInput {
  baseId: Int!
  validUntil: Datetime
  urlParameters: String
  view: ShareableView!
}

enum ShareableView {
  StatvizDashboard
}

union ShareableLinkCreationResult = ShareableLink | InsufficientPermissionError | UnauthorizedForBaseError | InvalidDateError

type ShareableLink {
  id: ID!
  code: String!
  baseId: Int!
  validUntil: Datetime
  urlParameters: String
  createdOn: Datetime!
  createdBy: User
  view: ShareableView!
  # null at creation
  data: DataCube
}
```

For the public GraphQL schema:

```graphql
type Query {
  resolveShareableLink(code: String!): ShareableLinkResult
}

union ShareableLinkResult = ShareableLink | ExpiredLinkError | UnknownLinkError

```

#### Database

- new `shareable_link` table to store meta-data (base ID, URL query parameters, expiration date, creation date, creator)
- corresponding peewee model

### Open questions

- [x] how to avoid misuse of the link, or the exposed public GraphQL endpoint (DDoS mitigation)? E.g. by rate limiting server-side based on link code, or https://cloud.google.com/armor/docs
- [x] can FE resolve a URL like `.../<code>` into a route like `.../<code>/bases/X/statviz` on the FE **and** process the returned data as if it was a GraphQL response? Yes, in principal it's possible
- [x] how do deal with routing changes (target of link becomes outdated)? We'd have to add redirection

### Alternative back-end

This section discusses the use of an external password-storage service like [PasswordPusher](https://github.com/pglombardo/PasswordPusher?tab=readme-ov-file) as a replacement for an in-house link-sharing back-end implementation. Please refer to [this ADR](../adr/adr_link-sharing-backend.md).
