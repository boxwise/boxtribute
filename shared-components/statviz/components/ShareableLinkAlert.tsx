import React from "react";
import { Alert, AlertIcon, Box } from "@chakra-ui/react";
import { IBoxesOrItemsFilter } from "./filter/BoxesOrItemsSelect";
import { ITagFilterValue } from "../state/filter";
import { IFilterValue } from "./filter/ValueFilter";

interface ShareableLinkAlertProps {
  alertType?: "info" | "warning";
  boi?: IFilterValue & IBoxesOrItemsFilter;
  includedTags?: (IFilterValue & ITagFilterValue)[];
  excludedTags?: (IFilterValue & ITagFilterValue)[];
  expirationDate?: string;
}

export const ShareableLinkAlert: React.FC<ShareableLinkAlertProps> = ({
  alertType,
  boi,
  includedTags = [],
  excludedTags = [],
  expirationDate,
}) => {
  if (!alertType) return <Box></Box>;

  const boiText = boi?.label;

  const tagText = (() => {
    const parts: string[] = [];
    if (includedTags.length > 0) {
      parts.push(`including: ${includedTags.map(({ label }) => label).join(", ")}`);
    }
    if (excludedTags.length > 0) {
      parts.push(`excluding: ${excludedTags.map(({ label }) => label).join(", ")}`);
    }
    return parts.length > 0 ? `, filtered by tags (${parts.join("; ")})` : "";
  })();

  const expirationText = expirationDate ? `Link will expire on ${expirationDate}.` : "";

  return (
    <Alert status={alertType} maxWidth={["300px", "500px", "max-content"]}>
      <AlertIcon />
      {alertType === "info" ? (
        <p>
          <strong>Shareable Link Created</strong>
          <br />
          This link will show your inventory in {boiText}
          {tagText}.
          <br />
          {expirationText}
        </p>
      ) : (
        <p>
          <strong>Warning</strong>
          <br />
          Your current view uses different units and/or filters from those used in your public link.
          <br />
          Click <strong>Create Link</strong> to generate a new link with the changes.
        </p>
      )}
    </Alert>
  );
};
