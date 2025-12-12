/**
 * Helper for the default predefined `AccordionItem` expanded item depending on the current route.
 *
 * Pass an array of a single number if theres a match, as this is the expected value for the prop `defaultIndex` if `allowMultiple` is `true`.
 *
 * https://v2.chakra-ui.com/docs/components/accordion/usage#expand-multiple-items-at-once
 */
export function expandedMenuIndex() {
  const path = document.location.pathname.split("/").at(-1);

  switch (path) {
    case "statviz":
      return [0];
    case "boxes":
      return [1];
    case "shipments":
    case "agreements":
      return [2];
    case "products":
      return [5];
    default:
      return undefined;
  }
}
