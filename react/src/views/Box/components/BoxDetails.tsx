import { AddIcon, EditIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  List,
  ListItem,
  Heading,
  Button,
  Text,
  Flex,
  IconButton,
  WrapItem,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";

interface BoxDetailsProps {
  boxData:
    | BoxByLabelIdentifierQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onScrap: () => void;
  onLost: () => void;
}

const BoxDetails = ({
  boxData,
  onMoveToLocationClick: moveToLocationClick,
  onPlusOpen,
  onMinusOpen,
  onScrap,
  onLost,
}: BoxDetailsProps) => {
  const statusColor = (value) => {
    let color;
    if (value === "Lost" || value === "Scrap") {
      color = "#EB404A";
    } else {
      color = "#0CA789";
    }
    return color;
  };

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Flex
      direction={["column", "column", "row"]}
      alignItems={["center", "center", "flex-start"]}
      w="100%"
      justifyContent="center"
    >
      <Box
        w={["100%", "80%", "40%", "30%"]}
        border="2px"
        mb={6}
        pb={2}
        backgroundColor="#F4E5A0"
        mr={["0", "0", "6rem", "6rem"]}
      >
        <Flex pt={2} px={4} direction="row" justifyContent="space-between">
          <Flex direction="column" mb={2}>
            <Heading fontWeight={"bold"} as="h2">
              Box {boxData.labelIdentifier}
            </Heading>
            <Flex>
              <Text>
                <b>State:&nbsp;</b>
              </Text>
              <Text color={statusColor(boxData.state)}><b>{boxData.state}</b></Text>
            </Flex>
          </Flex>

          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              icon={<EditIcon h={6} w={6} />}
              border="2px"
            />
          </NavLink>
        </Flex>
        <List px={4} pb={2} spacing={2}>
          <ListItem>
            <Text fontSize="xl" fontWeight={"bold"} >
              {boxData.product?.name}
            </Text>
          </ListItem>
          <ListItem >
            <Flex alignItems="center">
              <Box border="2px" borderRadius="0" px={2}>
                <Text fontSize="xl" fontWeight={"bold"}>
                 # {boxData.items}
                </Text>
              </Box>
              <Box border="2px" backgroundColor="#1A202C" borderRadius="0" px={2}>
                <Text color='#F3E4A0' fontSize="xl" fontWeight={"bold"}>
                  {boxData.size.label}
                </Text>
              </Box>
            </Flex>
          </ListItem>
          <ListItem>
            <Flex direction="row" pb={4}>
              <Text fontSize="xl" fontWeight={"bold"}>
                <b>{boxData.product?.gender}</b>
              </Text>
            </Flex>
          </ListItem>
          <ListItem>
            {/* <Flex direction="row">
              {boxData.tags.map((tag, i) => (
                <Text mr={2}>#{tag.name}</Text>
              ))}
            </Flex> */}
          </ListItem>
          <ListItem>
            <Flex justifyContent="space-between">
              <Flex>
                <Button
                  onClick={onScrap}
                  mr={4}
                  border="2px"
                  borderRadius="0"
                >
                  Scrap
                </Button>
                <Button
                  onClick={onLost}
                  mr={4}
                  border="2px"
                  borderRadius="0"
                >
                  Lost
                </Button>
              </Flex>
              <Flex direction="row" justifyContent="flex-end">
                <IconButton
                  onClick={onPlusOpen}
                  mr={4}
                  border="2px"
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<AddIcon />}
                />
                <IconButton
                  onClick={onMinusOpen}
                  border="2px"
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<MinusIcon />}
                />
              </Flex>
            </Flex>
          </ListItem>
        </List>
      </Box>
      <Box
        alignContent="center"
        w={["100%", "80%", "40%", "50%"]}
        border="2px"
        py={4}
        px={4}
      >
        <Text textAlign="center" fontSize="xl" mb={4}>
          Move this box from <strong>{boxData.place?.name}</strong> to:
        </Text>
        <List>
          <Flex wrap="wrap" justifyContent="center">
            {boxData.place?.base?.locations
              ?.filter((location) => {
                return location.id !== boxData.place?.id;
              })
              .map((location, i) => (
                <WrapItem key={location.id} m={1}>
                  <Button
                    borderRadius="0px"
                    onClick={() => moveToLocationClick(location.id)}
                    disabled={boxData.place?.id === location.id}
                    border="2px"
                  >
                    {location.name}
                  </Button>
                </WrapItem>
              ))}
          </Flex>
        </List>
      </Box>
    </Flex>
  );
};

export default BoxDetails;
