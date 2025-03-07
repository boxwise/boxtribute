import { atom } from "jotai";

type IdNameTuple = {
  id: string;
  name: string;
};

export const availableBasesAtom = atom<IdNameTuple[]>([]);
export const organisationAtom = atom<IdNameTuple>();
export const selectedBaseAtom = atom<IdNameTuple>();

export const selectedBaseIdAtom = atom((get) => get(selectedBaseAtom)?.id || "0");
