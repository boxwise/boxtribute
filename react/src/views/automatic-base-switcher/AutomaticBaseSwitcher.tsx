import React, { useContext, useEffect, useState } from "react";
import { GlobalPreferencesContext } from "GlobalPreferencesProvider";
import { useNavigate } from "react-router-dom";

const AutomaticBaseSwitcher = () => {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    const bases = globalPreferences.availableBases;
    if (bases != null) {
      if (bases.length > 0) {
        const newBaseId = bases[0].id;
        navigate(`/bases/${newBaseId}/locations`);
      } else {
        setErrorMessage("This user doesn't have access to any bases");
      }
    }
  }, [navigate, globalPreferences.availableBases]);


  if (errorMessage) {
    return <>{errorMessage}</>;
  }

  return (
    <></>
  );
};

export default AutomaticBaseSwitcher;
