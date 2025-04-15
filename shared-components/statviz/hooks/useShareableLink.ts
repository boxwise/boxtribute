import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import { graphql } from "../../../graphql/graphql";
import { useAuthorization } from "../../../front/src/hooks/useAuthorization";
import { useNotification } from "../../../front/src/hooks/useNotification";
import { useMutation } from "@apollo/client";

/** @todo To be configurable through ENV */
const BASE_PUBLIC_LINK_SHARING_URL = "localhost:3000";

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
      ... on InsufficientPermissionError {
        __typename
      }
      ... on UnauthorizedForBaseError {
        __typename
      }
    }
  }
`);

/**
 * Shareable Link utilities and hooks to use across the Dashboard/Statviz views.
 */
export default function useShareableLink({
  enableLinkSharing,
}: {
  /** @todo This should be removed once link sharing is implemented for all views. */
  enableLinkSharing?: boolean;
}) {
  const authorize = useAuthorization();
  const { baseId } = useParams();
  const { createToast } = useNotification();
  const [shareableLink, setShareableLink] = useState("");
  const [shareableLinkExpiry, setShareableLinkExpiry] = useState("");

  const shareableLinkURL = `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${shareableLink}`;
  const isLinkSharingEnabled =
    authorize({ requiredAbps: ["create_shared_link"] }) && enableLinkSharing;

  const [createShareableLinkMutation] = useMutation(CREATE_SHAREABLE_LINK);

  const copyLinkToClipboard = useCallback(
    (code?: string) => {
      // Use retrieved code from mutation right away, otherwise use the computed state value.
      const linkTobeCopied = `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${code ?? shareableLinkURL}`;

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

  return {
    shareableLink,
    shareableLinkURL,
    isLinkSharingEnabled,
    shareableLinkExpiry,
    copyLinkToClipboard,
    handleShareLinkClick,
  };
}
