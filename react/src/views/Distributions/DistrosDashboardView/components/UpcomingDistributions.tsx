import { List, ListItem, Text } from "@chakra-ui/react";
import { DistributionEventDetails } from "views/Distributions/types";

const UpcomingDistributions = ({ distributionsData }: { distributionsData: DistributionEventDetails[] }) => {
    return (
        <List>
            {distributionsData.map((distributionData: DistributionEventDetails) => (
                <ListItem key={distributionData.id}>
                    <Text>{distributionData.name}</Text>
                    <Text>{distributionData.plannedStartDateTime.toDateString()}</Text>
                </ListItem>
            ))}
        </List>
    );
}

export default UpcomingDistributions;
