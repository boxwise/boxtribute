import {
  CardHeader,
  Flex,
  Heading,
  Spacer,
  Checkbox,
  Button,
  Accordion,
  Box,
  Field,
  NumberInput,
  Center,
  CheckboxGroup,
  HStack,
  Wrap,
  useCheckboxGroup,
} from "@chakra-ui/react";
import { IoDownload } from "react-icons/io5";
import { useState } from "react";
import { useReactiveVar } from "@apollo/client";
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

  const { value, getItemProps } = useCheckboxGroup({
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
      <Accordion.Root multiple>
        {!isPublicView && (
          <Accordion.Item value="download" border="none">
            <Flex>
              <Heading size="md">{heading}</Heading>
              <Spacer />
              <Accordion.ItemTrigger w="150px">
                <Box as="span" flex="1" textAlign="left">
                  Download
                </Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </Flex>
            <Accordion.ItemContent>
              <Field.Root>
                <Wrap>
                  <Box width="100px">
                    <Field.Label>Width</Field.Label>
                    <NumberInput.Root
                      id={randomId()}
                      max={5000}
                      min={100}
                      step={10}
                      size="sm"
                      value={inputWidth.toString()}
                      onValueChange={(details) => setInputWidth(details.valueAsNumber)}
                    >
                      <NumberInput.Input />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                  </Box>
                  <Box width="100px">
                    <Field.Label>Height</Field.Label>
                    <NumberInput.Root
                      id={randomId()}
                      max={5000}
                      min={100}
                      step={10}
                      size="sm"
                      value={inputHeight.toString()}
                      onValueChange={(details) => setInputHeight(details.valueAsNumber)}
                    >
                      <NumberInput.Input />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                  </Box>
                  <Spacer />
                  <Center>
                    <CheckboxGroup defaultValue={["heading", "timerange"]}>
                      <Box>
                        <Field.Label>Options</Field.Label>
                        <HStack gap="24px">
                          <Checkbox.Root id={randomId()} {...getItemProps({ value: "heading" })}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Heading</Checkbox.Label>
                          </Checkbox.Root>
                          <Checkbox.Root id={randomId()} {...getItemProps({ value: "timerange" })}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Time Range</Checkbox.Label>
                          </Checkbox.Root>
                          <Checkbox.Root {...getItemProps({ value: "timestamp" })}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Timestamp</Checkbox.Label>
                          </Checkbox.Root>
                          {customIncludes!.map((option) => (
                            <Checkbox.Root
                              id={randomId()}
                              {...getItemProps({ value: option.value })}
                              key={option.value}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label>{option.value}</Checkbox.Label>
                            </Checkbox.Root>
                          ))}
                        </HStack>
                      </Box>
                    </CheckboxGroup>
                  </Center>
                  <Spacer />
                  <Center>
                    <Box>
                      <Field.Label>Downloads</Field.Label>
                      <HStack>
                        <Button
                          borderRadius="0px"
                          border="2px"
                          loading={isExporting}
                          backgroundColor="white"
                          value="jpg"
                          onClick={download}
                        >
                          JPG
                          <Box ml="10px">
                            <IoDownload />
                          </Box>
                        </Button>
                        <Button
                          borderRadius="0px"
                          border="2px"
                          loading={isExporting}
                          backgroundColor="white"
                          value="svg"
                          onClick={download}
                        >
                          SVG
                          <Box ml="10px">
                            <IoDownload />
                          </Box>
                        </Button>
                      </HStack>
                    </Box>
                  </Center>
                </Wrap>
              </Field.Root>
            </Accordion.ItemContent>
          </Accordion.Item>
        )}
      </Accordion.Root>
      <LinkSharingSection view={view} />
    </CardHeader>
  );
}
