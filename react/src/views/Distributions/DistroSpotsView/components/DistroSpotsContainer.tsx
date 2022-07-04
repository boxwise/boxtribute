import { gql, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import {
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import { useGlobalSiteState } from "utils/hooks";
import DistroSpots, { DistroSpot } from "./DistroSpots";

export interface DistroSpotsContainerProps {
  onGoToDistroEventView: (distroEventId: string) => void;
  onGoToCreateNewDistroEventForDistroSpot: (distroSpotId: string) => void;
  onGoToCreateNewDistroSpotView: () => void;
}

const DistroSpotsContainer = ({
  onGoToDistroEventView,
  onGoToCreateNewDistroEventForDistroSpot,
  onGoToCreateNewDistroSpotView,
}: DistroSpotsContainerProps) => {
  const { currentBaseId } = useGlobalSiteState();

  const DISTRO_SPOTS_FOR_BASE_ID = gql`
    query DistroSpotsForBaseId($baseId: ID!) {
      base(id: $baseId) {
        distributionSpots {
          id
          name
          latitude
          longitude
          distributionEvents {
            id
            name
            state
            startDate
            # endDateTime
          }
        }
      }
    }
  `;

  const { loading, error, data } = useQuery<
    DistroSpotsForBaseIdQuery,
    DistroSpotsForBaseIdQueryVariables
  >(DISTRO_SPOTS_FOR_BASE_ID, {
    variables: {
      baseId: currentBaseId,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    return <>Error!</>;
  }

  if (data?.base?.distributionSpots == null) {
    return <>No distro spot data</>;
  }

  const transformedDistroSpotData =
    data.base.distributionSpots.map((distroSpot) => {
      return {
        id: distroSpot.id,
        name: distroSpot.name,
        geoData: {
          latitude: distroSpot.latitude,
          longitude: distroSpot.longitude,
        },
        distroEvents: distroSpot.distributionEvents.map((distroEvent) => ({
          id: distroEvent.id,
          state: distroEvent.state,
          startDateTime: new Date(distroEvent.startDate),
        })),
      };
    }) as DistroSpot[];

  return (
    <DistroSpots
      distroSpots={transformedDistroSpotData}
      onDistroEventClick={onGoToDistroEventView}
      onCreateNewDistroEventForDistroSpotClick={
        onGoToCreateNewDistroEventForDistroSpot
      }
      onCreateNewDistroSpotClick={onGoToCreateNewDistroSpotView}
    />
  );
};

export default DistroSpotsContainer;
