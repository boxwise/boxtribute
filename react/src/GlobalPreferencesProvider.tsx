import React, { Context, createContext, useReducer } from "react";

interface BaseIdAndNameTuple { id: string, name: string }

interface GlobalPreferences {
  availableBases?: BaseIdAndNameTuple[];
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

type SetGlobalPreferencesAction = SetAvailableBasesAction | SetSelectedBaseIdAction;

const globalPreferencesReduer = (state: GlobalPreferences, action: SetGlobalPreferencesAction) => {
  switch (action.type) {
    case "setAvailableBases":
      return { ...state, availableBases: action.payload };
    case "setSelectedBaseId":
      return { ...state, selectedBaseId: action.payload };
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