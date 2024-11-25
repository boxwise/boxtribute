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
  Wrap,
  WrapItem,
  useDisclosure,
} from "@chakra-ui/react";
import { filter, groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { useEffect, useMemo, useState } from "react";
import { ArrowForwardIcon, ArrowLeftIcon } from "@chakra-ui/icons";
import PieChart from "../../nivo/PieChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import useValueFilter from "../../../hooks/useValueFilter";
import ValueFilter from "../../filter/ValueFilter";

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

const groupOptions = [
  {
    value: "categoryName",
    label: "Category",
    urlId: "cn",
  },
  {
    value: "productName",
    label: "Product",
    urlId: "pn",
  },
  {
    value: "gender",
    label: "Gender",
    urlId: "g",
  },
  {
    value: "sizeName",
    label: "Size",
    urlId: "s",
  },
];

// stg = stock group
const filterId = "stg";

const groupOptionValues = groupOptions.map((e) => e.value);

interface IStockOverviewPieProps {
  width: string;
  height: string;
  data: StockOverviewData;
  boxesOrItems: BoxesOrItemsCount;
}

export default function StockOverviewPie({
  width,
  height,
  data,
  boxesOrItems,
}: IStockOverviewPieProps) {
  const [chartData, setChartData] = useState<object[]>([]);
  const [drilldownPath, setDrilldownPath] = useState<PreparedStockAttributes[]>(["categoryName"]);
  const [drilldownValues, setDrilldownValues] = useState<string[]>([]);
  const [selectedDrilldownValue, setSelectedDrilldownValue] = useState<string>("");

  const heading =
    boxesOrItems === "boxesCount"
      ? "Drilldown Chart of Instock Boxes"
      : "Drilldown Chart of Instock Items";

  const { onFilterChange, filterValue } = useValueFilter(groupOptions, groupOptions[0], filterId);

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

  const availableGroupOptions = groupOptionValues.filter(
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

  useMemo(() => {
    const sizeDim = data.dimensions.size.map((size) => ({
      sizeId: size.id!,
      sizeName: size.name!,
    }));

    const categoryDim = data.dimensions.category.map((category) => ({
      categoryId: category.id!,
      categoryName: category.name!,
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
      groupBy(drilldownPath, summarize({ boxesCount: sum(boxesOrItems) })),
      mappingFunctions[drilldownPath[drilldownPath.length - 1]],
    );

    setChartData(grouped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilldownPath, drilldownValues, data.facts, boxesOrItems]);

  const getGroupOption = (levelsBack: number = 0) =>
    groupOptions.find(
      (groupOption) => groupOption.value === drilldownPath[drilldownPath.length - levelsBack - 1],
    );

  const getSummarization = () => {
    const level = drilldownPath.length;
    const currentValueText =
      drilldownValues.length > 0 ? `${drilldownValues[drilldownValues.length - 1]}` : "";

    if (level === 1) {
      return {
        level,
        grouping: `All Items by ${getGroupOption()?.label}`,
      };
    }

    const previousGroupOption = getGroupOption(1);
    if (level === 2 && previousGroupOption?.value === "gender") {
      return {
        level,
        grouping: `${getGroupOption()?.label} for ${currentValueText}`,
      };
    }
    if (previousGroupOption?.value === "gender") {
      return {
        level: drilldownPath.length,
        grouping: `${drilldownValues[drilldownValues.length - 2] ?? ""} ${currentValueText} by ${getGroupOption()?.label}`,
      };
    }
    if (previousGroupOption?.value === "sizeName") {
      return {
        level: drilldownPath.length,
        grouping: `Size ${currentValueText} by ${getGroupOption()?.label}`,
      };
    }
    return {
      level: drilldownPath.length,
      grouping: `${currentValueText} by ${getGroupOption()?.label}`,
    };
  };

  const centerDataProp = getSummarization();

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
                {groupOptions.find((ago) => ago.value === groupOption)!.label}
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
        customIncludes={[{ prop: { centerData: centerDataProp }, value: "include center data" }]}
      />
      <CardBody>
        <Wrap align="end">
          <WrapItem>
            <FormLabel />
            <ValueFilter
              values={groupOptions}
              defaultFilterValue={groupOptions[0]}
              onFilterChange={onFilterChange}
              filterId={filterId}
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
                  {groupOptions.find((option) => value === option.value)?.label}
                </span>
              );
            }
            return (
              <span key={value}>
                {" "}
                {groupOptions.find((option) => value === option.value)?.label}: &quot;
                {drilldownValues[index]}&quot; <ArrowForwardIcon />
              </span>
            );
          })}
        </Box>
        <PieChart {...chartProps} centerData={centerDataProp} animate />
      </CardBody>
    </Card>
  );
}
