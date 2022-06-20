import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import HeaderMenu from "./HeaderMenu";

const HeaderMenuContainer = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { isAuthenticated, logout, user, loginWithRedirect } = useAuth0();
  const baseId = useParams<{ baseId: string }>().baseId;
  return <HeaderMenu />
};

export default HeaderMenuContainer;
