# ADR: Typing GraphQL Usage

Author: [Felipe](https://github.com/fhenrich33)

## Status

Implemented

## Context

We need a reliable and efficient way to handle GraphQL typings in our project. Currently, we are using GraphQL Code Generator, which has its benefits but also some drawbacks. We are considering switching to `gql.tada` for the following reasons:

1. **Developer Experience**: `gql.tada` offers a more streamlined and intuitive developer experience. It simplifies the process of defining and using GraphQL types, reducing the cognitive load on developers.
2. **Type Inference**: `gql.tada` provides better type inference capabilities, which can lead to more accurate and maintainable code. This is particularly important in a dynamic and evolving codebase.
3. **Performance**: `gql.tada` is designed to be lightweight and fast, which can improve the overall performance of our development workflow.

## Decision

We will adopt `gql.tada` for typing GraphQL usage in our project. This decision is based on the following comparisons with GraphQL Code Generator:

### GraphQL Code Generator

- **Pros**:
  - Automatically generates TypeScript types from GraphQL schemas and operations.
  - Supports a wide range of plugins and configurations.
  - Well-documented and widely used in the community.
- **Cons**:
  - Can be complex to configure and maintain, especially for large projects.
  - Although we don't really need to manually check and review, generated code can be verbose and difficult to navigate.
  - Requires additional build steps, which can slow down the development process. While infrequent, we must regenerate the types when the schema changes.
  - Requires extra boilerplate code, as we need to pass generated types as generics to GraphQL functions.

### gql.tada

- **Pros**:
  - Simplifies defining and using GraphQL types with a more intuitive API.
  - Provides better type inference, reducing the need for manual type annotations.
  - Lightweight and fast, with minimal impact on build times.
  - Easier to integrate into existing projects with less configuration overhead.
  - A less impactful in the grand scheme of things but a nice bonus: orders of magnitude less generated code (a few thousand lines of code removed).
- **Cons**:
  - Less mature and less widely adopted compared to GraphQL Code Generator.
  - Nearly non-existent plugins and integrations available.

## Consequences

By adopting `gql.tada`, we expect to achieve the following benefits:

- Improved developer experience with a more intuitive and streamlined API. We can explore and experiment with queries from the code as we have type hints inside GraphQL strings.
- Better type inference, leading to more accurate and maintainable code.
- Faster development workflow with reduced build times.

However, we also acknowledge the potential risks:

- Limited community support and fewer available plugins compared to GraphQL Code Generator.
- Potential need for additional customizations or workarounds due to the relative immaturity of `gql.tada`.

Overall, we believe that the benefits of adopting `gql.tada` outweigh the potential drawbacks, and we are confident that this decision will lead to a more efficient and enjoyable development experience.

## Implementation

1. Integrate `gql.tada` into the project and replace existing GraphQL Code Generator configurations.
2. Update documentation and provide guidelines for using `gql.tada` in the codebase.
3. Monitor the adoption and gather feedback from the development team to ensure a smooth transition.

## References

- [gql.tada Documentation](https://gql-tada.0no.co/)
- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
