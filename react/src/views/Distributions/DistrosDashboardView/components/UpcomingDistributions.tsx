import { Link, List, ListItem, Text } from "@chakra-ui/react";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { DistributionEventDetails } from "views/Distributions/types";

// TODO: move this out into own file
// and reuse it in other views as well
const useGetUrlForResourceHelpers = () => {
  const baseId = useParams<{ baseId: string }>().baseId;
  const getDistroSpotDetailUrlById = (distroSpotId: string) =>
    `/bases/${baseId}/distributions/spots/${distroSpotId}`;

  return {
    getDistroSpotDetailUrlById,
  };
};

const UpcomingDistributions = ({
  distributionEventsData,
}: {
  distributionEventsData: DistributionEventDetails[];
}) => {
  const { getDistroSpotDetailUrlById } = useGetUrlForResourceHelpers();

  const sortedDistroEvents = _.chain(distributionEventsData)
  .orderBy(el => el.plannedStartDateTime, "desc")
    // .groupBy(el => el.state)
    .value();

  return (
    <>
      {JSON.stringify(sortedDistroEvents)}
      <List>
        {sortedDistroEvents.map(
          (distributionData: DistributionEventDetails) => (
            <ListItem key={distributionData.id} my={10}>
              <Text>{distributionData.name}</Text>
              <Text>
                <Link
                  href={getDistroSpotDetailUrlById(
                    distributionData.distributionSpot.id
                  )}
                >
                  {distributionData.distributionSpot.name}
                  {/* <ViewIcon /> */}
                </Link>
              </Text>
              <Text>
                {distributionData.plannedStartDateTime.toDateString()}
              </Text>
              <Text>
                {distributionData.plannedStartDateTime.toTimeString()}
              </Text>
            </ListItem>
          )
        )}
      </List>
    </>
  );
};

export default UpcomingDistributions;
