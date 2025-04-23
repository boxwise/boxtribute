import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

// TODO: Move common utils to shared-components, use alias for imports.
import { graphql } from "../../../graphql/graphql";
import { useAuthorization } from "../../../front/src/hooks/useAuthorization";
import { useNotification } from "../../../front/src/hooks/useNotification";
import { useMutation, useReactiveVar } from "@apollo/client";
import useValueFilter from "./useValueFilter";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
  IBoxesOrItemsFilter,
} from "../components/filter/BoxesOrItemsSelect";
import { tagFilterId } from "../components/filter/TagFilter";
import { tagFilterValuesVar } from "../state/filter";
import useMultiSelectFilter from "./useMultiSelectFilter";

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
  const [searchParams] = useSearchParams();
  const [shareableLink, setShareableLink] = useState("");
  const [alertType, setAlertType] = useState<"info" | "warning" | undefined>();
  const [globalParams, setGlobalParams] = useState(useSearchParams()[0].toString());
  const { filterValue: boi } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );
  const tagFilterValues = useReactiveVar(tagFilterValuesVar);
  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilterValues, tagFilterId);
  const [expirationDate, setExpirationDate] = useState<string | undefined>();

  // Remove the JSX from the hook
  const shareableLinkURL = `${BASE_PUBLIC_LINK_SHARING_URL}/?code=${shareableLink}`;
  // TODO: Only check for ABP once link sharing is implemented for all views.
  const isLinkSharingEnabled =
    authorize({ requiredAbps: ["create_shareable_link"] }) && view === "StockOverview";

  const [createShareableLinkMutation] = useMutation(CREATE_SHAREABLE_LINK);

  useEffect(() => {
    if (searchParams.toString() !== globalParams) {
      setGlobalParams(searchParams.toString());
      setAlertType("warning");
    }
  }, [searchParams, globalParams]);

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
          setAlertType("info");
          setExpirationDate(new Date(data.createShareableLink.validUntil || "").toUTCString());
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
    alertType,
    isLinkSharingEnabled,
    copyLinkToClipboard,
    handleShareLinkClick,
    filteredTags,
    boi,
    expirationDate,
  };
}
