import { gql, useQuery } from "@apollo/client";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import { useGlobalSiteState } from "utils/hooks";
import DistroSpots, { DistroSpot } from "./DistroSpots";

export interface DistroSpotsContainerProps {
  onGoToDistroEventView: (distroEventId: string) => void;
}

const DistroSpotsContainer = ({
  onGoToDistroEventView,
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
              status
              # dateTime
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
        // nextDistroEventDate?: Date;
        // comment?: distroSpot.comment,
        // distroEvents: DistroEvent[];

        id: distroSpot.id,
        name: distroSpot.name,
        geoData: {
          latitude: distroSpot.latitude,
          longitude: distroSpot.longitude,
        },
        distroEvents: []
        // distroSpot.distributionEvents.map((distroEvent) => (
        //   {
        //     id: distroEvent.id,
        //     name: distroEvent.name,
        //     // dateTime: distroEvent.dateTime,
        //     status
        //   }
        // )
      };
    }) as DistroSpot[];

  return (
    <DistroSpots distroSpots={transformedDistroSpotData} onDistroEventClick={onGoToDistroEventView} />
  );
};

export default DistroSpotsContainer;
