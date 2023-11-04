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
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import domtoimage from "dom-to-image-more";
import { useState } from "react";

export default function VisHeader(params: {
  heading: string;
  visId: string;
  maxWidthPx: number | string;
  onExport: (
    width: number,
    height: number,
    includeHeading: boolean,
    includeTimestamp: boolean,
    includeFromTo: boolean
  ) => void;
  onExportFinished: () => void;
  custom?: boolean;
}) {
  const [isLoading, setLoading] = useState(false);
  const [inputWidth, setInputWidth] = useState(800);
  const [inputHeight, setInputHeight] = useState(500);
  const [includeHeading, setIncludeHeading] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeFromTo, setIncludeFromTo] = useState(true);

  const handleIncludeHeading = (e) => setIncludeHeading(e.target.checked);
  const handleIncludeTimestamp = (e) => setIncludeTimestamp(e.target.checked);
  const handleIncludeFromTo = (e) => setIncludeFromTo(e.target.checked);

  const downloadImage = () => {
    const chart = document.getElementById(params.visId); // params.visId

    domtoimage
      .toJpeg(chart, {
        quality: 0.9,
        width: inputWidth,
        height: inputHeight,
        bgColor: "#ffffff",
      })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.setAttribute("href", dataUrl);

        a.setAttribute("download", params.visId);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setLoading(false);
        params.onExportFinished();
      });
  };

  const downloadImageSVG = () => {
    const svgData = params.custom
      ? document.getElementById(params.visId).outerHTML
      : document.getElementById(params.visId)?.firstChild?.firstChild
          ?.firstChild.outerHTML;
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = params.visId + ".svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const download = () => {
    params.onExport(
      inputWidth,
      inputHeight,
      includeHeading,
      includeTimestamp,
      includeFromTo
    );
    setLoading(true);
    // timeout triggers the rerender with loading animations before generating the image.
    // without the timeout the loading animation sometimes won't be triggered
    setTimeout(downloadImage, 250);
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
                  <CheckboxGroup>
                    <Box>
                      <FormLabel>Options</FormLabel>
                      <HStack spacing="24px">
                        <Checkbox
                          isChecked={includeHeading}
                          onChange={handleIncludeHeading}
                          value="include-heading"
                        >
                          Heading
                        </Checkbox>
                        <Checkbox
                          isChecked={includeTimestamp}
                          onChange={handleIncludeFromTo}
                          value="include-fromto"
                        >
                          timerange
                        </Checkbox>
                        <Checkbox
                          isChecked={includeTimestamp}
                          onChange={handleIncludeTimestamp}
                          value="include-timestamp"
                        >
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
                        isLoading={isLoading}
                        backgroundColor="white"
                        onClick={download}
                      >
                        JPG
                        <DownloadIcon marginLeft="10px" />
                      </Button>
                      <Button
                        isLoading={isLoading}
                        backgroundColor="white"
                        onClick={downloadImageSVG}
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
