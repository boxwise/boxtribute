import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenu from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

const HeaderMenuContainer = () => {
  // const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const auth0 = useAuth0();
  const baseId = useParams<{ baseId: string }>().baseId;
  if(baseId == null) {
    return <AutomaticBaseSwitcher />
  }
  return <HeaderMenu currentActiveBaseId={baseId} {...auth0} availableBases={globalPreferences.availableBases} />
};

export default HeaderMenuContainer;
