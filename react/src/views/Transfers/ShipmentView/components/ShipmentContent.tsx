import {
  Accordion,
  Text,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Spacer,
  ButtonGroup,
  useMediaQuery,
} from "@chakra-ui/react";
import _ from "lodash";
import { useMemo } from "react";
import { Product, Box as BoxType } from "types/generated/graphql";
import { BiMinusCircle } from "react-icons/bi";
import ShipmentTable from "./ShipmentTable";

export interface IShipmentContent {
  product: Product;
  totalItems: number;
  totalBoxes: number;
  boxes: BoxType[];
}

interface IShipmentContentProps {
  items: IShipmentContent[];
  onBoxRemoved: () => void;
}

function ShipmentContent({ items, onBoxRemoved }: IShipmentContentProps) {
  const boxesToTableTransformer = (boxes: BoxType[]) =>
    _.map(boxes, (box) => ({
      labelIdentifier: box.labelIdentifier,
      // eslint-disable-next-line max-len
      product: `${`${box?.product?.sizeRange?.label || ""} ` || ""}${
        `${box?.product?.gender || ""} ` || ""
      }${box?.product?.name}`,
      items: box?.numberOfItems || 0,
      id: box?.product?.id || "",
    }));

  const [isMobile] = useMediaQuery("(max-width: 768px)");

  // Define columns
  const columns = useMemo(
    () => [
      {
        Header: "BOX #",
        // accessor: "labelIdentifier",
        Cell: ({ row }) => row.original.labelIdentifier,
      },
      {
        Header: "PRODUCT",
        // accessor: "product",
        Cell: ({ row }) => row.original.product,
      },
      {
        Header: "ITEMS",
        // accessor: "items",
        Cell: ({ row }) => row.original.items,
        show: !isMobile,
      },
      {
        Header: "ID",
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: () => (
          <BiMinusCircle
            type="solid"
            width={24}
            style={{ cursor: "pointer", color: "red", fill: "red" }}
            onClick={() => {}}
          />
        ),
        // Cell: ({ row }) => row.original.id
      },
    ],
    [isMobile],
  );

  return (
    <Accordion allowToggle w="full">
      {items.map((item) => (
        <AccordionItem key={item.product.id}>
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton _expanded={{ bg: "#F4E6A0" }}>
                  <Box flex="1" textAlign="left">
                    <Flex alignSelf="center">
                      <Box alignContent="center" padding={1}>
                        <BiMinusCircle
                          size={25}
                          style={{ cursor: "pointer", color: "red", fill: "red" }}
                          onClick={() => {}}
                        />
                      </Box>
                      <Box>
                        <Text>
                          {" "}
                          {item.product.name} {item?.product?.gender || ""} ({item.totalItems}x)
                        </Text>
                      </Box>
                      <Spacer />
                      <ButtonGroup gap={1}>
                        <Box>
                          <Text>{item.totalBoxes} boxes</Text>
                        </Box>
                        {!isExpanded && <AccordionIcon />}
                        {/* {isExpanded && <Box w="1em" h="1em" />} */}
                      </ButtonGroup>
                    </Flex>
                  </Box>
                </AccordionButton>
              </h2>
              <AccordionPanel p={0}>
                <ShipmentTable
                  columns={columns}
                  data={boxesToTableTransformer(item.boxes)}
                  onBoxRemoved={onBoxRemoved}
                />
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ShipmentContent;
