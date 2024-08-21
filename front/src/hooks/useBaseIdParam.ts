/**
 * Infers intended base ID from URL.
 */
export function useBaseIdParam() {
  // eslint-disable-next-line no-restricted-globals
  const baseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);

  const baseId = baseIdInput?.length && baseIdInput[1] || "0";

  return { baseId }
}
