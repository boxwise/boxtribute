# ADR: How to do ETL in the backend for the DSEE100x project "StatViz"?

Decision Deadline:

Author: @pylipp, @HaGuesto

## Status

first decisions made, we are still iterating on some parts of the ADR

## Context

In the DSEE 100x project titled "StatViz", our goal is to construct data visualizations derived from Boxtribute's data. This will allow our users to showcase their contributions and impact to the public through various mediums, such as their websites or newsletters.

Currently, data meant for these visualizations is planned to be served through a public GraphQL endpoint that is implemented using a stack of MySQL, Peewee, Flask, and Ariadne.

## Problem Statement

While we are committed to implementing visualizations, several questions related to data extraction, transformation, loading (ETL), hosting, and caching need to be addressed:

- **Hosting**: How do we host the public backend for the Statviz project so that it does not interfere with the performance of the Boxtribute app?

- **Data Structure and Transformation**: Our existing data structure's compatibility needs assessment. Can we efficiently extract the necessary data for all the proposed visualizations using the present structure? Or is there a need to modify or extend our data schema, as suggested [here](https://github.com/boxwise/boxtribute/blob/master/docs/adr/adr_database-history.md)? If we need an additional data structure when is this data written. What transformations are needed?

- **Data Format**: To ensure consistency and seamless integration between backend and frontend, we must define a standard format for returning the data. What should this format look like?

## Decision Drivers

1. **Non-Interference with Boxtribute's Performance**: Any solution we adopt should not compromise the responsiveness and efficiency of the main Boxtribute application.

2. **Security**: No private data should be accessible to the public. We do not want to introduce new security risks.

3. **Keep it simple**: Let's try to not add complexity to our codebase, especially for low maintenance sake.

4. **Cost Efficiency**: Implementing the ETL process and serving the data should be done with minimal additional financial impact.

5. **Server Response Latency**: The time it takes for the server to respond with the requested data should be minimized to ensure a seamless user experience (<1s).

6. **Manageable Data Size**: The size of the returned data should be optimized so that frontend applications can perform operations like dynamic filtering and sorting without performance degradation.

7. **Utilization of Existing Data**: We should target that we can already leveraging the data already present in Boxtribute.

8. **Scalability**: The amount of data is most likely to analyze is not scaling linearly. We should implement solutions that we do not have to refactor in six months.

9. **Data Freshness**: There isn't a requirement for real-time data. A one-day lag in data freshness is acceptable, which might open up opportunities for batch processing or scheduled updates.

10. **Minimize Server Requests**: We aim to reduce the number of requests made to the server to ensure efficient data retrieval and reduce server strain.

## Considered Options

### A. Data Format

#### A.1 About OLAP Cubes and Star Schema:

Our inspiration comes from the architectures of data warehouses, especially OLAP cubes, which provide insights through data analysis.

We intend to standardize the return data using a star schema to facilitate the creation of reusable components. A sample structure of the returned GraphQL query is:

```
dataQueryForVisualization {
  facts: [{
    dim1_Id: ...,
    dim2_Id: ...,
    fact: ...
  }, ...],
  dimensions: {
    dim1: [{id: 1, name: ....}, ...],
    dim2: [...]
  }
}
```

#### A.2 Determining Visualization Dimensions:

The hard part is to determine the best set of returned dimensions for each visualization. In general, we can differentiate the dimensions into three categories:

1. **Basic Dimensions**: At the very least, the returned dimensions should be the foundation of the visualization. For instance, a demographic plot requires dimensions like gender and age.
2. **User Filters**: If users can apply filters, such as a creation date, including these dimensions lets the frontend dynamically adjust the data. Excluding these necessitates backend-side data preparation and passing them as GraphQL query variables.
3. **URL Filters**: Filters, like which organization or base a visualization targets, can be passed as dimensions or as GraphQL query variables.

#### A.3 N-to-N dimensions

Handling many-to-many (N-to-N) relationships in OLAP cubes can be tricky, as they can introduce ambiguity and potential double counting of facts.

For instance, while examining beneficiary demographics, a potential N-to-N relationship is the "tags". We considered a star scheme that looks like:

```
beneficiaryDemographics {
  facts: [{
    gender: String,
    age: Int,
    tagId: Int,
    count: Int
  }, ...],
  dimensions: {
    tag: [{id: Int, name: String}, ...],
  }
}
```

However, grouping by gender or age can cause double counting due to lost relational information among tags.

To tackle this, we chose a non-standard star scheme. Since our data isn't restricted to relational table layouts, dimensions can be represented by arrays. This leads to:

```
beneficiaryDemographics {
  facts: [{
    gender: String,
    age: Int,
    tagIds: [Int],
    count: Int
  }, ...],
  dimensions: {
    tag: [{id: 1, name: ....}, ...],
  }
}
```

