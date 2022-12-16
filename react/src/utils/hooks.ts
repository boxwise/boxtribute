import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react";
import { theme } from "./theme";

export const useNotification = () => {
  const toast = createStandaloneToast({ theme });

  const createToast = (props: UseToastOptions) =>
    toast({
      duration: 4000,
      isClosable: true,
      position: "top",
      variant: "subtle",
      ...props,
    });

  return {
    createToast,
  };
};

export const useGetUrlForResourceHelpers = () => {
  const baseId = useParams<{ baseId: string }>().baseId;
  if (baseId == null) {
    throw new Error("Coudl not extract baseId from URL");
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
  const currentBaseId = useParams<{ baseId: string }>().baseId!;
  const navigate = useNavigate();

  return {
    currentBaseId,
    navigate,
  };
};
