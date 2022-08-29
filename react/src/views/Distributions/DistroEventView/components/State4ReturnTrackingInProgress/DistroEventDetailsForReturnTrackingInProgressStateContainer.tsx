import { useQuery } from "@apollo/client";
import { Flex, Heading, Link, Text } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { Link as RouterLink } from "react-router-dom";
import {
  ReturnTrackingGroupIdForDistributionEventQuery,
  ReturnTrackingGroupIdForDistributionEventQueryVariables
} from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import { RETURN_TRACKING_GROUP_ID_FOR_DISTRIBUTION_EVENT_QUERY } from "views/Distributions/queries";
import {
  DistributionEventDetails
} from "views/Distributions/types";

interface DistroEventDetailsForPackingStateProps {
  distributionEventDetails: DistributionEventDetails;
}

const DistroEventDetailsForReturnTrackingInProgressStateContainer = ({
  distributionEventDetails,
}: DistroEventDetailsForPackingStateProps) => {

  const { getBaseRootUrlForCurrentBase } = useGetUrlForResourceHelpers();

  const { data, loading, error } = useQuery<
  ReturnTrackingGroupIdForDistributionEventQuery,
  ReturnTrackingGroupIdForDistributionEventQueryVariables
  >(RETURN_TRACKING_GROUP_ID_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
    pollInterval: 5000,
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error || (!loading && data == null)) {
    return <div>Error</div>;
  }

  return (
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
        <Text textAlign={"center"}>
          <Heading as="h3" size="md">
            Return Tracking In Progress
          </Heading>
          Go to the{" "}
          <Link
            variant={"inline-link"}
            as={RouterLink}
            to={`${getBaseRootUrlForCurrentBase()}/distributions/return-trackings/${
              data?.distributionEvent?.distributionEventsTrackingGroup?.id
            }`}
          >
            Return Tracking
          </Link>{" "}
          in which this Distro Event is part of.
        </Text>
      </Flex>
  );
};

export default DistroEventDetailsForReturnTrackingInProgressStateContainer;
