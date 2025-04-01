import { MatchProductsFormData } from "components/BoxReconciliationOverlay/components/MatchProductsForm";
import { IReceiveLocationFormData } from "components/BoxReconciliationOverlay/components/ReceiveLocationForm";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type ReconciliationMatchProductFields = Record<
  `${number}`,
  Pick<MatchProductsFormData, "productId" | "sizeId">
>;

/** Persisted atom to cache the value for the Match Product form input in the Box Reconciliation View. */
export const reconciliationMatchProductAtom = atomWithStorage<ReconciliationMatchProductFields>(
  "reconciliationMatchProduct",
  {
    // Default form values.
    "0": {
      productId: {
        label: "Save Product As...",
        value: "",
      },
      sizeId: { label: "Save Size As...", value: "" },
    },
  },
  undefined,
  { getOnInit: true },
);

/** Persisted atom to cache the value for the Receive Location form input in the Box Reconciliation View. */
export const reconciliationReceiveLocationAtom = atomWithStorage<IReceiveLocationFormData>(
  "reconciliationReceiveLocation",
  {
    // Default form values.
    locationId: {
      label: "Select Location",
      value: "",
    },
  },
  undefined,
  { getOnInit: true },
);

export const hasReconciliationMatchProductAtomCached = atom(
  (get) => Object.keys(get(reconciliationMatchProductAtom)).length > 1,
);
