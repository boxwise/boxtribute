/**
 * Converts a human-readable nav group or link name into a stable HTML id.
 *
 * Chakra UI v2 Accordion takes the id set on `AccordionItem` as a base and
 * generates `accordion-button-{id}` for the trigger and `accordion-panel-{id}`
 * for the collapsible region. Individual sub-link elements inside the panel
 * receive their own ids using this same scheme (e.g. `#nav-manage-boxes`).
 */
export function nameToNavId(name: string): string {
  return `nav-${name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;
}
