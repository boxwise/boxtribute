import {
  CardHeader,
  Flex,
  Heading,
  Spacer,
  Checkbox,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  FormLabel,
  FormControl,
  NumberInputField,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  Center,
  CheckboxGroup,
  HStack,
  Wrap,
  useCheckboxGroup,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useReactiveVar } from "@apollo/client/react";
import useTimerange from "../hooks/useTimerange";
import { isChartExporting } from "../state/exportingCharts";
import { ImageFormat } from "../utils/chartExport";
import { date2String } from "../utils/chart";
import { trackDownloadByGraph } from "../utils/analytics/heap";
import LinkSharingSection from "./LinkSharingSection";

const randomId = () => (Math.random() + 1).toString(36).substring(2);

interface IVisHeaderProps {
  heading: string;
  maxWidthPx: number | string;
  onExport: (
    width: number,
    height: number,
    includeHeading: string | undefined,
    includeTimerange: string | undefined,
    includeTimestamp: string | undefined,
    chartProps: object,
    imageFormat: ImageFormat,
  ) => void;
  defaultWidth: number;
  defaultHeight: number;
  chartProps: object;
  customIncludes?: {
    prop: object;
    value: string;
  }[];
  view?: "StockOverview";
}

export default function VisHeader({
  heading,
  maxWidthPx,
  onExport,
  defaultWidth,
  defaultHeight,
  chartProps,
  customIncludes = [],
  view,
}: IVisHeaderProps) {
  const [inputWidth, setInputWidth] = useState(defaultWidth);
  const [inputHeight, setInputHeight] = useState(defaultHeight);
  const isExporting = useReactiveVar(isChartExporting);

  const isPublicView = !!localStorage.getItem("code");

  const { timerange } = useTimerange();

  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: ["heading", "timerange"],
  });

  const download = (e) => {
    isChartExporting(true);
    trackDownloadByGraph({
      graphName: heading,
      downloadFormat: e.target.value,
    });

    const customIncludeProps = customIncludes!
      .filter((customInclude) => value.includes(customInclude.value))
      ?.map((fcI) => fcI.prop);

    const props =
      customIncludeProps.length > 0
        ? {
            ...chartProps,
            ...customIncludeProps.reduce((previous, current) => ({ ...current, ...previous })),
          }
        : chartProps;

    onExport(
      inputWidth,
      inputHeight,
      value.indexOf("heading") !== -1 ? heading : undefined,
      value.indexOf("timerange") !== -1 ? timerange : undefined,
      value.indexOf("timestamp") !== -1 ? date2String(new Date()) : undefined,
      props,
      e.target.value,
    );
  };

  const getMaxWidth = () => {
    const marginInPx = 50;
    if (typeof maxWidthPx === "string") {
      return parseInt(maxWidthPx, 10) + marginInPx;
    }
    return maxWidthPx + marginInPx;
  };

  return (
    <CardHeader maxWidth={getMaxWidth()}>
      <Accordion allowMultiple>
        {!isPublicView && (
          <AccordionItem border="none">
            <Flex>
              <Heading size="md">{heading}</Heading>
              <Spacer />
              <AccordionButton w="150px">
                <Box as="span" flex="1" textAlign="left">
                  Download
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </Flex>
            <AccordionPanel>
              <FormControl>
                <Wrap>
                  <Box width="100px">
                    <FormLabel>Width</FormLabel>
                    <NumberInput
                      id={randomId()}
                      max={5000}
                      min={100}
                      step={10}
                      size="sm"
                      value={inputWidth}
                      onChange={(_valueString, valueNumber) => setInputWidth(valueNumber)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box width="100px">
                    <FormLabel>Height</FormLabel>
                    <NumberInput
                      id={randomId()}
                      max={5000}
                      min={100}
                      step={10}
                      size="sm"
                      value={inputHeight}
                      onChange={(_valueString, valueNumber) => setInputHeight(valueNumber)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Spacer />
                  <Center>
                    <CheckboxGroup defaultValue={["heading", "timerange"]}>
                      <Box>
                        <FormLabel>Options</FormLabel>
                        <HStack spacing="24px">
                          <Checkbox
                            id={randomId()}
                            checked
                            {...getCheckboxProps({ value: "heading" })}
                          >
                            Heading
                          </Checkbox>
                          <Checkbox id={randomId()} {...getCheckboxProps({ value: "timerange" })}>
                            Time Range
                          </Checkbox>
                          <Checkbox {...getCheckboxProps({ value: "timestamp" })}>
                            Timestamp
                          </Checkbox>
                          {customIncludes!.map((option) => (
                            <Checkbox
                              id={randomId()}
                              {...getCheckboxProps({ value: option.value })}
                              key={option.value}
                            >
                              {option.value}
                            </Checkbox>
                          ))}
                        </HStack>
                      </Box>
                    </CheckboxGroup>
                  </Center>
                  <Spacer />
                  <Center>
                    <Box>
                      <FormLabel>Downloads</FormLabel>
                      <HStack>
                        <Button
                          borderRadius="0px"
                          border="2px"
                          isLoading={isExporting}
                          backgroundColor="white"
                          value="jpg"
                          onClick={download}
                        >
                          JPG
                          <DownloadIcon marginLeft="10px" />
                        </Button>
                        <Button
                          borderRadius="0px"
                          border="2px"
                          isLoading={isExporting}
                          backgroundColor="white"
                          value="svg"
                          onClick={download}
                        >
                          SVG
                          <DownloadIcon marginLeft="10px" />
                        </Button>
                      </HStack>
                    </Box>
                  </Center>
                </Wrap>
              </FormControl>
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
      <LinkSharingSection view={view} />
    </CardHeader>
  );
}
