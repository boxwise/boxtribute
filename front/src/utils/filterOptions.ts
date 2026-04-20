import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

/**
 * Derives a sorted, deduplicated list of filter options from table data.
 *
 * - For plain string/number values the value itself is used as both key and label.
 * - For object values, `id` is used as the key and `name` as the label (objects
 *   missing either are skipped). An optional `labelFn` overrides the default label.
 */
export function createOptions(
  data: Record<string, any>[],
  columnId: string,
  labelFn?: (value: any) => string,
): IFilterValue[] {
  const uniqueMap = new Map<string, IFilterValue>();

  data
    .map((row) => row[columnId])
    .filter(Boolean)
    .forEach((v) => {
      let key: string;
      let label: string;

      if (typeof v === "object" && v !== null) {
        if (v.id == null) return;
        key = String(v.id);
        if (!key || key === "undefined") return;

        if (labelFn) {
          label = String(labelFn(v));
        } else {
          if (v.name == null) return;
          label = String(v.name);
        }
      } else {
        key = String(v);
        label = labelFn ? String(labelFn(v)) : String(v);
      }

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { label, value: key, urlId: key });
      }
    });

  return Array.from(uniqueMap.values()).sort((a, b) =>
    (a.label ?? "").localeCompare(b.label ?? ""),
  );
}
