// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { cache } from "queries/cache";
import { beforeEach, vi } from "vitest";
import "regenerator-runtime/runtime";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";

// -------- Apollo cache
// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

// -------- Mocking Toasts
// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render-function.
// Therefore, we need to mock the notification and error toasts.
// These are the functions that are we use in the tests to check if the toast was called.
export const mockedTriggerError = vi.fn();
export const mockedCreateToast = vi.fn();
// This is needed to mock the import of the useErrorHandling and useNotification hooks.
vi.mock("hooks/useErrorHandling");
vi.mock("hooks/useNotification");
// This is needed to mock the useErrorHandling and useNotification hooks.
// .mocked() is a nice helper function for typescript support
const mockedUseErrorHandling = vi.mocked(useErrorHandling);
const mockedUseNotification = vi.mocked(useNotification);
// This is needed to return the mocked functions when the hooks are called.
mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });

beforeEach(() => {
  // Reset the cache before each test
  cache.restore(emptyCache);
  // Reset the mocked toast before each test
  mockedTriggerError.mockClear();
  mockedCreateToast.mockClear();
});
