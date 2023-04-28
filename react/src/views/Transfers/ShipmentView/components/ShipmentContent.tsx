import {
  Accordion,
  Text,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Spacer,
  Stack,
  Flex,
} from "@chakra-ui/react";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { Product, Box as BoxType, BoxState, ShipmentState } from "types/generated/graphql";
import { CellProps } from "react-table";
import { AiFillMinusCircle } from "react-icons/ai";
// import { BiPackage } from "react-icons/bi";
import ShipmentTable from "./ShipmentTable";
import { RemoveBoxCell } from "./ShipmentTableCells";

export interface IShipmentContent {
  product: Product;
  totalItems: number;
  totalLosts: number;
  totalBoxes: number;
  boxes: BoxType[];
}

interface IShipmentContentProps {
  shipmentState: ShipmentState | undefined | null;
  items: IShipmentContent[];
  showRemoveIcon: Boolean;
  isLoadingMutation: boolean | undefined;
  onRemoveBox: (id: string) => void;
  onBulkRemoveBox: (ids: string[]) => void;
}

function ShipmentContent({
  shipmentState,
  items,
  onRemoveBox,
  onBulkRemoveBox,
  isLoadingMutation,
  showRemoveIcon,
}: IShipmentContentProps) {
  const boxesToTableTransformer = useCallback(
    (boxes: BoxType[]) =>
      _.map(boxes, (box) => ({
        id: box?.product?.id,
        labelIdentifier: box.labelIdentifier,
        shipmentState,
        isLost: box.state === BoxState.Lost,
        product: `${box?.size?.label} ${
          (box?.product?.gender && box?.product?.gender) !== "none" ? box?.product?.gender : ""
        } ${box?.product?.name || "Unassigned"}`,
        items: box?.numberOfItems || 0,
      })),
    [shipmentState],
  );

  const renderCell = (cell) => {
    const value = cell?.value;
    const isStrikethrough = cell.row.original.isLost;
    const style =
      isStrikethrough && cell.row.original.shipmentState === ShipmentState.Completed
        ? { textDecoration: "line-through" }
        : {};
    return <div style={style}>{value}</div>;
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: "labelIdentifier",
        Header: "BOX #",
        accessor: "labelIdentifier",
        Cell: renderCell,
      },
      {
        id: "product",
        Header: "PRODUCT",
        accessor: "product",
        style: { overflowWrap: "break-word" },
        Cell: renderCell,
      },
      {
        id: "items",
        Header: "ITEMS",
        accessor: "items",
        Cell: renderCell,
      },
      {
        id: "id",
        Header: "",
        show: showRemoveIcon,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row }: CellProps<any>) => (
          <RemoveBoxCell
            row={row}
            onRemoveIconClick={onRemoveBox}
            isLoadingMutation={isLoadingMutation}
          />
        ),
      },
    ],
    [showRemoveIcon, onRemoveBox, isLoadingMutation],
  );

  return (
    <Accordion allowToggle w="full">
      {items.map((item, index) => (
        <AccordionItem key={item?.product?.id || index} alignItems="center">
          {({ isExpanded }) => (
            <>
              <Stack bg={isExpanded ? "#F4E6A0" : ""} p="1" direction="row" alignItems="center">
                {showRemoveIcon && (
                  <Box alignContent="center" alignItems="center" padding={1}>
                    <AiFillMinusCircle
                      size={20}
                      style={{
                        cursor: isExpanded ? "not-allowed" : "pointer",
                        color: isExpanded ? "gray" : "red",
                        fill: isExpanded ? "gray" : "red",
                      }}
                      onClick={
                        !isExpanded && !isLoadingMutation
                          ? () => onBulkRemoveBox(item.boxes.map((b) => b.labelIdentifier))
                          : undefined
                      }
                    />
                  </Box>
                )}
                <Box alignItems="center">
                  <h2>
                    <Box>
                      <Text>
                        {" "}
                        {item?.product?.name || "Unassigned"}{" "}
                        {(item?.product?.gender && item?.product?.gender) !== "none"
                          ? item?.product?.gender
                          : ""}{" "}
                        ({item.totalItems}x)
                      </Text>
                    </Box>
                  </h2>
                </Box>
                <Spacer />
                <Flex direction="row" alignItems="center">
                  <Text>
                    {item.totalBoxes -
                      (shipmentState === ShipmentState.Completed ? item.totalLosts : 0)}
                  </Text>
                  <Spacer />
                  <Box pl={1}>
                    {/* <BiPackage size={18} /> */}
                    box{item.totalBoxes > 1 && "es"}
                  </Box>
                  {item.totalLosts > 0 && shipmentState === ShipmentState.Completed && (
                    <Box pl={1} color="gray.500">
                      (-{item.totalLosts})
                    </Box>
                  )}
                </Flex>
                <AccordionButton
                  _expanded={{ bg: "#F4E6A0" }}
                  maxWidth={5}
                  _hover={{ bgColor: "white" }}
                >
                  <AccordionIcon
                    mr={1}
                    _focus={{
                      boxShadow: "none",
                    }}
                  />
                </AccordionButton>
              </Stack>
              <AccordionPanel p={0}>
                <ShipmentTable columns={columns} data={boxesToTableTransformer(item.boxes)} />
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ShipmentContent;
