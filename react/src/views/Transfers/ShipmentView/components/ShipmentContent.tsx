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
} from "@chakra-ui/react";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { Product, Box as BoxType } from "types/generated/graphql";
import { CellProps, Row } from "react-table";
import { AiFillMinusCircle } from "react-icons/ai";
import ShipmentTable from "./ShipmentTable";
import { RemoveBoxCell } from "./ShipmentTableCells";

export interface IShipmentContent {
  product: Product;
  totalItems: number;
  totalBoxes: number;
  boxes: BoxType[];
}

interface IShipmentContentProps {
  items: IShipmentContent[];
  showRemoveIcon: Boolean;
  onBoxRemoved: (id: string) => void;
  onBulkBoxRemoved: (ids: string[]) => void;
}

function ShipmentContent({
  items,
  onBoxRemoved,
  onBulkBoxRemoved,
  showRemoveIcon,
}: IShipmentContentProps) {
  const boxesToTableTransformer = (boxes: BoxType[]) =>
    _.map(boxes, (box) => ({
      id: box?.product?.id,
      labelIdentifier: box.labelIdentifier,
      product: `${box?.size?.label} ${
        (box?.product?.gender && box?.product?.gender) !== "none" ? box?.product?.gender : ""
      } ${box?.product?.name || "Unassigned"}`,
      items: box?.numberOfItems || 0,
    }));

  // callback function triggered when box item removed
  const handleRemoveBox = useCallback(
    async ({ original: cellData }: Row<any>) => {
      try {
        onBoxRemoved(cellData.labelIdentifier);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to remove box ${cellData}`, error);
      }
    },
    [onBoxRemoved],
  );

  const handleRemoveBulkBox = useCallback(
    async (ids: string[]) => {
      try {
        onBulkBoxRemoved(ids);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to remove box ${ids}`, error);
      }
    },
    [onBulkBoxRemoved],
  );

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: "labelIdentifier",
        Header: "BOX #",
        Cell: ({ row }) => row.original.labelIdentifier,
      },
      {
        id: "product",
        Header: "PRODUCT",
        accessor: "product",
        Cell: ({ row }) => row.original.product,
        style: { overflowWrap: "break-word" },
      },
      {
        id: "items",
        Header: "ITEMS",
        accessor: "items",
        Cell: ({ row }) => row.original.items,
      },
      {
        id: "id",
        Header: "",
        show: showRemoveIcon,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row }: CellProps<any>) => <RemoveBoxCell row={row} onClick={handleRemoveBox} />,
      },
    ],
    [showRemoveIcon, handleRemoveBox],
  );

  return (
    <Accordion allowToggle w="full">
      {items.map((item, index) => (
        <AccordionItem key={item?.product?.id || index}>
          {({ isExpanded }) => (
            <>
              <Stack bg={isExpanded ? "#F4E6A0" : ""} p="2" direction="row" alignItems="flex-start">
                {showRemoveIcon && (
                  <Box alignContent="center" padding={1}>
                    <AiFillMinusCircle
                      size={20}
                      style={{
                        cursor: isExpanded ? "not-allowed" : "pointer",
                        color: isExpanded ? "gray" : "red",
                        fill: isExpanded ? "gray" : "red",
                      }}
                      onClick={
                        !isExpanded
                          ? () => handleRemoveBulkBox(item.boxes.map((b) => b.labelIdentifier))
                          : undefined
                      }
                    />
                  </Box>
                )}
                <Box>
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
                <Box>
                  <Text>{item.totalBoxes} boxes</Text>
                </Box>
                <AccordionButton
                  _expanded={{ bg: "#F4E6A0" }}
                  maxWidth={5}
                  _hover={{ bgColor: "white" }}
                >
                  <AccordionIcon
                    mr={2}
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
