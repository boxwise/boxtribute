# ADR: How to do etl in the backend for the DSEE100x project "StatViz"?

Decision Deadline:

Author: @pylipp, @HaGuesto

## Status

proposed

## Context

In the DSEE 100x project titled "StatViz", our goal is to construct data visualizations derived from Boxtribute's data. This will allow our users to showcase their contributions and impact to the public through various mediums, such as their websites or newsletters.

Currently, data meant for these visualizations is planned to be served through a public GraphQL endpoint that is implemented using a stack of MySQL, Peewee, Flask, and Ariadne.

## Problem Statement

While we are committed to implementing visualizations, several questions related to data extraction, transformation, loading (ETL), hosting, and caching need to be addressed:

- **Data Structure Evaluation**: Our existing data structure's compatibility needs assessment. Can we efficiently extract the necessary data for all the proposed visualizations using the present structure? Or is there a need to modify or extend our data schema, as suggested [here](https://github.com/boxwise/boxtribute/blob/master/docs/adr/adr_database-history.md)?

- **Data Transformation**: Given our technology stack, what are the best practices to transform and serve data efficiently and rapidly?

- **Data Format**: To ensure consistency and seamless integration between backend and frontend, we must define a standard format for returning the data. What should this format look like?

## Decision Drivers

1. **Non-Interference with Boxtribute's Performance**: Any solution we adopt should not compromise the responsiveness and efficiency of the main Boxtribute application.

2. **Security**: No private data should be accessible to the public. We do not want to introduce new security risks.

3. **Cost Efficiency**: Implementing the ETL process and serving the data should be done with minimal additional financial impact.

4. **Server Response Latency**: The time it takes for the server to respond with the requested data should be minimized to ensure a seamless user experience.

5. **Manageable Data Size**: The size of the returned data should be optimized so that frontend applications can perform operations like dynamic filtering and sorting without performance degradation.

6. **Utilization of Existing Data**: We should target that we can already leveraging the data already present in Boxtribute.

7. **Scalability**

8. **Data Freshness**: There isn't a requirement for real-time data. A one-day lag in data freshness is acceptable, which might open up opportunities for batch processing or scheduled updates.

9. **Minimize Server Requests**: We aim to reduce the number of requests made to the server to ensure efficient data retrieval and reduce server strain.

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

