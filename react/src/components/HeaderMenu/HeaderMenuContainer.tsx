import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import HeaderMenu from "./HeaderMenu";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";

const HeaderMenuContainer = () => {
  // const { globalPreferences } = useContext(GlobalPreferencesContext);
  const auth0 = useAuth0();
  const baseId = useParams<{ baseId: string }>().baseId;
  if(baseId == null) {
    return <AutomaticBaseSwitcher />
  }
  return <HeaderMenu baseId={baseId} {...auth0} />
};

export default HeaderMenuContainer;
