# ADR: User Onboarding / Guide Tour Library

Trello-card: N/A

Decision Deadline: N/A

Author: @pylipp

## Status

Proposed

## Context or Problem Statement

Boxtribute's user base spans many partner organisations across Europe and the Middle East, and often includes volunteers who interact with the application infrequently. Without in-app guidance, new users struggle to discover core workflows (e.g. creating a distribution, managing stock, scanning box QR codes) and typically require hand-holding via external documentation or training sessions.

We need a solution to implement **user guides** directly inside the frontend: sequential steps that combine explanatory modals with contextual highlighting of specific UI elements. These guides should be able to cover full onboarding flows for new users as well as focused walkthroughs for individual features.

## Decision Drivers

- **Ease of implementation**: the solution must be quick to adopt and easy to extend with new guide flows without requiring significant boilerplate
- **Compatibility with existing frontend stack**: React 18, TypeScript, Vite, Chakra UI v2, Apollo Client
- **Extensibility**: new guide steps and flows must be easy to add or reorder; guide state (shown/not shown) should be persistable
- **Customisability**: tour UI should be stylable to match Boxtribute's Chakra UI-based design
- **License**: must be permissive (MIT or equivalent) for use in an open-source humanitarian project
- **Maintenance**: library should be actively maintained

## Considered Options

### Option 1: React Joyride

[react-joyride](https://docs.react-joyride.com/) is the most widely used React-native product tour library (~340k weekly npm downloads).

**How it works**: Define an array of `Step` objects (each referencing a DOM target selector and content), render a single `<Joyride>` component with a `run` boolean, and optionally supply a `tooltipComponent` for full visual control.

**Chakra UI integration**: The `tooltipComponent` prop accepts any React component, allowing full Chakra UI components (`Box`, `Button`, `Text`, etc.) to be used for tooltip rendering — making the tour UI indistinguishable from the rest of the app.

**Pros**:
- Declarative, React-idiomatic API
- First-class TypeScript support
- Full visual customisation via `tooltipComponent`
- Rich callback API (`callback` prop) for persisting tour state (e.g. `localStorage` or user profile)
- MIT licensed
- Actively maintained, large community

**Cons**:
- React 19 compatibility is not yet complete (not a concern for the current React 18 setup)
- Inline styles in the default tooltip can conflict with Chakra's styling if the custom `tooltipComponent` is not used

---

### Option 2: Driver.js

[Driver.js](https://driverjs.com/) is a lightweight, framework-agnostic TypeScript library focused on element spotlighting and popovers.

**How it works**: Instantiate imperatively in a `useEffect`, define steps as an array of `{ element, popover }` objects, and call `.drive()`.

**Chakra UI integration**: No native React API; integration is imperative. Popover styling is done via Driver.js's own CSS variables and class overrides, not via Chakra components directly.

**Pros**:
- Zero dependencies, very lightweight
- Excellent visual overlay/spotlight effect for directing attention to specific elements
- Written in TypeScript, MIT licensed
- Framework-agnostic (works regardless of React version)

**Cons**:
- No declarative React API — requires imperative wiring inside effects
- Tour steps cannot render Chakra UI components natively (popover content is HTML strings or nodes, not React components)
- More boilerplate for multi-page or async-dependent flows

---

### Option 3: Reactour

[Reactour](https://github.com/elrumordelaluz/reactour) is a minimal, declarative React tour component.

**Pros**:
- Simple declarative API
- React-native

**Cons**:
- Less actively maintained than React Joyride
- Fewer customisation options and a smaller ecosystem
- Limited callback/state management API

---

### Option 4: Shepherd.js (via react-shepherd)

[Shepherd.js](https://shepherdjs.dev/) is a full-featured tour library with a React wrapper.

**Pros**:
- Highly customisable (CSS class names, SVG backdrops, custom buttons)
- Strong accessibility (keyboard navigation, ARIA)

**Cons**:
- Requires a paid commercial license for commercial use (AGPL otherwise)
- React wrapper (`react-shepherd`) is not fully React 18/19 compatible
- Higher setup complexity

## Decision

**Adopt React Joyride** as the user guide / onboarding tour library.

It is the only option that is simultaneously:
1. Fully React-native and declarative
2. Natively customisable to render Chakra UI components (via `tooltipComponent`)
3. MIT licensed and actively maintained
4. Straightforward to extend with new guide flows

A recommended implementation pattern:
- Define guide steps per feature/page in colocated `*Tour.steps.ts` files
- Create a shared `<TourTooltip>` component using Chakra UI that is passed as `tooltipComponent`
- Track which tours a user has completed in `localStorage` (short-term) or in their profile via a GraphQL mutation (long-term)
- Expose a `useTour(tourId)` hook that controls the `run` state and persistence

Driver.js may be adopted as a **complementary** library in the future if a specific flow benefits from strong element spotlighting (e.g. directing a user to a specific button within a dense UI), but it is not needed for the initial implementation.

## Consequences

**Easier**:
- New onboarding flows can be added by defining a step array and rendering `<Joyride>` — no significant infrastructure changes needed
- Tour tooltips can use the full Chakra UI component library, keeping the guide UI consistent with the rest of the app
- Tour completion state is independently persistable per flow, enabling targeted re-showing of specific guides

**More difficult / watch-outs**:
- DOM target selectors (CSS selectors or element IDs) must be kept stable; refactoring component markup may silently break guide targeting
- Async-rendered elements (e.g. elements inside a modal that opens mid-tour) require explicit `disableScrolling` or step-delay handling
- React 19 upgrade in future will require checking react-joyride compatibility at that time
