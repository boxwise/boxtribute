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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { useCallback, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import useTimerange from "../hooks/useTimerange";
import { useAuthorization } from "../../../front/src/hooks/useAuthorization";
import { useNotification } from "../../../front/src/hooks/useNotification";
import { isChartExporting } from "../state/exportingCharts";
import { ImageFormat } from "../utils/chartExport";
import { date2String } from "../utils/chart";
import { trackDownloadByGraph } from "../utils/analytics/heap";
import { graphql } from "../../../graphql/graphql";
import { useParams } from "react-router-dom";

/** @todo To be configurable through ENV */
const BASE_PUBLIC_LINK_SHARING_URL = "localhost:3000";
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
  /** @todo This should be removed once link sharing is implemented for all views. */
  enableLinkSharing?: boolean;
}

const CREATE_SHAREABLE_LINK = graphql(`
  mutation CreateShareableLink($baseId: Int!, $urlParameters: String, $view: ShareableView!) {
    createShareableLink(
      creationInput: { baseId: $baseId, urlParameters: $urlParameters, view: $view }
    ) {
      ... on ShareableLink {
        __typename
        code
        validUntil
      }
    }
  }
`);

export default function VisHeader({
  heading,
  maxWidthPx,
  onExport,
  defaultWidth,
  defaultHeight,
  chartProps,
  customIncludes = [],
  enableLinkSharing = false,
}: IVisHeaderProps) {
  const authorize = useAuthorization();
  const { baseId } = useParams();
  const { createToast } = useNotification();
  const [shareableLink, setShareableLink] = useState("");
  const [shareableLinkExpiry, setShareableLinkExpiry] = useState("");
  const [inputWidth, setInputWidth] = useState(defaultWidth);
  const [inputHeight, setInputHeight] = useState(defaultHeight);
  const isExporting = useReactiveVar(isChartExporting);

  const shareableLinkURL = `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${shareableLink}`;
  const isLinkSharingEnabled =
    enableLinkSharing && authorize({ requiredAbps: ["create_shared_link"] });

  const [createShareableLinkMutation] = useMutation(CREATE_SHAREABLE_LINK);

  const copyLinkToClipboard = useCallback(
    (code = "") => {
      // Use retrieved code from mutation right away, otherwise use the computed state value.
      const linkTobeCopied = code
        ? `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${code}`
        : shareableLinkURL;

      navigator.clipboard.writeText(linkTobeCopied);
      createToast({
        type: "success",
        message: "Link copied to clipboard!",
      });
    },
    [createToast, shareableLinkURL],
  );

  const handleShareLinkClick = useCallback(
    () =>
      createShareableLinkMutation({
        variables: {
          baseId: parseInt(baseId || "0"),
          view: "StockOverview",
          urlParameters: document.location.search.slice(1),
        },
      }).then(({ data }) => {
        if (data?.createShareableLink?.__typename === "ShareableLink") {
          setShareableLink(data.createShareableLink.code);
          setShareableLinkExpiry(data.createShareableLink.validUntil || "");
          copyLinkToClipboard(data.createShareableLink.code);
        } else {
          createToast({
            type: "error",
            message: "An error has occurred. Try again later, or contact us.",
          });
        }
      }),
    [baseId, copyLinkToClipboard, createShareableLinkMutation, createToast],
  );

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
                        <Checkbox {...getCheckboxProps({ value: "timestamp" })}>Timestamp</Checkbox>
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
      </Accordion>
      {isLinkSharingEnabled && (
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <Flex>
              <Spacer />
              <AccordionButton w="150px">
                <Box as="span" flex="1" textAlign="left">
                  Share Link
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </Flex>
            <AccordionPanel display="flex" flexDirection="column" gap={8}>
              <Flex justifyContent="space-between">
                <Alert status="warning" width="330px">
                  <AlertIcon />
                  Warning: current filters are applied.
                </Alert>
                <Button onClick={handleShareLinkClick}>Create Link</Button>
              </Flex>
              {shareableLink && (
                <Flex flexDirection="column" gap={2}>
                  <Alert status="info">
                    <AlertIcon />
                    Message: link expires on {new Date(shareableLinkExpiry).toUTCString()}
                  </Alert>
                  <Button onClick={() => copyLinkToClipboard()}>
                    <CopyIcon mr={2} /> {shareableLinkURL}
                  </Button>
                </Flex>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </CardHeader>
  );
}
