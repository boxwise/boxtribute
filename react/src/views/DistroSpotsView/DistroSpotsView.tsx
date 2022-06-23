import { useCallback } from "react";
import { useGlobalSiteState } from "utils/hooks";
import DistroSpotsContainer from "./components/DistroSpotsContainer";

const DistroSpotsView = () => {

  const {currentBaseId, navigate} = useGlobalSiteState();

  const onGoToDistroEventViewHandler = useCallback(
    (distroEventId: string) =>
      navigate(`/bases/${currentBaseId}/distributions/events/${distroEventId}`),
    [currentBaseId, navigate]
  );

  return (
    <DistroSpotsContainer
      onGoToDistroEventView={onGoToDistroEventViewHandler}
    />
  );
};

export default DistroSpotsView;
