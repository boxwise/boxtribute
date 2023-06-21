import { screen } from "tests/test-utils";
import userEvent from "@testing-library/user-event";

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
  options.forEach((option) => {
    expect(screen.getByRole("button", { name: option })).toBeInTheDocument();
  });
  subHeadings.forEach((subHeading) => {
    expect(screen.getByText(subHeading)).toBeInTheDocument();
  });
  await user.click(elementOutside);
  options.forEach((option) => {
    expect(screen.queryByText(option)).not.toBeInTheDocument();
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
) {
  const fieldControlInput =
    label !== undefined ? screen.getByLabelText(label) : screen.getByText(placeholderText);
  await user.click(fieldControlInput);
  const optionButton = screen.getByRole("button", { name: option });
  expect(optionButton).toBeInTheDocument();
  await user.click(optionButton);
  expect(screen.queryByRole("button", { name: option })).not.toBeInTheDocument();
  expect(screen.getByText(option)).toBeInTheDocument();
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

    const childrenDontHaveText = Array.from(node?.children || []).every((child) => !hasText(child));

    return childrenDontHaveText;
  };
}
