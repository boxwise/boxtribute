import { Center, Heading } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const DistroSpotView = () => {
    const distributionSpotId = useParams<{ distributionSpotId: string }>().distributionSpotId!;

    return (
        <Center>
            <Heading>Distribution Spot XXXX ID {distributionSpotId} </Heading>
        </Center>
    )

};

export default DistroSpotView
