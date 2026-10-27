# ADR: Retrieval of list datasets from the back-end

[Trello-card](https://trello.com/c/7kHZnK8d)

Decision deadline: Oct 22nd, 2026

Discussion Participants: [Philipp](https://github.com/pylipp), [Roanna](https://github.com/aerinsol), [Hans](https://github.com/HaGuesto), [James](https://github.com/jamescrowley)

## Status

Accepted.

## Context

- large bases hold up to 12k non-deleted boxes (up to 7k Donated, 5k Instock, 6k Scrap)
- requesting boxes for ManageBoxes currently has a very high limit (100k), and fetching large numbers of boxes at once leads to large loading times of around 20s
- we currently circumvent this by fetching 50 most-recently modified boxes of each Instock/Donated/Scrap at initial page load, and fetching all remaining Instock boxes in the background
- the average response size is about 1.3kB per box which results in a 6.5MB response for 5k boxes
- the memory load on the server for constructing the GraphQL response with peewee and ariadne leads to occasional shutdowns. The raw SQL query itself is not the bottleneck (1-2s for 6k boxes)
- users with large inventory have complained about negative impacts on UX
- we want to port ManageBeneficiaries to v2 which features a table view, too. The largest base holds 12k beneficiaries.
- large number of records being filtered and sorted at once in the FE show noticeable UX degradation

## Decision Drivers

1. **UX**
    - the current ManageBoxes FE has fast sorting, filtering, and searching capabilities using react-table once all boxes have been loaded
    - excessive server loading times delay readiness of FE for interactions
    - User first principle: do not want to make any changes that will materially deviate from how users use the platform or impede aid distribution workflows
1. **Download size**. In areas with bad reception, loading the full ManageBoxes content with thousands of boxes must still provide an acceptable UX
1. **Scalability**. With the planned growth of the managed service to mid-and-larger sized NGOs and logistics clusters, bases can contain an unlimited number of boxes, realistically 20k or 50k, that we have to handle properly in both FE and BE; beneficiary counts can be 2-10x larger than box counts and often have nested content in the form of families. 
1. **Maintainability**. Boxtribute is looking for ONE solution that can address both Boxes and Beneficiary records; we do not want to have to do a re-write in one year. Solution must also be reasonably robust and extensible to data transformation and data decoration features (tagging, custom fields, bulk updates, advanced filtering, etc.)
1. **Complexity**. Currently the FE functionality is almost independent of the BE, once all boxes have been loaded. 

## Considered Options

### A: Optimize response structure and size

- the GraphQL response contains duplicated data (e.g. names of products, categories, locations, sizes, tags that are shared by many boxes)
- due to GraphQL's nature the response is nested but needs to be flattened for tabular display anyways
- **Option A.0**: extend API to provide flat list of boxes. The database query can be run with raw SQL instead of going through peewee
- **Option A.1**: in addition to A.0, return only IDs for box attributes and look up names via a second query (similar to Dashboard queries)
- **Option A.2**: in addition to A.0 or A.1, load only the data for the default table columns. Add a FE action to load all columns
- **Option A.3**: in addition to A.0 or A.1 or A.2, load only the most-recently modified records. Assuming a somewhat constant work pace of the users, this would cap the number of records being loaded at once
- experiments show that A.1 decreases BE load by 3x, and response size by 3x, but that response time grows linearly (N) with # of records.

### B: BE pagination

- utilize server-side pagination to load a page of 50 records at once
- response is constructed from only 50 records at once
- response size is small (50kB). We can consider to initially load more than one page for faster page navigation

### C: Raw data response

- avoid overhead of response construction with ariadne and peewee
- query all records directly from database, and return as JSON array
- FE loads response into react-table
- downsides: typing in response is lost; still not scalable because the response size increases with the number of records

## Decision

Option B, BE pagination.

Albeit the large effort to extend existing mutations, and to implement filtering and sorting capabilities in the BE, the solution reflects industry best-practices and is sustainable because it won't need any update if larger organisations join.

It might be tempting to implement a pragmatic solution such as A.3 in order to achieve scalability. However in the end this also requires extending the bulk-mutations to handle select-all FE functionality. Since we've currently got funding available, we want to obtain a sustainable, long-term solution now rather than hitting scalability issues again a year from now.

#### Consequences

- well-scalable ManageBoxes/ManageBeneficiaries. Regardless of bases holding 10k, 100k, or 1M boxes/beneficiaries, loading and displaying data is quick
- unchanged UX: filtering and bulk-actions
- sorting UX: only single-field sorting (react-table allows for filtering by multiple fields) - acceptable because there is no evidence that multi-field sorting is currently in use nor can be applied to solve an important use case.
- text search: disable client-side data text search
- complexity: FE and BE are more tightly coupled. Every page navigation, every filter changed, every sorting dimension changed needs to be communicated to the BE to execute the matching database query and return the matching records
- for v2 ManageBeneficiaries, bulk-mutations and FE pagination can be designed and implemented with the more performant concept in mind
- a more detailed implementation plan can be found [here](../manageboxes-pagination.md)
