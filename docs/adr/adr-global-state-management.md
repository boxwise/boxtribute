# ADR: Use Jotai for Global State Management

Trello-card: [Link to Trello card if relevant]

Decision Deadline: [Add Date]

Discussion Participants: [Add list of discussion participants and list their Github profile or email]

## Status

Proposed

## Context or Problem Statement

We need a global state management solution for our React application. Currently, we are using React Context for this purpose. However, we have encountered some issues with ease of use and rendering performance. We are considering switching to Jotai as an alternative.

## Decision Drivers

1. **Ease of use:** How simple is it to implement and maintain the state management solution?
2. **Rendering performance:** How well does the solution minimize unnecessary re-renders?
3. **Scalability:** How well does the solution handle increasing complexity and state size?
4. **Community and support:** How active and supportive is the community around the solution?

## Considered Options

1. Continue using React Context
2. Switch to Jotai

## Decision

We will switch to Jotai for global state management.

## Consequences

### Advantages of Jotai

1. **Ease of use:** Jotai provides a simpler and more intuitive API for managing state compared to React Context. It allows for more granular control over state updates, making it easier to manage complex state logic.
2. **Rendering performance:** Jotai minimizes unnecessary re-renders by only updating components that depend on the specific piece of state that has changed. This leads to better performance compared to React Context, which can cause entire component trees to re-render when the context value changes.
3. **Scalability:** Jotai's atom-based approach allows for better scalability as the state grows in size and complexity. Each atom represents a single piece of state, making it easier to manage and reason about the state.
4. **Community and support:** Jotai has an active and growing community, with good documentation and support. It is also backed by the same team that maintains Zustand, another popular state management library.

### Drawbacks of Jotai

1. **Learning curve:** While Jotai is simpler to use than React Context, it still requires developers to learn a new API and mental model for managing state.
2. **Ecosystem:** React Context is a built-in feature of React, while Jotai is an external library. This means that Jotai may not have the same level of ecosystem integration and support as React Context.

## Comparison with React Context

### Ease of use

- **React Context:** Requires creating context providers and consumers, which can lead to boilerplate code and complexity in managing state updates.
- **Jotai:** Provides a simpler API with atoms and hooks, reducing boilerplate and making it easier to manage state updates.

### Rendering performance

- **React Context:** Can cause entire component trees to re-render when the context value changes, leading to potential performance issues.
- **Jotai:** Minimizes unnecessary re-renders by only updating components that depend on the specific piece of state that has changed.

### Scalability

- **React Context:** Can become difficult to manage as the state grows in size and complexity, leading to potential performance and maintainability issues.
- **Jotai:** Atom-based approach allows for better scalability, making it easier to manage and reason about the state.

### Community and support

- **React Context:** Built-in feature of React with a large community and ecosystem support.
- **Jotai:** Active and growing community with good documentation and support, but may not have the same level of ecosystem integration as React Context.

## References

- [Jotai Documentation](https://jotai.org/docs/introduction)
- [React Context Documentation](https://reactjs.org/docs/context.html)
- [Comparison of State Management Libraries](https://blog.logrocket.com/comparing-state-management-tools-react/)
