import {
  Box,
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Wrap,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import { filter, groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { useEffect, useMemo, useState } from "react";
import { ArrowForwardIcon, ArrowLeftIcon } from "@chakra-ui/icons";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../utils/dashboardFilters";
import PieChart from "../../nivo/PieChart";
import VisHeader from "../../VisHeader";
import NoDataCard from "../../NoDataCard";
import getOnExport from "../../../utils/chartExport";
import ValueFilter, { IFilterValue } from "../../filter/ValueFilter";
import useValueFilter from "../../../hooks/useValueFilter";

interface ISizeDim {
  sizeId: number;
  sizeName: string | undefined;
}

interface ICategoryDim {
  categoryId: number;
  categoryName: string | undefined;
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

// srg = stock ring grouping
const ringGroupingUrlId = "srg";

const ringGroupingOptions: IFilterValue[] = [
  { value: "categoryName", label: "Category", urlId: "cn" },
  { value: "productName", label: "Product", urlId: "pn" },
  { value: "gender", label: "Gender", urlId: "g" },
  { value: "sizeName", label: "Size", urlId: "s" },
];

const defaultRingGrouping = ringGroupingOptions[0];

const ringGroupingValues = ringGroupingOptions.map((option) => option.value);

interface StockOverviewRingProps {
  data: StockOverview;
  boxesOrItems: BoxesOrItemsCount;
  width: string;
  height: string;
}

export default function StockOverviewRing({
  data,
  boxesOrItems,
  width,
  height,
}: StockOverviewRingProps) {
  const [drilldownPath, setDrilldownPath] = useState<PreparedStockAttributes[]>([
    defaultRingGrouping.value as PreparedStockAttributes,
  ]);
  const [drilldownValues, setDrilldownValues] = useState<string[]>([]);
  const [selectedDrilldownValue, setSelectedDrilldownValue] = useState<string>("");

  const heading = boxesOrItems === "boxesCount" ? "Instock Boxes" : "Instock Items";

  const { onFilterChange, filterValue } = useValueFilter(
    ringGroupingOptions,
    defaultRingGrouping,
    ringGroupingUrlId,
  );

  const onExport = getOnExport(PieChart);

  const {
    isOpen: showGroupOptions,
    onOpen: openGroupOptions,
    onClose: closeGroupOptions,
  } = useDisclosure();

  const onGroupSelect = (node) => {
    setSelectedDrilldownValue(node.id);
    if (drilldownPath.length < ringGroupingValues.length) {
      openGroupOptions();
    }
  };

  const drilldownFilters = drilldownValues.map((drilldownValue, index) =>
    filter((stockData) => stockData[drilldownPath[index]] === drilldownValue),
  );

  const availableGroupOptions = ringGroupingValues.filter(
    (option: PreparedStockAttributes) => drilldownPath.indexOf(option) === -1,
  );

  const setNewDrilldownPath = (base: PreparedStockAttributes, newDrilldownValues: string[]) => {
    setDrilldownPath([base]);
    setDrilldownValues(newDrilldownValues);
  };

  useEffect(() => {
    setNewDrilldownPath(filterValue.value as PreparedStockAttributes, []);
  }, [filterValue]);

  const onNextDrilldownChoice = (event) => {
    setDrilldownPath([...drilldownPath, event.target.value]);
    setDrilldownValues([...drilldownValues, selectedDrilldownValue]);
    closeGroupOptions();
  };

  const chartData = useMemo(() => {
    const sizeDim = data?.dimensions.size.map((size) => ({
      sizeId: size.id!,
      sizeName: size.name!,
    }));

    const categoryDim = data?.dimensions.category.map((category) => ({
      categoryId: category.id!,
      categoryName: category.name!,
    }));

    const preparedStockData = tidy(
      data?.facts as Partial<StockOverviewResult>,
      innerJoin<StockOverviewResult, ICategoryDim>(categoryDim!, { by: "categoryId" }),
      innerJoin<StockOverviewResult & ICategoryDim, ISizeDim>(sizeDim!, {
        by: "sizeId",
      }),
      // @ts-expect-error spread of tidy filter functions not typed
      ...drilldownFilters,
    ) as PreparedStock[];

    return tidy(
      preparedStockData,
      groupBy(drilldownPath, summarize({ boxesCount: sum(boxesOrItems) })),
      mappingFunctions[drilldownPath[drilldownPath.length - 1]],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilldownPath, drilldownValues, data?.facts, boxesOrItems]);

  const total = useMemo(
    () => chartData.reduce((acc, d: { value: number }) => acc + (d.value ?? 0), 0),
    [chartData],
  );

  const getGroupOption = (levelsBack: number = 0) =>
    ringGroupingOptions.find(
      (groupOption) => groupOption.value === drilldownPath[drilldownPath.length - levelsBack - 1],
    );

  const getSummarization = () => {
    const level = drilldownPath.length;
    const currentValueText =
      drilldownValues.length > 0 ? `${drilldownValues[drilldownValues.length - 1]}` : "";

    if (level === 1) {
      return `All Items by ${getGroupOption()?.label}`;
    }

    const previousGroupOption = getGroupOption(1);
    if (level === 2 && previousGroupOption?.value === "gender") {
      return `${getGroupOption()?.label} for ${currentValueText}`;
    }
    if (previousGroupOption?.value === "gender") {
      return `${drilldownValues[drilldownValues.length - 2] ?? ""} ${currentValueText} by ${getGroupOption()?.label}`;
    }
    if (previousGroupOption?.value === "sizeName") {
      return `Size ${currentValueText} by ${getGroupOption()?.label}`;
    }
    return `${currentValueText} by ${getGroupOption()?.label}`;
  };

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const centerData = {
    level: total,
    grouping: getSummarization(),
  };

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
          <ModalHeader>Select the next grouping</ModalHeader>
          <ModalBody>
            {availableGroupOptions.map((groupOption) => (
              <Button
                borderRadius="0px"
                border="2px"
                style={{ margin: "5px" }}
                key={groupOption}
                value={groupOption}
                onClick={onNextDrilldownChoice}
              >
                {ringGroupingOptions.find((ago) => ago.value === groupOption)!.label}
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      <VisHeader
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        heading={heading}
        chartProps={chartProps}
        customIncludes={[{ prop: { centerData }, value: "include center data" }]}
        view="StockOverview"
      />
      <CardBody>
        <Wrap mb={4} align="end">
          <WrapItem>
            <ValueFilter
              values={ringGroupingOptions}
              defaultFilterValue={defaultRingGrouping}
              onFilterChange={onFilterChange}
              filterId={ringGroupingUrlId}
              fieldLabel="Display by"
              inlineLabel={true}
            />
          </WrapItem>
          <WrapItem>
            <Box>
              <Button
                borderRadius="0px"
                border="2px"
                onClick={() => setNewDrilldownPath(drilldownPath[0], [])}
              >
                Reset
              </Button>
            </Box>
          </WrapItem>
          <WrapItem>
            <Box>
              <Button
                isDisabled={drilldownPath.length < 2}
                borderRadius="0px"
                border="2px"
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
              return (
                <span key={value}>
                  {" "}
                  {ringGroupingOptions.find((option) => value === option.value)?.label}
                </span>
              );
            }
            return (
              <span key={value}>
                {" "}
                {ringGroupingOptions.find((option) => value === option.value)?.label}: &quot;
                {drilldownValues[index]}&quot; <ArrowForwardIcon />
              </span>
            );
          })}
        </Box>
        <PieChart {...chartProps} centerData={centerData} animate />
      </CardBody>
    </Card>
  );
}
