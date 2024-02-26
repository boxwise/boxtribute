# [Statviz] What options of sharing should we allow and what comes with it?

Last Updated: 2024-02-20

Discussion Participants: @haguesto, @aerinsol, maik

## Status

accepted

## Context or Problem Statement

In the DSEE 100x project titled "StatViz", our goal is to construct data visualizations derived from Boxtribute's data. This will allow our users to showcase their contributions and impact to the public through various mediums, such as their websites or newsletters.

We are giving here an overview over possible options for the user to share these visualizations - csv, svg, jpeg, iframe - and how much development and maintenance effort is needed in order to decide which options we should offer we should offer.

Currently, we are planning to build these visualizations in a React FE with Nivo and Visx (libraries based on D3) and query the underlying data from a GraphQL endpoint.

## Decision Drivers

1. **Keep it simple**: Let's try to not add complexity to our codebase, especially for low maintenance sake.

2. **Minimal development effort**: Keeping it simple might sometimes involve more effort to develop something.

3. Create an effective foundation / re-usability for the planned future availability / aid ordering project

4. Stay within DSEE 100x budget and avoid drawing from too many other resources (e.g. earmarked for other projects in Boxtribute) as much as possible

## Considered options to share data

### A. CSV download

#### What (minimal) work needs to be done on the FE side?

1. We add a (fancy graphs) view in the Boxtribute v2 React App from where all visualizations can be downloaded.
2. There should be options for filtering and grouping of the data in this view either globally or per visualization.
3. We need to create a component which triggers the query and download.
4. We need to create a function transforming the data from the graphQL query into csv format.

#### What (minimal) work needs to be done on the BE side?

1. We need to make the queries accessible through the private Boxtribute graphQL endpoint.

#### comments

Atm the filtering and grouping is happening on the FE side. The BE just returns all available data in the smallest granularity. There is the posibility to move filtering and grouping to the BE by making filters and grouping part of the graphQL query. This might make sense if we only allow the csv export.

### B. SVG download

#### What (minimal) work needs to be done on the FE side?

1. Steps 1, 2, 3 from CSV.
2. There should be an input at least for the aspect ratio (or width and height) of the exported svg. This input could also just be given the window size of the current view. All other properties like axis label font size, axis thickness,... could be calculated based on this input. However, I can imagine that they might want more styling options that they can directly control. At the same time they could easily change the style in the exported svg through Adobe or any coding IDE.
3. Nivo and VisX generate svgs inside the DOM, e.g. for the preview. To download an svg, a second svg in the dom must be created and then taken out of the DOM to create a downloadable svg.

#### What (minimal) work needs to be done on the BE side?

1. same steps as for CSV

#### comments

- Atm the filtering and grouping is happening on the FE side. Combined with svg previews that is a cool thing. The user can filter and group dynamically without sending requests to the BE. This means that it goes much faster for the user to find the right filter/grouping options that you want for the export of the svg.

- When importing the svg into an email campaign, the svg can be responsive (through CSS) and even basic tooltips and animations (svg SMIL features) should be possible. However, not all email clients support this and probably a fallback bitmap image should be added. At the same time, I'm not sure how well the email editor in mailchimp works and probably you need to add the svg through the code editor of mailchimp.

### C. bitmap (aka PNG) download

#### What (minimal) work needs to be done on the FE side?

1. same steps as for svg.
2. There should be a function to convert the preview svg that is in the fancy graphs view to a png.
3. (Maybe some some more styling controls like resolution)

#### What (minimal) work needs to be done on the BE side?

1. same steps as for CSV

#### comments

- Since we use a library for the conversion of svg to bitmap I hope we can offer multiple formats like png, jpeg, but also more modern ones like AVIF and WebP.

### D. STATIC iframe embed directly generating html docs for the iframe

#### What (minimal) work needs to be done on the FE side?

1. same steps as for SVG.
2. There needs to be a function transforming the data from the graphQL query into the iframe embed. The embed itself is probably just an html file, which holds some static data needed for the visualzation, some js to generate the svg based on the data and maybe even some filters and grouping selection.

#### What (minimal) work needs to be done on the BE side?

1. same steps as for CSV

#### comments

Most likely the embed will get large since data and js (maybe even React code) must be in it. I cannot really estimate how much work this might be.

### E. STATIC iframe embed through server-less FE

#### What (minimal) work needs to be done on the FE side?

1. same steps as for SVG.
2. We create a separate public React FE which is hosted on some Google Bucket and whose route is used for the embed.
3. We make a shared components out of the svg generation and probably filtering between the Boxtribute v2 and the Statviz public FE.
4. We create a function that stores the data that should be used for the embedable iframe somewhere in the same Google Bucket where the FE is hosted. (similar approach like forestry for our landing page)
5. The embed is then just a link to the public statviz frontend and the data that is used for the visualization is also statically stored somewhere in the FE.
6. We need to add a way in Boxtribute v2 to enable / disable public sharing of certain visualizations (only possible with the right permissions).

#### What (minimal) work needs to be done on the BE side?

1. same steps as for CSV
2. We need to add a way in Boxtribute v2 to enable / disable public sharing of certain visualizations (only possible with the right permissions).

#### comments

- lots of new complexity especially around storing, updating, deleting static data in the frontend.
- in comparison to D, the data is stored somewhere in the FE and we do not just directly pass it through an html file. --> probably a small cost increase since we will need more Bucket storage.

### F. LIVE and DYNAMIC iframe embed

#### What (minimal) work needs to be done in Auth0?

1. We need to give ABP and RBP permissions to user roles that allow making certain data public or not. (Probably we have to do this for any other option above, too)

#### What (minimal) work needs to be done on the FE side?

1. same steps as for SVG.
2. We create a separate public React FE which is hosted on some Google Bucket and whose route is used for the embed.
3. We need to add a way in Boxtribute v2 to enable / disable public sharing of certain visualizations (only possible with the right permissions).
4. The embed is then just a link to the public statviz frontend and the data is coming from a public graphQL endpoint.
5. (Maybe we want to limit the filtering/grouping options/range somehow)

#### What (minimal) work needs to be done on the BE side?

1. same steps as for CSV
2. adding a db table that is tracking which visualization is publically available for which base.
3. a mutation/query that updates/reads which visualization is publically available for which base.
4. creation of a public graphQL endpoint. (done)
5. The public graphQL endpoint should query the data from a read-only replica so that it does not interfere with the Boxtribute v2 app. (done)
6. We need to make the queries for the visualizations available through the public endpoint, too. (tiny)
7. We need to add some authorization that only when the visualization is enabled for a base then the data is returned.

#### comments

We will need this set-up or a similar set-up for the availability map.

## Decision

We start with A,B,C and focus on this for now. I actually realized that there is a way that the second Statviz FE never needs an authentication layer as long as we move all the (sharing) controls into the Boxtribute app. The separate Stativiz FE would only be needed for iframe embeds in whatever way.

## Consequences
