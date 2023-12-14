import { useState, useCallback, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { UseToastOptions, ToastPositionWithLogical } from "@chakra-ui/react";
import { tableConfigsVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { Filters } from "react-table";

export interface INotificationProps extends UseToastOptions {
  title?: string;
  message: string;
  type?: "info" | "warning" | "success" | "error" | undefined;
  position?: ToastPositionWithLogical;
}

// logout handler that redirect the v2 to dropapp related trello: https://trello.com/c/sbIJYHFF
export const useHandleLogout = () => {
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    // only redirect in staging and production environments
    if (process.env.REACT_APP_ENVIRONMENT !== "development") {
      // eslint-disable-next-line max-len
      window.location.href = `${process.env.REACT_APP_OLD_APP_BASE_URL}/index.php?action=logoutfromv2`;
    } else {
      logout();
    }
    return null;
  };
  return { user, handleLogout };
};

export const useGetUrlForResourceHelpers = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id;
  if (baseId == null) {
    throw new Error("Could not extract baseId from URL");
  }

  const getBaseRootUrlForCurrentBase = () => `/bases/${baseId}`;

  const getDistroSpotDetailUrlById = (distroSpotId: string) =>
    `/bases/${baseId}/distributions/spots/${distroSpotId}`;

  const getDistroEventDetailUrlById = (distroEventId: string) =>
    `/bases/${baseId}/distributions/events/${distroEventId}`;

  const getBoxDetailViewUrlByLabelIdentifier = (labelIdentifier: string) =>
    `/bases/${baseId}/boxes/${labelIdentifier}`;

  return {
    getBaseId: () => baseId,
    getDistroSpotDetailUrlById,
    getDistroEventDetailUrlById,
    getBaseRootUrlForCurrentBase,
    getBoxDetailViewUrlByLabelIdentifier,
  };
};

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle] as [boolean, () => void];
};

export const useGlobalSiteState = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const currentBaseId = globalPreferences.selectedBase?.id!;
  const navigate = useNavigate();

  return {
    currentBaseId,
    navigate,
  };
};

export interface ITableConfig {
  globalFilter?: string;
  columnFilters: Filters<any>;
  // TODO: add here more props or even refactor the data structure, to support e.g. sorting config, filter configs and and selected columns
}

interface IUseTableConfigProps {
  tableConfigKey: string;
  defaultTableConfig: ITableConfig;
}

export interface IUseTableConfigReturnType {
  getGlobalFilter: () => string | undefined;
  getColumnFilters: () => Filters<any>;
  setGlobalFilter: (globalFilter: string | undefined) => void;
  setColumnFilters: (columnFilters: Filters<any>) => void;
}

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const tableConfigsState = useReactiveVar(tableConfigsVar);
  const [searchParams, setSearchParams] = useSearchParams();

  // Intialization
  useEffect(() => {
    if (!tableConfigsState.has(tableConfigKey)) {
      const tableConfig: ITableConfig = {
        globalFilter: searchParams.get("globalFilter") || defaultTableConfig.globalFilter,
        columnFilters: searchParams.get("columnFilters")
          ? JSON.parse(searchParams.get("columnFilters") || "")
          : defaultTableConfig.columnFilters,
      };
      tableConfigsState.set(tableConfigKey, tableConfig);
      tableConfigsVar(tableConfigsState);
      setSearchParams(JSON.stringify(tableConfig));
    }
  }, [defaultTableConfig, searchParams, setSearchParams, tableConfigKey, tableConfigsState]);

  function getGlobalFilter() {
    return tableConfigsState.get(tableConfigKey)?.globalFilter || defaultTableConfig.globalFilter;
  }

  function getColumnFilters() {
    return tableConfigsState.get(tableConfigKey)?.columnFilters || defaultTableConfig.columnFilters;
  }

  function setGlobalFilter(globalFilter: string | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.globalFilter = globalFilter;
    tableConfigsState.set(tableConfigKey, tableConfig!);
    tableConfigsVar(tableConfigsState);
    setSearchParams(JSON.stringify(tableConfig!));
  }

  function setColumnFilters(columnFilters: Filters<any>) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.columnFilters = columnFilters;
    tableConfigsState.set(tableConfigKey, tableConfig!);
    tableConfigsVar(tableConfigsState);
    setSearchParams(JSON.stringify(tableConfig!));
  }

  return {
    getGlobalFilter,
    getColumnFilters,
    setGlobalFilter,
    setColumnFilters,
  };
};
