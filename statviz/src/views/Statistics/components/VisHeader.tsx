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
import domtoimage from "dom-to-image";
import { useState } from "react";

export default function VisHeader(params: {
  heading: string;
  visId: string;
  maxWidthPx: number | string;
  custom?: boolean;
}) {
  const [isLoading, setLoading] = useState(false);

  const downloadImage = () => {
    const chart = document.getElementById(params.visId);

    domtoimage.toJpeg(chart, { quality: 0.9 }).then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("href", dataUrl);

      a.setAttribute("download", params.visId);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setLoading(false);
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
    downloadLink.download = "newesttree.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const download = () => {
    setLoading(true);
    setTimeout(downloadImage, 1);
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
                    defaultValue={800}
                    step={10}
                    size="sm"
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
                    defaultValue={800}
                    step={10}
                    size="sm"
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
                        <Checkbox checked value="include-heading">
                          Heading
                        </Checkbox>
                        <Checkbox checked value="include-timestamp">
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
