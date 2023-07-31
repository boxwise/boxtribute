import React, { Context, createContext, useReducer } from "react";

export interface IIdAndNameTuple {
  id: string;
  name: string;
}

export interface IGlobalPreferences {
  selectedBase?: IIdAndNameTuple;
  availableBases?: IIdAndNameTuple[];
  organisation?: IIdAndNameTuple;
}

export interface IGlobalPreferencesContext {
  globalPreferences: IGlobalPreferences;
  dispatch: React.Dispatch<ISetGlobalPreferencesAction>;
}

const GlobalPreferencesContext: Context<IGlobalPreferencesContext> = createContext(
  {} as IGlobalPreferencesContext,
);

export interface ISetAvailableBasesAction {
  type: "setAvailableBases";
  payload: IIdAndNameTuple[];
}

export interface ISetSelectedBaseAction {
  type: "setSelectedBase";
  payload: IIdAndNameTuple;
}

export interface ISetOrganisationAction {
  type: "setOrganisation";
  payload: IIdAndNameTuple;
}

export type ISetGlobalPreferencesAction =
  | ISetAvailableBasesAction
  | ISetSelectedBaseAction
  | ISetOrganisationAction;

export const globalPreferencesReducer = (
  state: IGlobalPreferences,
  action: ISetGlobalPreferencesAction,
) => {
  switch (action.type) {
    case "setAvailableBases":
      return { ...state, availableBases: action.payload };
    case "setSelectedBase":
      return { ...state, selectedBase: action.payload };
    case "setOrganisation":
      return { ...state, organisation: action.payload };
    default:
      return state;
  }
};

const GlobalPreferencesProvider = ({ children }) => {
  const [globalPreferences, dispatch] = useReducer(globalPreferencesReducer, {});

  return (
    <GlobalPreferencesContext.Provider value={{ globalPreferences, dispatch }}>
      {children}
    </GlobalPreferencesContext.Provider>
  );
};

export { GlobalPreferencesContext, GlobalPreferencesProvider };
