import { gql, useQuery } from "@apollo/client";
import {
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import { useGlobalSiteState } from "utils/hooks";
import DistroSpots, { DistroSpot } from "./DistroSpots";

export interface DistroSpotsContainerProps {
  onGoToDistroEventView: (distroEventId: string) => void;
  onGoToCreateNewDistroEventView: () => void,
  onGoToCreateNewDistroSpotView: () => void
}

const DistroSpotsContainer = ({
  onGoToDistroEventView,
  onGoToCreateNewDistroEventView,
  onGoToCreateNewDistroSpotView
}: DistroSpotsContainerProps) => {
  const { currentBaseId } = useGlobalSiteState();

  const DISTRO_SPOTS_FOR_BASE_ID = gql`
    query DistroSpotsForBaseId($baseId: ID!) {
      base(id: $baseId) {
        distributions {
          distributionSpots {
            id
            name
            latitude
            longitude
            distributionEvents {
              id
              name
              state
              dateTime
            }
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
    return <>Loading</>;
  }

  if (error) {
    return <>Error!</>;
  }

  if (data?.base?.distributions?.distributionSpots == null) {
    return <>No distro spot data</>;
  }

  const transformedDistroSpotData =
    data.base.distributions.distributionSpots.map((distroSpot) => {
      return {
        id: distroSpot.id,
        name: distroSpot.name,
        geoData: {
          latitude: distroSpot.latitude,
          longitude: distroSpot.longitude,
        },
        distroEvents: distroSpot.distributionEvents.map((distroEvent) => ({
          id: distroEvent.id,
          eventDate: distroEvent.dateTime,
          state: distroEvent.state,
          date: new Date(distroEvent.dateTime),
        })),
      };
    }) as DistroSpot[];

  return (
    <DistroSpots
      distroSpots={transformedDistroSpotData}
      onDistroEventClick={onGoToDistroEventView}
      onCreateNewDistroEventClick={onGoToCreateNewDistroEventView}
      onCreateNewDistroSpotClick={onGoToCreateNewDistroSpotView}
    />
  );
};

export default DistroSpotsContainer;
