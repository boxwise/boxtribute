import {
  Accordion,
  AccordionItem,
  Flex,
  Spacer,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  Alert,
  AlertIcon,
  Button,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";

import useShareableLink from "../hooks/useShareableLink";

// TODO: Add other views to type once they are implemented.
export default function LinkSharing({ view }: { view: "StockOverview" }) {
  const {
    shareableLink,
    shareableLinkURL,
    warningMsg,
    isLinkSharingEnabled,
    copyLinkToClipboard,
    handleShareLinkClick,
  } = useShareableLink({ view });

  return (
    <>
      {isLinkSharingEnabled && (
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <Flex>
              <Spacer display={["none", "block"]} />
              <AccordionButton w="150px">
                <Box as="span" flex="1" textAlign="left">
                  Share Link
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </Flex>
            {/* TODO: Improve responsiveness for the info box and shareable link button. */}
            <AccordionPanel display="flex" flexDirection="column" gap={8}>
              <Flex justifyContent="space-between">
                <Alert status="info" maxWidth={["300px", "500px", "max-content"]}>
                  <AlertIcon />
                  {warningMsg}
                </Alert>
                <Button onClick={handleShareLinkClick}>Create Link</Button>
              </Flex>
              {shareableLink && (
                <Flex flexDirection="column" gap={4}>
                  <Button
                    onClick={() => copyLinkToClipboard()}
                    alignSelf="flex-start"
                    maxWidth="max-content"
                  >
                    <CopyIcon mr={2} /> {shareableLinkURL}
                  </Button>
                </Flex>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
