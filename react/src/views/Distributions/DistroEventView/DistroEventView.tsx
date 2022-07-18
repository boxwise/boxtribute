import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import {
  DistributionEventQuery,
  DistributionEventQueryVariables,
} from "types/generated/graphql";
import DistroEventContainer, {
} from "./components/DistroEventContainer";
import APILoadingIndicator from "components/APILoadingIndicator";
import { DISTRIBUTION_EVENT_QUERY } from "../queries";
import { DistributionEventDetails, DistributionEventDetailsSchema } from "../types";


const graphqlToContainerTransformer = (
  distributionEventData: DistributionEventQuery | undefined
): DistributionEventDetails => {
  // distributionEventDetailsSchema.validateSync(distributionEventData?.distributionEvent);

  if(distributionEventData?.distributionEvent?.distributionSpot == null) {
    throw new Error("distributionEventData.distributionEvent.distributionSpot is null");
  }

  // type FOO = DistributionEventQuery["distributionEvent"];
  // const jo: FOO = distributionEventData?.distributionEvent;
  return DistributionEventDetailsSchema.parse(distributionEventData?.distributionEvent);

  // return {
  //   id: distributionEventData?.distributionEvent?.id,
  //   name: distributionEventData?.distributionEvent?.name || "",
  //   plannedStartDateTime: new Date(distributionEventData?.distributionEvent?.plannedStartDateTime),
  //   state: distributionEventData?.distributionEvent?.state,
  //   distributionSpot: {
  //     name: distributionEventData?.distributionEvent?.name || "",
  //     id: distributionEventData?.distributionEvent?.distributionSpot?.id,
  //   },
  // };
};

const DistroEventView = () => {
  const eventId = useParams<{ eventId: string }>().eventId;

  const { data, error, loading } = useQuery<
    DistributionEventQuery,
    DistributionEventQueryVariables
  >(DISTRIBUTION_EVENT_QUERY, {
    variables: {
      eventId: eventId!,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const transformedData = graphqlToContainerTransformer(data);

    return <DistroEventContainer distributionEventDetails={transformedData} />;
};

export default DistroEventView;
