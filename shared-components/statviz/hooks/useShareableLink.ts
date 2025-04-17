import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

// TODO: Move common utils to shared-components, use alias for imports.
import { graphql } from "../../../graphql/graphql";
import { useAuthorization } from "../../../front/src/hooks/useAuthorization";
import { useNotification } from "../../../front/src/hooks/useNotification";
import { useMutation } from "@apollo/client";

const BASE_PUBLIC_LINK_SHARING_URL = import.meta.env.FRONT_PUBLIC_URL;

const CREATE_SHAREABLE_LINK = graphql(`
  mutation CreateShareableLink($baseId: Int!, $urlParameters: String, $view: ShareableView!) {
    createShareableLink(
      creationInput: { baseId: $baseId, urlParameters: $urlParameters, view: $view }
    ) {
      __typename
      ... on ShareableLink {
        code
        validUntil
      }
    }
  }
`);

/**
 * Shareable Link utilities and hooks to use across the Dashboard/Statviz views.
 */
export default function useShareableLink({
  view,
}: {
  /**
   * View to share public through the generated link.
   * @todo Add other views once they are elegible for link sharing.
   * */
  view: "StockOverview";
}) {
  const authorize = useAuthorization();
  const { baseId } = useParams();
  const { createToast } = useNotification();
  const [shareableLink, setShareableLink] = useState("");
  const [shareableLinkExpiry, setShareableLinkExpiry] = useState("");

  const shareableLinkURL = `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${shareableLink}`;
  // TODO: Only check for ABP once link sharing is implemented for all views.
  const isLinkSharingEnabled =
    authorize({ requiredAbps: ["create_shareable_link"] }) && view === "StockOverview";

  const [createShareableLinkMutation] = useMutation(CREATE_SHAREABLE_LINK);

  const copyLinkToClipboard = useCallback(
    async (code?: string) => {
      // Use retrieved code from mutation right away, otherwise use the computed state value.
      const linkTobeCopied = code
        ? `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${code}`
        : shareableLinkURL;

      try {
        await navigator.clipboard.writeText(linkTobeCopied);
      } catch (error) {
        createToast({
          type: "error",
          message: "Failed to copy to clipboard.",
        });
      }
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
          view,
          urlParameters: document.location.search.slice(1),
        },
      }).then(({ data }) => {
        if (data?.createShareableLink?.__typename === "ShareableLink") {
          setShareableLink(data.createShareableLink.code);
          setShareableLinkExpiry(data.createShareableLink.validUntil || "");
          copyLinkToClipboard(data.createShareableLink.code);
        } else {
          // TODO: Use triggerError and move it to shared-components?
          createToast({
            type: "error",
            message: "An error has occurred. Try again later, or contact us.",
          });
        }
      }),
    [baseId, copyLinkToClipboard, createShareableLinkMutation, createToast, view],
  );

  return {
    shareableLink,
    shareableLinkURL,
    shareableLinkExpiry,
    isLinkSharingEnabled,
    copyLinkToClipboard,
    handleShareLinkClick,
  };
}
