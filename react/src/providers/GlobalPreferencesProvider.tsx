import React, { Context, createContext, useReducer } from "react";

export interface BaseIdAndNameTuple {
  id: string;
  name: string;
}

export interface GlobalPreferences {
  availableBases?: BaseIdAndNameTuple[];
  selectedOrganisationId?: string;
}

export interface IGlobalPreferencesContext {
  globalPreferences: GlobalPreferences;
  dispatch: React.Dispatch<SetGlobalPreferencesAction>;
}

const GlobalPreferencesContext: Context<IGlobalPreferencesContext> = createContext(
  {} as IGlobalPreferencesContext,
);

export interface SetAvailableBasesAction {
  type: "setAvailableBases";
  payload: BaseIdAndNameTuple[];
}

export interface SetSelectedBaseIdAction {
  type: "setSelectedBaseId";
  payload: string;
}

export interface SetOrganisationId {
  type: "setOrganisationId";
  payload: string;
}

export type SetGlobalPreferencesAction =
  | SetAvailableBasesAction
  | SetSelectedBaseIdAction
  | SetOrganisationId;

export const globalPreferencesReduer = (
  state: GlobalPreferences,
  action: SetGlobalPreferencesAction,
) => {
  switch (action.type) {
    case "setAvailableBases":
      return { ...state, availableBases: action.payload };
    case "setSelectedBaseId":
      return { ...state, selectedBaseId: action.payload };
    case "setOrganisationId":
      return { ...state, selectedOrganisationId: action.payload };
    default:
      return state;
  }
};

const GlobalPreferencesProvider = ({ children }) => {
  const [globalPreferences, dispatch] = useReducer(globalPreferencesReduer, {});

  return (
    <GlobalPreferencesContext.Provider value={{ globalPreferences, dispatch }}>
      {children}
    </GlobalPreferencesContext.Provider>
  );
};

export { GlobalPreferencesContext, GlobalPreferencesProvider };
