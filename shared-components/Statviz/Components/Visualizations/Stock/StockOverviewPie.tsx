import {
  Box,
  Button,
  Card,
  CardBody,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Wrap,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import { filter, groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { useMemo, useState } from "react";
import { ArrowForwardIcon, ArrowLeftIcon } from "@chakra-ui/icons";
import { Maybe, StockOverviewData, StockOverviewResult } from "../../../../types/generated/graphql";
import PieChart from "../../Nivo-graphs/PieChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";

const heading = "Stock Overview";

interface ISizeDim {
  sizeId: number;
  sizeName: Maybe<string> | undefined;
}

interface ICategoryDim {
  categoryId: number;
  categoryName: Maybe<string> | undefined;
}

type PreparedStock = StockOverviewResult & ICategoryDim & ISizeDim;
type PreparedStockAttributes = keyof PreparedStock;

const mappingFunctions = {
  categoryName: map((category: PreparedStock) => ({
    id: category.categoryName,
    value: category.boxesCount,
  })),
  gender: map((gender: PreparedStock) => ({
    id: gender.gender,
    value: gender.boxesCount,
  })),
  sizeName: map((size: PreparedStock) => ({ id: size.sizeName, value: size.boxesCount })),
  productName: map((product: PreparedStock) => ({
    id: product.productName,
    value: product.boxesCount,
  })),
};

const groupOptions = ["categoryName", "productName", "gender", "sizeName"];

interface IStockOverviewPieProps {
  width: string;
  height: string;
  data: StockOverviewData;
}

export default function StockOverviewPie({ width, height, data }: IStockOverviewPieProps) {
  const [chartData, setChartData] = useState<object[]>([]);
  const [drilldownPath, setDrilldownPath] = useState<PreparedStockAttributes[]>(["categoryName"]);
  const [drilldownValues, setDrilldownValues] = useState<string[]>([]);
  const [selectedDrilldownValue, setSelectedDrilldownValue] = useState<string>("");

  const onExport = getOnExport(PieChart);

  const {
    isOpen: showGroupOptions,
    onOpen: openGroupOptions,
    onClose: closeGroupOptions,
  } = useDisclosure();

  const onGroupSelect = (node) => {
    setSelectedDrilldownValue(node.id);
    if (drilldownPath.length <= 3) {
      openGroupOptions();
    }
  };

  const drilldownFilters = drilldownValues.map((drilldownValue, index) =>
    filter((stockData) => stockData[drilldownPath[index]] === drilldownValue),
  );

  const availableGroupOptions = groupOptions.filter(
    (option: PreparedStockAttributes) => drilldownPath.indexOf(option) === -1,
  );

  const setNewDrilldownPath = (base: PreparedStockAttributes, newDrilldownValues: string[]) => {
    setDrilldownPath([base]);
    setDrilldownValues(newDrilldownValues);
  };

  const onNextDrilldownChoice = (event) => {
    setDrilldownPath([...drilldownPath, event.target.value]);
    setDrilldownValues([...drilldownValues, selectedDrilldownValue]);
    closeGroupOptions();
  };

  useMemo(() => {
    const sizeDim = data.dimensions.size.map((size) => ({
      sizeId: parseInt(size.id ?? "0", 10),
      sizeName: size.name,
    }));

    const categoryDim = data.dimensions.category.map((category) => ({
      categoryId: parseInt(category.id ?? "0", 10),
      categoryName: category.name,
    }));

    const preparedStockData = tidy(
      data.facts as StockOverviewResult[],
      innerJoin<StockOverviewResult, ICategoryDim>(categoryDim, { by: "categoryId" }),
      innerJoin<StockOverviewResult & ICategoryDim, ISizeDim>(sizeDim, {
        by: "sizeId",
      }),
      // @ts-ignore
      ...drilldownFilters,
    ) as PreparedStock[];

    const grouped = tidy(
      preparedStockData,
      groupBy(
        drilldownPath,
        summarize({ boxesCount: sum("boxesCount"), itemsCount: sum("itemsCount") }),
      ),
      mappingFunctions[drilldownPath[drilldownPath.length - 1]],
    );

    setChartData(grouped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilldownPath, drilldownValues, data.facts]);

  const chartProps = {
    onClick: onGroupSelect,
    data: chartData,
    width,
    height,
  };
  return (
    <Card>
      <Modal isOpen={showGroupOptions} onClose={closeGroupOptions}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Select next group</ModalHeader>
          <ModalBody>
            {availableGroupOptions.map((groupOption) => (
              <Button
                style={{ margin: "5px" }}
                key={groupOption}
                value={groupOption}
                onClick={onNextDrilldownChoice}
              >
                {groupOption}
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      <VisHeader
        onExport={onExport}
        defaultHeight={800}
        defaultWidth={800}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={1000}
        visId="ts"
      />
      <CardBody>
        <Wrap>
          <WrapItem>
            <FormLabel />
            <Select
              onChange={(event) => {
                setNewDrilldownPath(
                  event.target.selectedOptions.item(0)?.value as PreparedStockAttributes,
                  [],
                );
              }}
              name="stock-overview-by"
              defaultValue={drilldownPath[0]}
            >
              <option value="categoryName">Category</option>
              <option value="gender">Gender</option>
              <option value="sizeName">Size</option>
              <option value="productName">Product</option>
            </Select>
          </WrapItem>
          <WrapItem>
            <Box>
              <Button onClick={() => setNewDrilldownPath(drilldownPath[0], [])}>Reset</Button>
            </Box>
          </WrapItem>
          <WrapItem>
            <Box>
              <Button
                isDisabled={drilldownPath.length < 2}
                onClick={() => {
                  const newDrilldownPath = drilldownPath.slice(0, drilldownPath.length - 1);
                  const newDrilldownValues = drilldownValues.slice(0, drilldownValues.length - 1);

                  setDrilldownPath(newDrilldownPath);
                  setDrilldownValues(newDrilldownValues);
                }}
              >
                <ArrowLeftIcon />
              </Button>
            </Box>
          </WrapItem>
        </Wrap>
        <Box style={{ margin: "20px", fontSize: "20px" }}>
          {drilldownPath.map((value, index) => {
            if (index === drilldownPath.length - 1) {
              return <span key={value}> {value}</span>;
            }
            return (
              <span key={value}>
                {" "}
                {value}: &quot;{drilldownValues[index]}&quot; <ArrowForwardIcon />
              </span>
            );
          })}
        </Box>
        <PieChart {...chartProps} animate />
      </CardBody>
    </Card>
  );
}