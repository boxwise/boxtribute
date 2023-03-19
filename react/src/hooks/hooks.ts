import { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  useToast,
  UseToastOptions,
  ToastPositionWithLogical,
  useMediaQuery,
} from "@chakra-ui/react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

export interface INotificationProps extends UseToastOptions {
  title?: string;
  message: string;
  type?: "info" | "warning" | "success" | "error" | undefined;
  position?: ToastPositionWithLogical;
}

export const useNotification = () => {
  const toast = useToast();
  const [isSmallScreen] = useMediaQuery("(max-width: 1070px)");
  const [position, setPosition] = useState<ToastPositionWithLogical>("bottom");

  useEffect(() => {
    setPosition(isSmallScreen ? "bottom" : "top");
  }, [isSmallScreen]);

  const createToast = useCallback(
    ({ message, type, ...props }: INotificationProps) =>
      toast({
        duration: 5000,
        isClosable: true,
        position,
        variant: "subtle",
        status: type,
        description: message,
        ...props,
      }),
    [toast, position],
  );

  return { createToast };
};

export const useGetUrlForResourceHelpers = () => {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId;
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
  const currentBaseId = globalPreferences.selectedBaseId!;
  const navigate = useNavigate();

  return {
    currentBaseId,
    navigate,
  };
};
