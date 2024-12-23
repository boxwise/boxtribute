# ADR: Use Jotai for Global State Management

Author: [Felipe](https://github.com/fhenrich33)

Trello-card: https://trello.com/c/CK6TtXPS/1495-20-fe-replace-globalpreferencescontext

## Status

Proposed, Implementing

## Context or Problem Statement

We need a global state management solution for our React application. Currently, we are using React Context for this purpose. However, we have encountered some issues with ease of use and rendering performance. We are considering switching to a more efficient state management library and only leaving React Context for mandatory Dependency Injection.

## Decision Drivers

1. **Ease of development:** How simple is it to implement and maintain the state management solution?
2. **Rendering performance:** How well does the solution minimize unnecessary re-renders?
3. **Scalability:** How well does the solution handle increasing complexity and state size?
4. **Community and support:** How active and supportive is the community around the solution?

## Considered Options

1. Continue using React Context
2. Switch to Jotai
3. Switch to Zustand
4. Switch to Legend State

## Consequences

### Advantages of Jotai

1. **Ease of development:** Jotai provides a simpler and more intuitive API for managing state compared to React Context. It allows for more granular control over state updates, making it easier to manage complex state logic.
2. **Rendering performance:** Jotai minimizes unnecessary re-renders by only updating components that depend on the specific piece of state that has changed. This leads to better performance compared to React Context, which can cause entire component trees to re-render when the context value changes.
3. **Scalability:** Jotai's atom-based approach allows for better scalability as the state grows in size and complexity. Each atom represents a single piece of state, making it easier to manage and reason about the state.
4. **Community and support:** Jotai has an active and growing community, with good documentation and support. It is also backed by the same team that maintains Zustand, another popular state management library.

#### Jotai Example

```javascript
import { atom, useAtom } from "jotai";

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

### Drawbacks of Jotai

1. **Learning curve:** While Jotai is simpler to use than React Context, it still requires developers to learn a new API and mental model for managing state.
2. **Ecosystem:** React Context is a built-in feature of React, while Jotai is an external library. This means that Jotai may not have the same level of ecosystem integration and support as React Context.

### Advantages of Zustand

1. **Ease of development:** Zustand provides a simple and flexible API for managing state, with minimal boilerplate.
2. **Rendering performance:** Zustand minimizes unnecessary re-renders by using a subscription-based model, ensuring that only the components that depend on the changed state are updated.
3. **Scalability:** Zustand's flexible API allows for easy management of complex state logic and large state trees.
4. **Community and support:** Zustand has a growing community and is maintained by the same team as Jotai, ensuring good support and documentation.

#### Zustand Example

```javascript
import create from "zustand";

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Drawbacks of Zustand

1. **Learning curve:** Zustand requires developers to learn a new API and mental model for managing state.
2. **Ecosystem:** Zustand, like Jotai, is an external library and may not have the same level of ecosystem integration as React Context.

### Advantages of Legend State

1. **Ease of development:** Legend State provides a declarative API for managing state, making it easy to understand and use.
2. **Rendering performance:** Legend State optimizes rendering performance by using a fine-grained reactivity system, ensuring that only the necessary components are updated.
3. **Scalability:** Legend State's declarative approach allows for easy management of complex state logic and large state trees.
4. **Community and support:** Legend State has a dedicated community and good documentation, providing ample support for developers.

#### Legend State Example

```javascript
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const count = observable(0);

const Counter = observer(() => (
  <div>
    <button onClick={() => count.set(count.get() - 1)}>-</button>
    <span>{count.get()}</span>
    <button onClick={() => count.set(count.get() + 1)}>+</button>
  </div>
));
```

### Drawbacks of Legend State

1. **Learning curve:** Legend State requires developers to learn a new API and mental model for managing state.
2. **Ecosystem:** Legend State is an external library and may not have the same level of ecosystem integration as React Context.

## Comparison with React Context

### Ease of development

- **React Context:** Requires creating context providers and consumers, which can lead to boilerplate code and complexity in managing state updates. The least ergonomic API of them all, ironically.
- **Jotai:** Provides a simpler API with atoms and hooks, reducing boilerplate and making it easier to manage state updates. Think of it as `useState` but global and can derive state from multiple atoms.
- **Zustand:** Offers a simple and flexible API with minimal boilerplate, making it easy to manage state updates. Similar to Mobx and slightly so with Redux.
- **Legend State:** Provides a declarative API, making it easy to understand and use for basic cases. Not as great when using the API for maximum performance (wrapping components in `observer`, which looks like old HoC code).

### Rendering performance

See this [benchmark](https://legendapp.com/open-source/state/v2/intro/fast/) from the Legend State docs for reference.

- **React Context:** Can cause entire component trees to re-render when the context value changes, leading to potential performance issues and unnecessary re-renders.
- **Jotai:** Minimizes unnecessary re-renders by only updating components that depend on the specific piece of state that has changed. Second fastest while retaining very familiar API to React devs.
- **Zustand:** Uses a subscription-based model to minimize unnecessary re-renders. Faster than Context but slower than the others in this comparison.
- **Legend State:** Optimizes rendering performance with a fine-grained reactivity system. The fastest of all options, with the caveat of the optimal code not looking like standard React.

### Scalability

- **React Context:** Can become difficult to manage as the state grows in size and complexity, leading to potential performance and maintainability issues.
- **Jotai:** Atom-based approach allows for better scalability, making it easier to manage and reason about the state.
- **Zustand:** Flexible API allows for easy management of complex state logic and large state trees. Easier Redux-like state management.
- **Legend State:** Declarative approach allows for easy management of complex state logic and large state trees. There's the caveat of the non-standard looking API for the optimal performant code.

### Community and support

- **React Context:** Built-in feature of React with a large community and ecosystem support.
- **Jotai:** Excellent community with good documentation and support, second only to Zustand (maintained by the same team as Jotai), but may not have the same level of ecosystem integration as React Context (since it's baked in React).
- **Zustand:** Excellent community with good support and documentation, maintained by the same team as Jotai, but again, may not have the same level of ecosystem integration as React Context
- **Legend State:** Fairly dedicated community with good documentation and support, but less so than the other options. Worse integration than the others as Legend State removes itself from React conventions to achieve top performance.

## Decision

We are considering switching to Jotai for global state management in our React application. Jotai provides a simpler and more intuitive API, better rendering performance, and improved scalability compared to React Context. While Zustand and Legend State also offer significant advantages, Jotai's balance of ease of development and performance makes it the best choice for our needs.

## References

- [React Context Documentation](https://reactjs.org/docs/context.html)
- [Jotai Documentation](https://jotai.org/docs/introduction)
- [Zustand Documentation](https://zustand.surge.sh/)
- [Legend State Documentation](https://legendapp.com/open-source/state/v3/)
