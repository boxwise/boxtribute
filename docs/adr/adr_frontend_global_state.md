# Global Frontend State Mgmt with Apollo or React Context

Decision Deadline: Not imminent

Author: HaGuesto

## Status

Early Discussion and research phase

## Context or Problem Statement

There are a few mutable global variables/shared states in the frontend that we want to access in all of the DOM. The basic example is something like `Dark Mode`. In our case, information about the bases and organisations a user has access to is best saved globally and not queried each time a new.

In olden times you would use something like Redux.

In React there is a concept called Context. By wrapping a branch of the DOM with a context all children of the branch can access the state of the context. At the moment we use a aontext for the Global Preference Provider which makes information of the bases you have access to accesible to all the DOM. We also use the `useReducer` hook there.

Since we are using Apollo for graphQL queries we can also use the Apollo Reactive Variables and the Apollo cache to manage part of the state. Configured correctly we might have not needed to write our own Global Preference Context. Since Apollo is querying all the information of bases from the backend it probably would have been easier to just store this information in the Apollo cache which you then can access anywhere in the DOM.

## Decision Drivers

- keeping code complexity at a low level
- handle mutable shared states securely

## Considered Options

- React Context (with or without useReducer)
- Apollo Reactive Varibles and cache

## Decision

Most likely, a mix is needed to handle mutable shared states depending on the case.
We should try out Apollo Reactive Var and cache when the next mutable shared state comes around or we refactor now the GlobalPreference Provider.

## Reference

Please check these videos if you want to know more:

- https://www.youtube.com/watch?v=tBz3UmZG_bk
- https://www.youtube.com/watch?v=xASrlg9rmR4
