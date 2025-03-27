import { IMatchProductsFormData } from "components/BoxReconciliationOverlay/components/MatchProductsForm";
import { IReceiveLocationFormData } from "components/BoxReconciliationOverlay/components/ReceiveLocationForm";
import { atomWithStorage } from "jotai/utils";

type ReconciliationMatchProductFields = Pick<IMatchProductsFormData, "productId" | "sizeId">;

/** Persisted atom to cache the value for the Match Product form input in the Box Reconciliation View. */
export const reconciliationMatchProductAtom = atomWithStorage<ReconciliationMatchProductFields>(
  "reconciliationMatchProduct",
  {
    productId: {
      label: "Save Product As...",
      value: "",
    },
    sizeId: { label: "Save Size As...", value: "" },
  },
  undefined,
  { getOnInit: true },
);

/** Persisted atom to cache the value for the Receive Location form input in the Box Reconciliation View. */
export const reconciliationReceiveLocationAtom = atomWithStorage<IReceiveLocationFormData>(
  "reconciliationReceiveLocation",
  {
    locationId: {
      label: "Select Location",
      value: "",
    },
  },
  undefined,
  { getOnInit: true },
);
