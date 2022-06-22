import { gql, useQuery } from "@apollo/client";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalSiteState } from "utils/hooks";
import DistroSpots from "./DistroSpots";

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
          }
        }
      }
    }
  `;

  const { loading, error, data } = useQuery(DISTRO_SPOTS_FOR_BASE_ID, {
    variables: {
      baseId: currentBaseId,
    },
  });

  return (
    <DistroSpots
      distroSpots={data}
      onDistroEventClick={onGoToDistroEventView}
    />
  );
};

export default DistroSpotsContainer;
