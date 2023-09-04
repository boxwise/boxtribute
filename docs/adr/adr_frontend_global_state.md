# Global Frontend State Mgmt with Apollo or React Context

Decision Deadline: Not imminent

Author: HaGuesto

## Status

Early Discussion and research phase

## Context or Problem Statement

There are a few mutable global variables/shared states in the frontend that we want to access in all of the DOM. The basic example is something like `Dark Mode`. In our case, information about the bases and organisations a user has access to is best saved globally and not queried each time a new.

In olden times you would use something like Redux.

In React there is a concept called Context. By wrapping a branch of the DOM with a context all children of the branch can access the state of the context. At the moment we use a context for the Global Preference Provider which makes information of the bases you have access to accesible to all the DOM. We also use the `useReducer` hook there.

Since we are using Apollo for graphQL queries we can also use the Apollo Reactive Variables and the Apollo cache to manage part of the state. Configured correctly we might have not needed to write our own Global Preference Context. Since Apollo is querying all the information of bases from the backend it probably would have been easier to just store this information in the Apollo cache which you then can access anywhere in the DOM.

## Decision Drivers

- keeping code complexity at a low level / easy learning curve for new developers
- handle mutable shared states securely
- easily sync remote states with the Boxtribute server or Auth0

## Considered Options

### React Context (with useReducer)
Usually, one writes a Reducer in addition to React Context when you handle global states. In some simple cases the `useState` hook should be enough, but is not recommended. The reasons are:

1. Predictable state changes: Reducers enforce a predictable way of changing state, which can help prevent bugs caused by unexpected state changes. Since reducers always produce a new state based on the previous state and an action, it's easier to reason about how the state changes in response to different actions.
2. Separation of concerns: Using a reducer can help you separate your state logic from your component code, which can make it easier to maintain and reason about your application. By keeping your state logic in a separate file, you can make it easier to test, debug, and refactor.
3. Debugging: Since reducers are pure functions, they can be easier to debug than other state management approaches. You can log the inputs and outputs of the reducer function and use tools like Redux DevTools to visualize the state changes over time.

Therefore, we only consider the combination of React Context with useReducer here.

Here are some general pros and cons to consider:

#### Pros:

- provides a way to manage global state within a React component tree without the need for an external library
- works well with other React features like hooks and context providers, making it easy to share state and functions between components

#### Cons:

- can require more boilerplate code for setting up and managing the context and reducer functions
- can be less performant than other global state management approaches like Redux, especially if the state is deeply nested or frequently updated


### [Apollo local state](https://www.apollographql.com/docs/react/local-state/local-state-management)

Similar as for React Context, one should distinguish between the Reactive Variables of Apollo and working with local-only cache fields. Only the later is really recommended for global state changes. Similar to a Reducer you also have to define the read and write queries for local-only cache fields. Reactive Variables are very similar to the concept of the `useState` hook. Therefore, to the same reasons as before we only consider local-only fields here.

Here are some general pros and cons to consider:

#### Pros:

- works well for remote states/data which can be synced async
- remote states and local-only states can be easily combined in the cache, e.g. a box in the Apollo cache can get an additional local-only (meaning client only) property like `wasScannedByQrReader`. When the box is queried, it only fetches the remote data and adds the local-only properties from the cache.
- can simplify the code for fetching and managing data, especially if your application already uses Apollo for server-side data fetching

#### Cons:

- can require more setup and configuration than simpler state management solutions
- can be more difficult to debug and troubleshoot, especially if you're new to GraphQL or Apollo

## Proposed Decision

React Context and Apollo can both and should both be used for global state management in React depending on the specific requirements of the feature.

### Comment
In general, a mix out of both considered options is most likely needed to handle mutable shared states. In some cases the Apollo has more advantages (especially for remote states), sometimes the React Context is better to use. 
We should try out Apollo when the next mutable shared state comes around like for the QrReader when scanning multiple Boxes.
There is no need to refactor the Global Preference Provider at the moment. Removing the React Context of the Global Preference Provider and creatingthe same structure in Apollo for it, is just unnecassary work. The Global Preference Provider works and the code is clean. 

## Reference

Please check these videos if you want to know more:

- https://www.youtube.com/watch?v=tBz3UmZG_bk
- https://www.youtube.com/watch?v=xASrlg9rmR4