### B. Data Structure and Transformation

Our current method of tracking changes to database records, like stock or people, employs a single, centralized "history" table. Its design is as follows:

```
CREATE TABLE `history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `tablename` varchar(255) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `changes` text,
  `user_id` int(11) unsigned DEFAULT NULL,
  `ip` varchar(20) DEFAULT NULL,
  `changedate` datetime DEFAULT NULL,
  `from_int` int(11) DEFAULT NULL,
  `to_int` int(11) DEFAULT NULL,
  `from_float` float DEFAULT NULL,
  `to_float` float DEFAULT NULL,
)
```

For instance, when a box transitions from one warehouse to an external location, the "history" table captures it as:

```
(..., tablename, record_id, changes, ..., changedate, from_int, to_int, ...)
(..., "stock", "Box1", "location_id", ..., "2023-08-07 12:00:00", 1, 2) // change from WH1 to Free Shop
(..., "stock", "Box1", "box_state_id", ..., "2023-08-07 12:00:00", 1, 5) // change from InStock to Donated
```

This data structure efficiently captures transactional data changes, but extracting historical snapshots (like warehouse stock at a particular time) is more complex.

In order to figure out whether the current "history" table is "enough", we started with directly transforming operational data from Boxtribute in response to incoming graphQL requests. We did not cache any for these transformations or create additional data-structure.

We learned (see PR #1013) that

- the structure of the "history" table already allows us to reproduce old states of data

  --> the data structure is compatible to respond to (probably) all queries.

- However, it comes at a great cost when the computation-heavy part is executed in pure Python (see PR #1013). Even with a small sample size the latency of recreating old states of the data with the transactional data from the "history" table lead to an unacceptable latency of >1s.

  -->**We need to add a cache, or extend the schema, or use optimized SQL queries** to make the analytical queries run faster.

### B.1 Extending the DB schema

Especially querying historical snapshots of data is read-intensive with the transactional "history" table.
Therefore, to reduce the latency of such queries we consider adding data structures to the schema that make querying snapshots easier.

#### B.1.1 Adding Bi-temporal / Shadow Tables

One considered approach is to add (Bi-)temporal Table (we called them Shadow Tables [here](https://github.com/boxwise/boxtribute/blob/master/docs/adr/adr_database-history.md)) for certain entities, e.g. boxes (stock table) and beneficiaries(people table), with a structure similar to

```
(..., box_id, location, box_state, ..., time_lower, time_upper, ...)
(..., "Box1", "WH", "InStock", ..., "2023-08-07 12:00:00", "2023-09-10 13:00:00", ...)
(..., "Box1", "Free Shop", "Donated" ..., "2023-09-10 13:00:00", Infinity, ...)
```

**Pros**:

- in our first attempt (PR #1013) we actually transformed the data from the "history" table into such a structure.

  --> It is the format we need at some point in the transformation process.

**Cons**:

- duplication of data: The data that is stored in such a shadow table holds the same data as a combination of the stock and "history" table

#### B.1.2 Extension of the "history" table

Instead of adding new tables to the db schema, we also have the option to extend the existing "history" table. This could be done by adding columns that hold information about the state of the changed entity before or after the transaction.

Currently, we do not have a good idea to implement such an approach since we save changes of different entities (e.g. stock and people) with different structures in the same "history" table.

A straight-forward way would be to create tables like proposed in B.1.1 (for e.g. people and stock) and to add a column in the "history" table that references the corresponding state of the different entities in the corresponding shadow tables.

#### B.1.3 When and how to update data in the new db structures

In general, we have the following options for **Update Strategies**:

- _Update on change through Boxtribute app_: shadow tables are updated through the app when the change happens.

  Pros: directly implemented in app (no out-of-mind out-of-side problem)

  Cons: we need to touch dropapp

- _Update on change through db triggers_: When the "history" db is updated, call a db trigger to update the shadow table in the db.

  Pros: easy to implement since we only need to add triggers in the db

  Cons: adding business logic in the db layer; out-of-mind out-of-sight problem.

- _Batch update on request_: When the graphQL request is coming in to query the analytical data, update the shadow table with data since the last request.

  Pros: implementation only needs to happen on Statviz BE

  Cons: adding complexity through adding a batch update process; Out-of-mind out-of-sight problem.

- _Batch update on scheduled time_: update the shadow table in recurring intervals of time (e.g. nightly).

  Cons: adding complexity through adding a batch update process; adding complexity through adding recurring time trigger; Out-of-mind out-of-sight problem; no live data

**About Out-of-sight Out-of-mind:**

This was mentioned multiple times above. It refers to the situation when the data of the shadow table is derived from a secondary source aka the "history" table. This leads to the problem that the update of the shadow table is disconnected from actual transactions in the app. Thus, when the transactions in the app are changed, the transformation for the shadow table is easily broken.

**About live data:**

If the data in the visualizations are not close to live, we will generate support requests from our users that we cannot resolve.

Nightly transformations are usually implemented when multiple primary data sources need to be involved. This is not the case for us.

### B.2 Caching

Another approach to reduce latency of our analytical queries is to cache the query results instead of extending the db schema.
The question when and how the cache is populated is similar to B.1.3.

**Caching storage options**: Database, File-System, Redis or similar.

**Cache Update Strategies**:

- _Full Refresh_: Purge the cache regularly and transform all data a new.
- _Incremental Update_: Sequentially extend the cache with data changes that occurred during the day.

**Pros**:

- implementation is only needed at the statviz BE

**Cons**:

- probably each query needs a cache

### B.3 Pure SQL queries

SQL alone is a very powerful to extract and transform data, especially with appropriate indexing of tables. The largest tables by far are the history table (1.5M rows) and the stock table (100k rows) which is considered fairly small for any production database.

**Pros**:

- queries can be integrated in pure SQL (previously tested via SQL IDE or similar)

**Cons**:

- advanced SQL knowledge required
- query performance might deteriorate by time (increasing data size)

## Decisions

1. **[DONE] Data Format - Incorporation of User Filters**: We will integrate User Filters as dimensions in the returned data.

   We assume that including these dimensions will not bloat the data to a size where the Front End cannot handle it. No reloads and dynamic filtering for the user are the attractive factors for this decision.

2. **[DONE] Data Format - Handling of URL Filters**: URL Filters will be implemented as variables in the GraphQL queries rather than dimensions in the returned data.

   Visualizations are typically embedded via URLs. This design means users won't have dynamic control over these filter values within embedded visualizations. Consequently, embedding URL filters as query variables suffices without burdening the system with additional dimensions that offer no direct user benefit.

3. **[DONE] Data structure - We need a way to speed up certain analysis queries**:

   See section B.

4. **[DONE] ~~We rather extend the db schema than cache the result of each query in a cache storage~~ We use advanced SQL queries**:

   We avoid the additional complexity that would be introduced by adjusting the software architecture and/or database structure.
   ~~Extending the db schema is the solution that creates less duplication of data and is less complex to implement and maintain. File-system and Redis caching would additionally increase complexity and probably cost. We currently work on a concrete proposal for the data schema, but it will most likely be additional shadow tables for stock and people with inter-linking to the "history" table.~~

5. **[DONE] Hosting - We will implement read-only replicas and host the public endpoint on a separate service**:

   ~~With our visualizations accessible via a public endpoint and the anticipation of embedding them on public channels, there's potential for a rapid increase in backend requests. This might peak especially during promotional campaigns by our users.~~ To prevent any disruption to the Boxtribute app (most important decision driver):

   - we make visualizations accessible only to Boxtribute users. Public exposure is postponed, also for data privacy concerns.
   - ~~We host the public GraphQL API endpoint on a distinct Google service, separate from the Boxtribute backend.~~
   - we will query analytical data only from a read-only replica

6. **[POSTPONED] ~~Security measurements to separate public from private personal data~~**:

   During the creation of this ADR, we also touched how we can ensure that no personal data - data that identifies a person - is passed through the public endpoint:

   - a separate db user is used for the Statviz BE
   - this db user has no access to the db tables people or cms_users
   - if data from these tables are needed we need to create db views of these tables that do not contain personal information.

7. **[IRRELEVANT] ~~Data Transformation - update on change through Boxtribute app~~**

   see B.1.3.

   Even though that we have to touch dropapp, it is the cleanest solution that does not add complexity and probably will be the easiest to maintain in the long run since we have no out-of-sight, out-of-mind problem.

   Since we keep historical data in parallel in two separate places, there exists a potential risk of the shadow table and the history becoming unsynchronized. Such discrepancies might arise from deleted history entries, direct edits to the db or actions that do not save changes to the history table. To counteract this, we intend to introduce tests to cross-check the shadow table against the history table.

## Next steps

- [ ] [Data Format] We should define a rough threshold for the data size to be returned from BE to FE and monitor it.
- [ ] [Data Format] Monitor performance on FE for dynamic filtering.
- [x] [Hosting] ~~have the graphQL endpoint hosted on its own service.~~
- [x] [Hosting] Figure out read-only replicas.
- [x] [Security] ~~Implement new db user for statviz BE.~~
- [x] [Data Structure] ~~figure out which transactions are tracked incorrectly or not at all in the history table.~~
- [x] [Data Structure] ~~create C4 diagrams for data structure proposal.~~
- [x] [Data Transformation] ~~estimate work on dropapp~~
