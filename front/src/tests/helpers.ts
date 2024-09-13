import { expect } from "vitest";
import { act, screen, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";

type UserEvent = ReturnType<typeof userEvent.setup>;

export async function assertOptionsInSelectField(
  user: UserEvent,
  label: RegExp | string,
  options: (RegExp | string)[],
  elementOutside: HTMLElement,
  subHeadings: (RegExp | string)[] = [],
) {
  const fieldControlInput = screen.getByLabelText(label);
  options.forEach((option) => {
    expect(screen.queryByText(option)).not.toBeInTheDocument();
  });
  subHeadings.forEach((subHeading) => {
    expect(screen.queryByText(subHeading)).not.toBeInTheDocument();
  });
  await user.click(fieldControlInput);
  options.forEach(async (option) => {
    expect(await screen.findByRole("option", { name: option })).toBeInTheDocument();
  });
  subHeadings.forEach((subHeading) => {
    expect(screen.getByText(subHeading)).toBeInTheDocument();
  });
  await user.click(elementOutside);
  options.forEach(async (option) => {
    await waitFor(() => {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    });
  });
  subHeadings.forEach((subHeading) => {
    expect(screen.queryByText(subHeading)).not.toBeInTheDocument();
  });
}

export async function selectOptionInSelectField(
  user: UserEvent,
  label: RegExp | string | undefined,
  option: RegExp | string,
  placeholderText: RegExp | string = "",
  isMulti: boolean = false,
  optionInTestingEnvironment: string = "option",
) {
  const fieldControlInput =
    label !== undefined ? screen.getByLabelText(label) : screen.getByText(placeholderText);
  await user.click(fieldControlInput);
  const optionButton = await screen.findByRole(optionInTestingEnvironment, { name: option });
  expect(optionButton).toBeInTheDocument();
  await user.click(optionButton);
  if (isMulti) {
    await waitFor(() => {
      expect(
        screen.queryByRole(optionInTestingEnvironment, { name: option }),
      ).not.toBeInTheDocument();
    });
  }
  expect(await screen.findByText(option)).toBeInTheDocument();
}
// Returns text content of given element
// Cf. https://github.com/testing-library/dom-testing-library/issues/410#issuecomment-1060917305
export function textContentMatcher(textMatch: string | RegExp) {
  const hasText =
    typeof textMatch === "string"
      ? (node: Element) => node.textContent === textMatch
      : (node: Element) => textMatch.test(node?.textContent || "");

  return (_content: string, node: Element) => {
    if (!hasText(node)) {
      return false;
    }

    // eslint-disable-next-line testing-library/no-node-access
    const childrenDontHaveText = Array.from(node?.children || []).every((child) => !hasText(child));

    return childrenDontHaveText;
  };
}
