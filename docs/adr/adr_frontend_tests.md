# ADR: Use Playwright for Application, Integration and Component Testing

Author: [Felipe](https://github.com/fhenrich33)

## Status

Proposed, Implementing

## Context

The current testing setup for the Boxtribute front-end project uses React Testing Library and Vitest for unit and integration tests. While these tools are effective for testing individual components and their interactions, the tests usua. E2E testing is crucial for ensuring that the application works correctly from the user's perspective, covering the entire workflow from start to finish.

Additionally, we are using Mock Service Worker (MSW) to mock API requests and avoid hitting the real server and database during tests. This allows us to test the application in isolation and ensure consistent and fast test results.

## Decision Drivers

1. **Comprehensive Testing**: We need a testing framework that can simulate real user interactions and test the application as a whole, as well as handle integration tests with mocked API requests.
2. **Cross-Browser Testing**: The ability to test the application across different browsers to ensure compatibility.
3. **Ease of Use**: The testing framework should be easy to set up and use, with good documentation and community support.
4. **Performance**: The framework should be fast and efficient, minimizing the impact on the development workflow.
5. **Integration with CI/CD**: The framework should integrate well with our existing CI/CD pipeline.

## Considered Options

1. **React Testing Library + Vitest**

   - Pros:
     - Well-suited for unit and integration tests.
     - Good community support and documentation.
     - Easy to set up and use for isolated testing.
   - Cons:
     - Limited to testing individual components and their interactions.
     - Does not provide comprehensive application testing capabilities (in comparison to Playwright).
     - Runs against a mocked DOM structure (jsdom) instead of a real browser, which leads to flakiness and unreliability.
     - No built-in support for cross-browser testing.

2. **Playwright**
   - Pros:
     - Comprehensive application, integration and component testing capabilities.
     - Tests against the real DOM, as even in headless mode the tests run inside a real browser.
     - Supports cross-browser testing (Chromium, Firefox, WebKit).
     - Easy to set up and use with excellent documentation. The API for test specs are very similar to React Testing Library.
     - Ability to generate tests by using the app. See https://playwright.dev/docs/codegen-intro.
     - Can still run isolated component tests. See https://playwright.dev/docs/test-components.
     - Can run visual diffing. See https://playwright.dev/docs/test-snapshots.
     - Fast and efficient, with parallel test execution. Might not match React Testing Library speed but gets close while testing in a real environment.
     - Integrates well with CI/CD pipelines in headless mode.
   - Cons:
     - Additional learning curve for advanced use cases.
     - May require extra setup for advanced use cases.
     - Slightly slower than React Testing Library for sequential test runs (alleviated by parallel runs).

## Decision

We have decided to adopt Playwright for application, integration and component testing in the Boxtribute front-end project. Playwright provides comprehensive testing capabilities, supports cross-browser testing, and integrates well with our existing CI/CD pipeline. Additionally, Playwright can be used with Mock Service Worker (MSW) to mock API requests, allowing us to test the application in isolation, while faithfully mimicking the real server since the mocks infer the data types from the GraphQL Schema. Vitest will still be used for individual TypeScript functions and modules.

## Consequences

- **Positive**:

  - Improved test coverage with comprehensive application, integration and component tests.
  - Ability to test the application across different browsers.
  - Fast testing with parallel test execution, while being more faithful to how a user will experience the app.
  - Better integration with our CI/CD pipeline. Less prone to flakyness.
  - Consistent test results by mocking API requests with MSW based on our GraphQL Schema.

- **Negative**:
  - Additional learning curve for developers.
  - Potential need for additional setup for advanced use cases.
  - Heavier Development and CI/CD setup, as we install real browsers as dependencies.

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Vitest Documentation](https://vitest.dev/)
- [Mock Service Worker Documentation](https://mswjs.io/docs/)
