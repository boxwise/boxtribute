import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";


export const useGetUrlForResourceHelpers = () => {
  const baseId = useParams<{ baseId: string }>().baseId;
  const getDistroSpotDetailUrlById = (distroSpotId: string) =>
    `/bases/${baseId}/distributions/spots/${distroSpotId}`;

  const getDistroEventDetailUrlById = (distroEventId: string) =>
    `/bases/${baseId}/distributions/events/${distroEventId}`;

  return {
    getDistroSpotDetailUrlById,
    getDistroEventDetailUrlById,
  };
};


export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle] as [boolean, () => void];
}

export const useGlobalSiteState = () => {

  const currentBaseId = useParams<{ baseId: string }>().baseId!;
  const navigate = useNavigate();


  return {
    currentBaseId,
    navigate
  }
}
