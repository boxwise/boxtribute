# ADR: Frontend for Statistic

Decision Deadline: 31.07.2023
Updated: 2024-02-20

Discussion Participants: Hans, Maik

## Status

accepted

## Context or Problem Statement

An overview and visualization of Boxtribute data could be useful for users in fundraising, when embedded on their website, social media profiles, email newsletters or setting goals that can be used as in fund applications. It will also increase the Transparency.

We need a frontend that enables us to display statistics of Boxtribute data for organizations that can be embedded on websites, emails and social media.

## Decision Drivers

1. Flexibility must support simple charts and should support maps
2. Solution must be easy to use for organizations with little technical Know-How
3. Diagrams and Statistics must be embeddable in E-Mails, Websites and Social Media
4. Security

## Considered Options

### Web Frontend with React and D3 or Chart.js

D3 is a flexible and modular JavaScript library that provides building blocks for creating diagrams and visualizations. Diagrams and visualizations need to be implemented by us, but there is good documentation and a lot of good examples.

Chart.js is a simple and easy to use JavaScript library which enables us to set up simple charts quickly. There is a module to make creating Maps easy. Basic interactive functions like Tooltips are provided by default, however Chart.js is limited to the provided charts.

### Observability platforms like Grafana or Redash

Tools like Grafana or Redash would save us development time on the frontend and provide organizations with flexible tools to create diagrams themselves on top of their Boxtribute data. Grafana however is not suited as it would provide access to the MySQL database through their query API and should be used inside of trusted environments (e. g. inside a company). Dashboards should not be shared in public. Redash seems to be more secure and queries can be hidden from public dashboards, NGOs however would still have access to edit their dashboard which can still be a security concern.

We could provide Grafana or Redash with a read only user on specific tables or databases but users could query the data without further restrictions which can lead to security or performance issues.

Redash and Grafana would also increase the operational cost as we need someone to administrate the added infrastructure, keeping it up-to-date and secure. Also we don't have that much control over the design and options.

In general those observability platforms are best suited for near real-time monitoring inside a trusted network and therefore do not really fit our usecase.

## Decision

The most important decision drivers here are:

- flexibility (D3 is better then chart.js)
- simplicity (React frontend is better then Grafana/Redash)
- security (React frontend is better then Grafana/Redash)
- embeddable (Most control with a React frontend)

Conclusion: We will use a React frontend with Visx

Visx is a React library providing components for D3 that can be directly used in our application.

Update 2024-02-20:
To improve the speed of frontend development we evaluated to include NIVO library and use it for most Visualizations. Nivo is a supercharged, pre-configured set of D3 components. It needs much less configuration than Visx. Its not meant to complement Visx.

We use Pre build Visualizations from Nivo for most use cases
\*\* PieChart, BarChart, Sankey

Custom Visualizations with Visx for specific use cases
\*\* DemographicChart
