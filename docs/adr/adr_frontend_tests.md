# ADR: Use Playwright for End-to-End and Integration Testing

## Status

Proposed

## Context

The current testing setup for the Boxtribute front-end project uses React Testing Library and Vitest for unit and integration tests. While these tools are effective for testing individual components and their interactions, they do not provide a comprehensive solution for end-to-end (E2E) testing. E2E testing is crucial for ensuring that the application works correctly from the user's perspective, covering the entire workflow from start to finish.

Additionally, we are using Mock Service Worker (MSW) to mock API requests and avoid hitting the real server and database during tests. This allows us to test the application in isolation and ensure consistent test results.

## Decision Drivers

1. **Comprehensive E2E and Integration Testing**: We need a testing framework that can simulate real user interactions and test the application as a whole, as well as handle integration tests with mocked API requests.
2. **Cross-Browser Testing**: The ability to test the application across different browsers to ensure compatibility.
3. **Ease of Use**: The testing framework should be easy to set up and use, with good documentation and community support.
4. **Performance**: The framework should be fast and efficient, minimizing the impact on the development workflow.
5. **Integration with CI/CD**: The framework should integrate well with our existing CI/CD pipeline.

## Considered Options

1. **React Testing Library + Vitest**

   - Pros:
     - Well-suited for unit and integration tests.
     - Good community support and documentation.
     - Easy to set up and use.
   - Cons:
     - Limited to testing individual components and their interactions.
     - Does not provide comprehensive E2E testing capabilities.
     - No built-in support for cross-browser testing.

2. **Playwright**
   - Pros:
     - Comprehensive E2E and integration testing capabilities.
     - Supports cross-browser testing (Chromium, Firefox, WebKit).
     - Easy to set up and use with good documentation.
     - Fast and efficient, with parallel test execution.
     - Integrates well with CI/CD pipelines.
     - Can be used with Mock Service Worker (MSW) to mock API requests.
   - Cons:
     - Additional learning curve for developers familiar with React Testing Library and Vitest.
     - May require more setup for certain advanced use cases.

## Decision

We have decided to adopt Playwright for both E2E and integration testing in the Boxtribute front-end project. Playwright provides comprehensive testing capabilities, supports cross-browser testing, and integrates well with our existing CI/CD pipeline. Additionally, Playwright can be used with Mock Service Worker (MSW) to mock API requests, allowing us to test the application in isolation.

## Consequences

- **Positive**:

  - Improved test coverage with comprehensive E2E and integration tests.
  - Ability to test the application across different browsers.
  - Faster and more efficient testing with parallel test execution.
  - Better integration with our CI/CD pipeline.
  - Consistent test results by mocking API requests with MSW.

- **Negative**:
  - Additional learning curve for developers.
  - Potential need for additional setup for advanced use cases.

## Implementation

1. Set up Playwright in the project by following the [installation guide](https://playwright.dev/docs/intro).
2. Write E2E and integration tests using Playwright, utilizing MSW to mock API requests.
3. Integrate Playwright tests into the CI/CD pipeline.
4. Gradually replace existing E2E and integration tests written with React Testing Library and Vitest with Playwright tests.

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Vitest Documentation](https://vitest.dev/)
- [Mock Service Worker Documentation](https://mswjs.io/docs/)