1. **Basic Dimesnions**: At the very least, the returned dimensions should be the foundation of the visualization. For instance, a demographic plot requires dimensions like gender and age.
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
    tagIds: Int[],
    count: Int
  }, ...],
  dimensions: {
    tag: [{id: 1, name: ....}, ...],
  }
}
```

### B. Data Transformation

The BE has to transform Boxtribute's data to be able to return the data in the desired fromat from above. Now, the question arises when and how to do these transformations. We see the following options:

#### B.1 On-the-fly Transformation During GraphQL Requests

This is straight-forward solution and how we started for the first visualizations - Directly transform operational data from Boxtribute in response to incoming graphQL requests.

**Pros**:

- you only need to write the query
- live data

**Cons**:

- query with many reads directly from the Boxtribute db

  --> increase of cost & latency, not scalable, interference with the Boxtribute db

#### B.2 Scheduled Nightly Transformation

Since the data returned for analytics does not have to be live, we have the option to transform the data nightly and cache it.

**Caching options**: Database, File-System, Redis or similar.

**Cache Update Strategies**:

- _Full Refresh_: Purge the cache nightly and transform all data anew.
- _Incremental Update_: Sequentially extend the cache with data changes that occurred during the day.

**Pros**:

- clear separation of operational data in Boxtribute db and analytical data in a cache

  --> separation of high risk data, no interference with Boxtribute

- improved queries with few reads for the public endpoint

  --> no huge increase in cost (depending on the cache), low latency

**Cons**:

- no live data
- more code writing nightly transformation and caching

#### B.3 Reactive Transformation on Boxtribute Data Updates

Instead of preparing the data for analytics once a night, we could also directly update the cache when a change happens to the Boxtribute operational db. We have not really considered this option, but it would be possible.

### C. Data structure

Our current method of tracking changes to database records, like stock or people, employs a centralized history table. Its design is as follows:

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

For instance, when a box transitions from one warehouse to an external location, the history table captures it as:

```
(..., tablename, record_id, changes, ..., changedate, from_int, to_int, ...)
(..., "stock", "Box1", "location_id", ..., "2023-08-07 12:00:00", 1, 2) // change from WH1 to Free Shop
(..., "stock", "Box1", "box_state_id", ..., "2023-08-07 12:00:00", 1, 2) // change from InStock to Donated
```

This data structure efficiently captures transactional data changes, but extracting historical snapshots (like warehouse stock at a particular time) is more complex.

Therefore, we considered introducing shadow tables in the db which at the end would be similar to B.3 with the cache being placed in the db.

## Decisions

1. **[Data Format] Incorporation of User Filters**:We will integrate User Filters as dimensions in the returned data.

   We assume that including these dimensions will not bloat the data to a size where the Front End cannot handle it. No reloads and dynamic filtering for the user are the attractive factors for this decision.

2. **[Data Format] Handling of URL Filters**:URL Filters will be implemented as variables in the GraphQL queries rather than dimensions in the returned data.

   Visualizations are typically embedded via URLs. This design means users won't have dynamic control over these filter values within embedded visualizations. Consequently, embedding URL filters as query variables suffices without burdening the system with additional dimensions that offer no direct user benefit.

3. **[Data Transformation] Nightly Transformations**:

   With our visualizations accessible via a public endpoint and the anticipation of embedding them on public channels, there's potential for a rapid increase in backend requests. This might peak especially during promotional campaigns by our users. To prevent any disruption to the Boxtribute app:

   - We propose hosting the public GraphQL API endpoint on a distinct Google service, separate from the Boxtribute backend.
   - Data will undergo nightly transformation and be cached independently. Consequently, requests to the public endpoint will bypass resources that the Boxtribute app directly accesses.

4. **[Data Transformation] Caching in DB**:
   We aim to cache this data in dedicated database tables to avoid the added complexity of filesystem or Redis caching. This is cost-effective in comparison to Redis caching. A lingering question, however, is whether to house this data in a distinct database or an isolated MySQL instance on Google Cloud SQL to guarantee no performance disruptions to the Boxtribute app.

5. **[Data Transformation] Incremental updates of the cache**
   Our caching approach seeks to facilitate incremental updates. These updates will be determined by new daily entries to the history table. Nevertheless, there exists a potential risk of the cache and the database becoming unsynchronized. Such discrepancies might arise from deleted history entries, direct edits to the db or actions that do not save changes to the history table. To counteract this, we intend to introduce tests to cross-check the transformed cache data against the Boxtribute database content.

6. **[Data Structure] No additional db tables are needed in the Boxtribute DB**

   The history table is sufficiently detailed, enabling us even to recreate past data snapshots. Since we are aiming for a nightly transformations, transforming the db (e.g. recreating past snapshots) do not have to be optimized for runtime.

   While there's an option to introduce shadow tables for core tracked data like stock and people, transformations would still be essential to tailor this data for varied visualizations. Thus, there's no compelling reason to modify the operational database structure of Boxtribute.

   Nevertheless, we should do an audit to ascertain that all transactions are tracked within the history table. For instance, operations like assigning or removing tags from stock or people currently bypass the history table.

## Next steps

- [Data Format] We should define a rough threshold for the data size to be returned from BE to FE and monitor it.
- [Data Format] Monitor performance on FE for dynamic filtering.
- [Data Transformation] have the graphQL endpoint hosted on its own service.
- [Data Transformation] figure out the best way to schedule nightly data transformations tasks, e.g. with cron jobs.
- [Data Transformation] figure out the best way to cache the nightly prepared data (or check if just adding additional db tables is enough for now).
- [Data Transformation] implement incremental updates to the cache and find good test functions.
- [Data Structure] figure out which transactions are tracked incorrectly or not at all in the history table.
