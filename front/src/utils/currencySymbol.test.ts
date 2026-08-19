import { describe, it, expect } from "vitest";
import { currencySymbol } from "./currencySymbol";

describe("currencySymbol", () => {
  it("returns the mapped symbol for a known currency code", () => {
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("GBP")).toBe("£");
  });

  it("returns an empty string when the code is undefined", () => {
    expect(currencySymbol(undefined)).toBe("");
  });

  it("returns an empty string when the code is null", () => {
    expect(currencySymbol(null)).toBe("");
  });

  it("returns an empty string when the code is an empty string", () => {
    expect(currencySymbol("")).toBe("");
  });

  it("falls back to the code itself for an unknown currency code", () => {
    expect(currencySymbol("AUD")).toBe("AUD");
  });
});
