import { MatchProductsFormData } from "components/BoxReconciliationOverlay/components/MatchProductsForm";
import { IReceiveLocationFormData } from "components/BoxReconciliationOverlay/components/ReceiveLocationForm";
import { atomWithStorage } from "jotai/utils";

interface SelectOption {
  label: string;
  value: string;
}

export interface BoxCreateFormCache {
  /** Identifies the user who stored this cache, so it can be discarded when a different user logs in. */
  userEmail?: string;
  productId?: SelectOption;
  sizeId?: SelectOption;
  locationId?: SelectOption;
  numberOfItems?: number;
}

/** Persisted atom to cache the most recently submitted box-creation form fields. */
export const boxCreateFormCacheAtom = atomWithStorage<BoxCreateFormCache>(
  "boxCreateFormCache",
  {},
  undefined,
  { getOnInit: true },
);

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

/** Persisted atom to cache the last selected Shipments tab (Receiving/Sending). */
export const shipmentsDirectionAtom = atomWithStorage<"Receiving" | "Sending">(
  "shipmentsDirection", // localStorage key
  "Receiving", // default value
  undefined,
  { getOnInit: true },
);
