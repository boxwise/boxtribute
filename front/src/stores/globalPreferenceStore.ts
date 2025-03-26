import { IMatchProductsFormData } from "components/BoxReconciliationOverlay/components/MatchProductsForm";
import { IReceiveLocationFormData } from "components/BoxReconciliationOverlay/components/ReceiveLocationForm";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type IdNameTuple = {
  id: string;
  name: string;
};

type IdOptionalNameTuple = {
  id: string;
  name?: string;
};

type ReconciliationMatchProductFields = Pick<IMatchProductsFormData, "productId" | "sizeId">;

/** The base name is only optional since it is also set through auth0 which only include ids. */
export const selectedBaseAtom = atom<IdOptionalNameTuple>();
/** The base names are only optional since it is also set through auth0 which only include ids. */
export const availableBasesAtom = atom<IdOptionalNameTuple[]>([]);
export const organisationAtom = atom<IdNameTuple>();

/** Read only atom to get the selected base id. */
export const selectedBaseIdAtom = atom((get) => {
  const selectedBase = get(selectedBaseAtom) ?? { id: undefined };
  // return the stored selected base id if it exists
  if (selectedBase.id) return selectedBase.id;
  // return the first available base id if it exists
  if (get(availableBasesAtom).length) return get(availableBasesAtom)[0].id;
  // This case should not happen except on initial render
  return "0";
});

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
