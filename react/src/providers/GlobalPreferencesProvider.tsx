import { t } from "msw/lib/glossary-dc3fd077";
import React, { Context, createContext, useReducer } from "react";

interface BaseIdAndNameTuple { id: string, name: string }

interface GlobalPreferences {
  availableBases?: BaseIdAndNameTuple[];
  selectedOrganisationId?: string;
  roles?: string[];
}

interface IGlobalPreferencesContext {
  globalPreferences: GlobalPreferences;
  dispatch: React.Dispatch<SetGlobalPreferencesAction>;
}

const GlobalPreferencesContext: Context<IGlobalPreferencesContext> = createContext(
  {} as IGlobalPreferencesContext,
);

interface SetAvailableBasesAction {
  type: "setAvailableBases";
  payload: BaseIdAndNameTuple[];
}

interface SetSelectedBaseIdAction {
  type: "setSelectedBaseId";
  payload: string;
}

interface SetRoles {
  type: "setRoles";
  payload: string[];
}


interface SetOrganisationId {
  type: "setOrganisationId";
  payload: string;
}

type SetGlobalPreferencesAction = SetAvailableBasesAction | SetSelectedBaseIdAction | SetOrganisationId | SetRoles;

const globalPreferencesReduer = (state: GlobalPreferences, action: SetGlobalPreferencesAction) => {
  switch (action.type) {
    case "setAvailableBases":
      return { ...state, availableBases: action.payload };
    case "setSelectedBaseId":
      return { ...state, selectedBaseId: action.payload };
    case "setOrganisationId":
      return { ...state, selectedOrganisationId: action.payload };
    case "setRoles":
      return { ...state, roles: action.payload };
    default:
      return state;
  }
}

const GlobalPreferencesProvider = ({ children }) => {

  const [globalPreferences, dispatch] = useReducer(globalPreferencesReduer, {});

  return (
    <GlobalPreferencesContext.Provider value={{ globalPreferences, dispatch }}>
      {children}
    </GlobalPreferencesContext.Provider>
  );
}

export { GlobalPreferencesContext, GlobalPreferencesProvider };
