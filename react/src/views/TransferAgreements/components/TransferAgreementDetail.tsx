import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  TransferAgreementByIdQuery,
  // TransferAgreementByIdQueryVariables,
} from "types/generated/graphql";

interface TransferAgreementDetailProps {
  transferAgreementData: TransferAgreementByIdQuery["transferAgreement"];
}

const TransferAgreementDetail = ({
  transferAgreementData,
}: TransferAgreementDetailProps) => {
  // const transferAgreementId = useParams<{ transferAgreementId: string }>().transferAgreementId!;
  if (transferAgreementData == null) {
    console.error(
      "TransferAgreementDetail Component: transferAgreementData is null"
    );
    return <Box>No data found for a transfer agreement with this id</Box>;
  }

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        // color={useColorModeValue('yellow.500', 'yellow.300')}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Transfer Agreement Details
      </Text>
      <List spacing={2}>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Transfer Agreement ID:
          </Text>{" "}
          {transferAgreementData.id}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Transfer Agreement State:
          </Text>{" "}
          {transferAgreementData.state}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Target Organisation:
          </Text>{" "}
          {transferAgreementData.targetOrganisation?.name}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Type of Transfer:
          </Text>{" "}
          {transferAgreementData.type}
        </ListItem>
      </List>
      <NavLink to="shipments/new">
        <Button m={2}>Create new shipment</Button>
      </NavLink>
    </Box>
  );
};

export default TransferAgreementDetail;
