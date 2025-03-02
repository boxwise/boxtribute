import { atom } from "jotai";

type IdNameTuple = {
  id: string;
  name: string;
};

type IdOptionalNameTuple = {
  id: string;
  name?: string;
};

// the base name is only optional since it is also set through auth0 which only include ids
export const selectedBaseAtom = atom<IdOptionalNameTuple>();
// the base names are only optional since it is also set through auth0 which only include ids
export const availableBasesAtom = atom<IdOptionalNameTuple[]>([]);
export const organisationAtom = atom<IdNameTuple>();

// read only atom to get the selected base id
export const selectedBaseIdAtom = atom((get) => {
  const selectedBase = get(selectedBaseAtom) ?? { id: undefined };
  // return the stored selected base id if it exists
  if (selectedBase.id) return selectedBase.id;
  // return the first available base id if it exists
  if (get(availableBasesAtom).length) return get(availableBasesAtom)[0].id;
  // This case should not happen except on initial render
  return "0";
});
