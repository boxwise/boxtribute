import {
  Accordion,
  AccordionItem,
  Flex,
  Spacer,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  Button,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import useShareableLink from "../hooks/useShareableLink";
import { ShareableLinkAlert } from "./ShareableLinkAlert";

// TODO: Add other views to type once they are implemented.
export default function LinkSharingSection({ view }: { view?: "StockOverview" }) {
  const {
    shareableLink,
    shareableLinkURL,
    alertType,
    isLinkSharingEnabled,
    copyLinkToClipboard,
    handleShareLinkClick,
    filteredTags,
    boi,
    expirationDate,
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
              <Flex justifyContent="space-between" gap={2}>
                <ShareableLinkAlert
                  alertType={alertType}
                  boi={boi}
                  filteredTags={filteredTags}
                  expirationDate={expirationDate}
                />
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
