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
import { ImageFormat } from "../utils/chartExport";
import { date2String } from "../utils/chart";
import useTimerange from "../hooks/useTimerange";
import { isChartExporting } from "../state/exportingCharts";
import { useReactiveVar } from "@apollo/client";

export default function VisHeader(params: {
  heading: string;
  visId: string;
  maxWidthPx: number | string;
  onExport: (
    width: number,
    height: number,
    includeHeading: boolean,
    includeTimerange: boolean,
    includeTimestamp: boolean,
    chartProps: object,
    imageFormat: ImageFormat
  ) => void;
  defaultWidth: number;
  defaultHeight: number;
  chartProps: object;
  custom?: boolean;
}) {
  const [inputWidth, setInputWidth] = useState(params.defaultWidth);
  const [inputHeight, setInputHeight] = useState(params.defaultHeight);
  const isExporting = useReactiveVar(isChartExporting);

  const { timerange } = useTimerange();

  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: ["heading", "timerange"],
  });

  const download = (e) => {
    isChartExporting(true);
    params.onExport(
      parseInt(inputWidth),
      parseInt(inputHeight),
      value.indexOf("heading") !== -1 ? params.heading : undefined,
      value.indexOf("timerange") !== -1 ? timerange : undefined,
      value.indexOf("timestamp") !== -1 ? date2String(new Date()) : undefined,
      params.chartProps,
      e.target.value
    );
  };

  const getMaxWidth = () => {
    const marginInPx = 50;
    if (typeof params.maxWidthPx === "string") {
      return parseInt(params.maxWidthPx) + marginInPx;
    }
    return params.maxWidthPx + marginInPx;
  };

  return (
    <CardHeader maxWidth={getMaxWidth()}>
      <Accordion allowMultiple>
        <AccordionItem border="none">
          <Flex>
            <Heading size="md">{params.heading}</Heading>
            <Spacer></Spacer>
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
                    max={5000}
                    min={100}
                    step={10}
                    size="sm"
                    value={inputWidth}
                    onChange={setInputWidth}
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
                    max={5000}
                    min={100}
                    step={10}
                    size="sm"
                    value={inputHeight}
                    onChange={setInputHeight}
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
                          checked
                          {...getCheckboxProps({ value: "heading" })}
                        >
                          Heading
                        </Checkbox>
                        <Checkbox {...getCheckboxProps({ value: "timerange" })}>
                          Time Range
                        </Checkbox>
                        <Checkbox {...getCheckboxProps({ value: "timestamp" })}>
                          Timestamp
                        </Checkbox>
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
                        isLoading={isExporting}
                        backgroundColor="white"
                        value="jpg"
                        onClick={download}
                      >
                        JPG
                        <DownloadIcon marginLeft="10px" />
                      </Button>
                      <Button
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
      </Accordion>
    </CardHeader>
  );
}
