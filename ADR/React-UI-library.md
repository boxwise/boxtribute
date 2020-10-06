# ADR: React UI Library
Discussion participants: [Roanna](https://github.com/aerinsol), [Soheima](https://github.com/soheimam), [Martin](https://github.com/DurkoMatko)

## Status

Under Revision

## Context

TBD

## Decision drivers

1. Branding Compliance: does the library allow for us to apply our branding guidelines to the product (colors, font, etc.)? 
2. Fit for Use Case: does it have components that support the functionality we need? Does it work across both mobile and desktop?
3. Developer Experience: 
4. Maintainability: As the team grows and changes, will it be easy to maintain and evolve the UI? 
5. Speed of Development: How fast is it to get the design we need up and running?

## Considered options

1. **[Material UI React](https://material-ui.com/components/grid/):** Martin built the initial version of the tab bar using this library. Extremely popular (61K stars on Github) and often the go-to design on Github. 
2. **[Semantic React](https://react.semantic-ui.com/):** Comprehensive set of components including forms, tables, and loading animations, rave reviews. Comes with style sheets for Adobe XD, Sketch, and Figma out of the box, so translating design to app implementation should be easy. Popular - 11.7K stars on Github. Was the initial first choice of Martin and Soheima.
3. **[Grommet](https://v2.grommet.io/):** Used by some big name corporations - Netflix, Uber, Shopify, etc.
4. **[Ant Design](https://ant.design/):** One of the most popular UI libraries out there, 63.8K starts on Github. Designed specifically around web apps and enterprise applications. However, as a result, it is desktop ortiented and does not support mobile views or mobile-first design well.
5. **[Carbon Design](https://www.carbondesignsystem.com/):** IBM based design system, supports B2B look and feel, but is primarily blue and gray based, and has a very "mainframe" style old school feel.
6. **[Evergreen](https://evergreen.segment.com/):**
7. **[RebassJS](https://rebassjs.org/):** Rebass takes a different approach than the other UI libraries - rather than starting out with a whole system of UI components in the library (sidebar, header, cards, chips etc.) Rebass starts out with a few basic components and then provides the user with UI primitive that they can then use to compose their own components and create a custom design system. It further allows for both detailed theming through Theme UI AND individual styling within a set of design contraints through Styled System. Well recommneded, 6.9K stars on Github.


## Decision
RebassJS. 

## Consequences

### Easier
- Applying the color scheme of our choice 
- Creating exceptions within a standard color scheme
- Single source of truth


### More difficult
- Fewer ready-made components, meaning that more initial design and composition is required.
- Custom documentation will need to be created specifically for Boxtribute's design system.
