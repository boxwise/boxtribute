# ADR: React UI Library
Discussion participants: [Roanna](https://github.com/aerinsol), [Soheima](https://github.com/soheimam), [Martin](https://github.com/DurkoMatko)

## Status

Implementing

## Context

The plan around UI was always to create a separate NPM library that developers could pull in to implement and build out components. The intended result of this was to create a solution that made it easy to implement and maintain the desired design. Having a separate NPM library that developers can pull in means that we have greater control over library versioning and a single source of truth.

While the first set of components were implemented via Material UI React, Martin and Soheima consulted each other and decided to go for React Semantic UI, with tailwind.css to fill in the gaps. This was due to the fact that Martin had a good experience with Semantic in the past, and because its documentation and visual examples are easy to follow. Overall, Martin has said that he prefers a larger community with a more robust system out of the box for its easy and fat deployment.

However, after attempting to work with Semantic for some time, Soheima found that it uses a standard palette with extremely limited customization - only two other colors for primary/secondary are allowed. We are therefore revisiting this question of UI libraries to see if we can identify a better alternative.

## Decision drivers

1. Branding Compliance: does the library allow for us to apply our branding guidelines to the product (colors, font, etc.)?
2. Fit for Use Case: does it have components that support the functionality we need? Does it work across both mobile and desktop?
3. Developer Experience: How easy is it for front-end developers to render the UI as provided in the mockups in a clean and consistent way?
4. Maintainability: As the team grows and changes, will it be easy to maintain and evolve the UI?
5. Speed of Development: How fast is it to get the design we need up and running?

## Considered options

1. **[Material UI React](https://material-ui.com/components/grid/):** Martin built the initial version of the tab bar using this library. Extremely popular (61K stars on Github) and often the go-to design on Github. However, its documentation is quite clunky, and some of the components do not match with our needed functionality: for example, there is no way to enable a drop-down on the header bar for base switching.
2. **[Semantic React](https://react.semantic-ui.com/):** Comprehensive set of components including forms, tables, and loading animations, rave reviews. Comes with style sheets for Adobe XD, Sketch, and Figma out of the box, so translating design to app implementation should be easy. Popular - 11.7K stars on Github. However, it does not have the ability for users to apply their own color scheme for their UI.
3. **[Grommet](https://v2.grommet.io/):** Comes with their own design kit as well as some very useful functionality we would need in our application, such as forms, data visualization capabilities, and tables. Excellent examples and documentation with their own storybook.js implementation. Used by some big name corporations - Netflix, Uber, Shopify, etc.
4. **[Ant Design](https://ant.design/):** One of the most popular UI libraries out there, 63.8K starts on Github. Designed specifically around web apps and enterprise applications. However, as a result, it is desktop oriented and does not support mobile views or mobile-first design well.
5. **[Carbon Design](https://www.carbondesignsystem.com/):** IBM based design system, supports B2B well, but is primarily blue and gray based, and has a very "mainframe" style old school feel. Roanna dislikes this as it feels inconsistent with the modern, lightweight feel Boxtribute wishes to convey.
6. **[Evergreen](https://evergreen.segment.com/):** Quite rigid styling, including a limited palette of colors. Seems to be a UI kit that was mostly built out to support the styling of the [Segment](https://segment.com/) product rather than being an independent open-source design system for use across a variety of projects.
7. **[RebassJS](https://rebassjs.org/):** Rebass takes a different approach than the other UI libraries - rather than starting out with a whole system of UI components in the library (sidebar, header, cards, chips etc.) Rebass starts out with a few basic components and then provides the user with UI primitive that they can then use to compose their own components and create a custom design system. It further allows for both detailed theming AND application of individual styling variants for a component within a set of design contraints through [Theme UI](https://theme-ui.com/home) or [Styled System](https://styled-system.com/). Well recommended, 6.9K stars on Github.


## Decision
RebassJS. Although in an ideal world, we would have liked to start with a libaray that has many pre-built components out of the box, in reality, libraries that had this sort of set up were either too restrictive what their components could do (Semantic - weak theme customizations; Material, Ant Design - UI components do not fit and cannot be modified to behave the way we want them to behave) or too incomplete in their pre-built components (Grommet), meaning that a separate library would have to be brought in anyway to create custom components for Boxtribute. Since there did not seem to be an easy or elegant way to integrate new custom components with an existing library, we decided to go directly with the library that was created with custom UI building in mind.

## Consequences

### Easier
- Applying the color scheme of our choice
- Creating exceptions within a standard color scheme
- Single source of truth


### More difficult
- Fewer ready-made components, meaning that more initial design and composition is required.
- No built-in data visualization, a second library will be needed for this.
- Custom documentation will need to be created specifically for Boxtribute's design system.
