import { gql, useQuery } from "@apollo/client";
import React from "react";
import CreateDistroEvent from "./components/CreateDistroEvent";

const CreateDistributionEventView = () => {
    const DISTRIBUTION_SPOT_QUERY = gql`
        query DistributionSpot($id: Int!) {
            distributionSpot(id: $id) {
                id
                name
            }
        }
    `;

    const {data: distroSpotQueryData, loading: distroSpotQueryLoading, error: distroSpotQueryError} = useQuery(DISTRIBUTION_SPOT_QUERY);
    return <CreateDistroEvent distroSpot={{name: "Test"}} onSubmitNewDistroEvent={() => alert("JO")} />
}

export default CreateDistributionEventView;
