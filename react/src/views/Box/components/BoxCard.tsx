import { EditIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  ButtonGroup,
  Divider,
  Flex,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spacer,
  Stack,
  Switch,
  Tag,
  TagLabel,
  Tooltip,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxState,
  HistoryEntry,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { colorIsBright } from "utils/helpers";
import { Style } from "victory";
import HistoryEntries from "./HistoryEntries";

export interface IBoxCardProps {
  boxData: BoxByLabelIdentifierQuery["box"] | UpdateLocationOfBoxMutation["updateBox"];
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onStateChange: (boxState: BoxState) => void;
  isLoading: boolean;
}

function BoxCard({ boxData, onPlusOpen, onMinusOpen, onStateChange, isLoading }: IBoxCardProps) {
  const statusColor = (value) => {
    let color;
    if (value === "Lost" || value === "Scrap") {
      color = "#EB404A";
    } else {
      color = "#0CA789";
    }
    return color;
  };

  return (
    <Box
      w={["100%", "80%", "30%", "30%"]}
      border="2px"
      mb={6}
      pb={2}
      backgroundColor="brandYellow.100"
      mr={["0", "0", "4rem", "4rem"]}
    >
      <Wrap py={2} px={4} alignItems="center">
        <WrapItem>
          <Heading fontWeight="bold" as="h2" data-testid="box-header">
            Box {boxData?.labelIdentifier}
          </Heading>
        </WrapItem>
        <Spacer />
        <WrapItem>
          {(BoxState.Lost === boxData?.state || BoxState.Scrap === boxData?.state) && (
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              icon={<EditIcon h={6} w={6} />}
              border="2px"
              disabled
            />
          )}
          {BoxState.Lost !== boxData?.state && BoxState.Scrap !== boxData?.state && (
            <NavLink to="edit">
              <IconButton
                aria-label="Edit box"
                borderRadius="0"
                icon={<EditIcon h={6} w={6} />}
                border="2px"
                isLoading={isLoading}
              />
            </NavLink>
          )}
        </WrapItem>
      </Wrap>
      {boxData?.tags !== undefined && (
        <Flex pb={2} px={4} direction="row">
          <HStack spacing={1} data-testid="box-tags">
            {boxData.tags?.map((tag) => (
              <Tag
                key={tag.id}
                bg={Style.toTransformString(tag.color)}
                color={colorIsBright(tag.color) ? "black" : "white"}
              >
                <TagLabel>{tag.name}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </Flex>
      )}

      <Flex data-testid="box-subheader" py={2} px={4} direction="row">
        <Text fontWeight="bold">Status:&nbsp;</Text>
        <Text fontWeight="bold" data-testid="box-state" color={statusColor(boxData?.state)}>
          {boxData?.state}
        </Text>
      </Flex>

      <Divider />
      <Stack py={2} px={4}>
        <Flex>
          <Heading as="h3" fontSize="xl" data-testid="boxview-number-items">
            {boxData?.numberOfItems}x {boxData?.product?.name}
          </Heading>
          <Spacer />
          <ButtonGroup gap="1">
            <Box alignContent="flex-end" marginLeft={2}>
              <Tooltip hasArrow shouldWrapChildren mt="3" label="add items" aria-label="A tooltip">
                <IconButton
                  onClick={onPlusOpen}
                  disabled={BoxState.Lost === boxData?.state || BoxState.Scrap === boxData?.state}
                  size="sm"
                  border="2px"
                  isRound
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<AddIcon />}
                  data-testid="increase-items"
                  isLoading={isLoading}
                />
              </Tooltip>
            </Box>
            <Box alignContent="flex-end" marginRight={1}>
              <Tooltip
                hasArrow
                label="remove items"
                shouldWrapChildren
                mt="3"
                aria-label="A tooltip"
              >
                <IconButton
                  onClick={onMinusOpen}
                  border="2px"
                  size="sm"
                  disabled={BoxState.Lost === boxData?.state || BoxState.Scrap === boxData?.state}
                  borderRadius="0"
                  isRound
                  aria-label="Search database"
                  icon={<MinusIcon />}
                  data-testid="decrease-items"
                  isLoading={isLoading}
                />
              </Tooltip>
            </Box>
          </ButtonGroup>
        </Flex>
      </Stack>

      <Spacer />
      <Flex py={2} px={4} direction="row">
        <List spacing={1}>
          <ListItem>
            <Flex alignContent="center">
              <Text fontWeight="bold">Size: {boxData?.size.label}</Text>
            </Flex>
          </ListItem>
          {boxData?.product?.gender !== "none" && (
            <ListItem>
              <Flex direction="row">
                <Text fontWeight="bold">
                  Gender: <b>{boxData?.product?.gender}</b>
                </Text>
              </Flex>
            </ListItem>
          )}
          {boxData?.comment !== "" && boxData?.comment !== null && (
            <ListItem>
              <Flex direction="row">
                <Text>
                  <b>Comment: </b>
                  {boxData?.comment}
                </Text>
              </Flex>
            </ListItem>
          )}
        </List>
      </Flex>

      <Divider />
      <Stack py={2} px={4} alignContent="center">
        <Flex alignContent="center" direction="row">
          <Text fontSize="xl" fontWeight="bold">
            Mark as: &nbsp;
          </Text>
        </Flex>
        <Flex py={2} px={2} minWidth="max-content" alignItems="center">
          <Flex alignContent="center" direction="row">
            <FormLabel htmlFor="scrap">Scrap:</FormLabel>
            <Switch
              id="scrap"
              isChecked={boxData?.state === BoxState.Scrap}
              data-testid="box-scrap-btn"
              isFocusable={false}
              onChange={() =>
                onStateChange(
                  // If the current box state 'Scrap' is toggled, set the defaultBoxState of the box location
                  boxData?.state === BoxState.Scrap
                    ? (boxData?.location as any)?.defaultBoxState
                    : BoxState.Scrap,
                )
              }
              mr={2}
            />
          </Flex>
          <Spacer />
          <Flex alignContent="center" direction="row">
            <FormLabel htmlFor="lost">Lost:</FormLabel>
            <Switch
              id="lost"
              isFocusable={false}
              data-testid="box-lost-btn"
              onChange={() =>
                onStateChange(
                  // If the current box state 'Lost' is toggled, set the defaultBoxState of the box location
                  boxData?.state === BoxState.Lost
                    ? (boxData?.location as any)?.defaultBoxState
                    : BoxState.Lost,
                )
              }
              mr={2}
              isChecked={boxData?.state === BoxState.Lost}
            />
          </Flex>
        </Flex>
      </Stack>

      {boxData?.history && boxData?.history?.length > 0 && (
        <>
          <Divider />
          <Stack py={2} px={4} alignContent="center">
            <Flex alignContent="center" direction="column">
              <Text fontSize="lg" fontWeight="bold">
                History: &nbsp;
              </Text>
              <Spacer />
              <HistoryEntries data={boxData?.history as unknown as HistoryEntry[]} total={1} />
            </Flex>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default BoxCard;
