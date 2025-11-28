import { Accordion, Flex, Spacer, Box, Button } from "@chakra-ui/react";
import { IoCopy } from "react-icons/io5";
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
        <Accordion.Root collapsible>
          <Accordion.Item value="share-link" border="none">
            <Flex>
              <Spacer display={["none", "block"]} />
              <Accordion.ItemTrigger w="150px">
                <Box as="span" flex="1" textAlign="left">
                  Share Link
                </Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </Flex>
            {/* TODO: Improve responsiveness for the info box and shareable link button. */}
            <Accordion.ItemContent display="flex" flexDirection="column" gap={8}>
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
                    <Flex gap={2} align="center">
                      <IoCopy /> {shareableLinkURL}
                    </Flex>
                  </Button>
                </Flex>
              )}
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </>
  );
}
