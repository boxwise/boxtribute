/**
 * Infers intended base ID from URL.
 */
export function useBaseIdParam() {
   
  const baseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);

  const baseId = baseIdInput?.length && baseIdInput[1] || "0";

  return { baseId }
}
