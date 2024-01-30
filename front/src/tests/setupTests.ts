// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { cache } from "queries/cache";
import { beforeEach } from "vitest";
import "regenerator-runtime/runtime";

// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

beforeEach(() => {
  cache.restore(emptyCache);
});
