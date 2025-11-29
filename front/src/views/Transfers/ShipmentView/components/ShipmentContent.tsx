import { Accordion, Text, Box, Spacer, Stack, Flex } from "@chakra-ui/react";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { CellProps } from "react-table";
import { AiFillMinusCircle } from "react-icons/ai";
import ShipmentTable from "./ShipmentTable";
import { RemoveBoxCell } from "./ShipmentTableCells";
import { Product } from "../../../../../../graphql/types";
import { Box as BoxType, ShipmentState } from "queries/types";

export interface IShipmentContent {
  product: Product;
  totalItems: number;
  totalLosts: number;
  totalBoxes: number;
  boxes: BoxType[];
}

interface IShipmentContentProps {
  shipmentState: ShipmentState | undefined;
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
        isLost: box.state === "NotDelivered",
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
      isStrikethrough && cell.row.original.shipmentState === "Completed"
        ? { textDecoration: "line-through", textDecorationColor: "red", color: "red" }
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
    <Accordion.Root collapsible w="full">
      {items.map((item, index) => (
        <Accordion.Item
          key={item?.product?.id || index}
          value={item?.product?.id?.toString() || index.toString()}
          alignItems="center"
        >
          <Accordion.ItemContext>
            {({ expanded }) => (
              <>
                <Stack bg={expanded ? "#F4E6A0" : ""} p="1" direction="row" alignItems="center">
                  {showRemoveIcon && (
                    <Box alignContent="center" alignItems="center" padding={1}>
                      <AiFillMinusCircle
                        size={20}
                        style={{
                          cursor: expanded ? "not-allowed" : "pointer",
                          color: expanded ? "gray" : "red",
                          fill: expanded ? "gray" : "red",
                        }}
                        onClick={
                          !open && !isLoadingMutation
                            ? () => onBulkRemoveBox(item.boxes.map((b) => b?.labelIdentifier!))
                            : undefined
                        }
                      />
                    </Box>
                  )}
                  <Box alignItems="center">
                    <h2>
                      <Box>
                        <Text data-testid="shipment-grouped-item-name">
                          {" "}
                          {item?.product?.name}{" "}
                          {item?.product?.gender && item?.product?.gender !== "none"
                            ? item?.product?.gender
                            : ""}{" "}
                          ({item.totalItems}x)
                        </Text>
                      </Box>
                    </h2>
                  </Box>
                  <Spacer />
                  <Flex direction="row" alignItems="center">
                    <Text>{item.totalBoxes}</Text>
                    <Spacer />
                    <Box pl={1}>box{item.totalBoxes > 1 && "es"}</Box>
                    {item.totalLosts > 0 && shipmentState === "Completed" && (
                      <Box pl={1} color="red.500">
                        (-{item.totalLosts})
                      </Box>
                    )}
                  </Flex>
                  <Accordion.ItemTrigger
                    data-testid={`shipment-accordion-button-${item?.product?.id}`}
                    _expanded={{ bg: "#F4E6A0" }}
                    maxWidth={5}
                    _hover={{ bgColor: "white" }}
                  >
                    <Accordion.ItemIndicator
                      mr={1}
                      _focus={{
                        boxShadow: "none",
                      }}
                    />
                  </Accordion.ItemTrigger>
                </Stack>
                <Accordion.ItemContent p={0}>
                  <ShipmentTable columns={columns} data={boxesToTableTransformer(item.boxes)} />
                </Accordion.ItemContent>
              </>
            )}
          </Accordion.ItemContext>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export default ShipmentContent;
