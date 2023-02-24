import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AutomaticBaseSwitcher() {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const [errorMessage, setErrorMessage] = useState<string>();
  const auth0 = useAuth0();
  // state is populated in NotFoundView
  // state.origin holds a route that was initially requested,
  // but was not found in the routes
  const { state } = useLocation();

  useEffect(() => {
    const bases = globalPreferences.availableBases;
    if (bases && Array.isArray(bases)) {
      if (bases.length > 0) {
        const newBaseId = bases[0].id;
        // try to prepend /bases/:baseId to state.origin
        navigate(
          state && state.origin ? `/bases/${newBaseId}${state.origin}` : `/bases/${newBaseId}`,
        );
      } else {
        setErrorMessage("This user doesn't have access to any bases");
      }
    }
  }, [navigate, globalPreferences.availableBases, state]);

  if (errorMessage) {
    return (
      <>
        {errorMessage}
        <Button onClick={() => auth0.logout()}>Logout</Button>
      </>
    );
  }

  return <div />;
}

export default AutomaticBaseSwitcher;
