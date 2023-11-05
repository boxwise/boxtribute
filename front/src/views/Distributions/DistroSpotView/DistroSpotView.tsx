import { Center, Heading } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const DistroSpotView = () => {
    const distributionSpotId = useParams<{ distributionSpotId: string }>().distributionSpotId!;

    return (
        <Center>
            <Heading>PLACEHOLDER FOR DETAIL VIEW OF Distribution Spot ID {distributionSpotId} </Heading>
        </Center>
    )

};

export default DistroSpotView
