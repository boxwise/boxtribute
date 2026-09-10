import React from "react";
import { Alert, AlertIcon, Box } from "@chakra-ui/react";

interface ShareableLinkAlertProps {
  alertType?: "info" | "warning";
  expirationDate?: string;
}

export const ShareableLinkAlert: React.FC<ShareableLinkAlertProps> = ({
  alertType,
  expirationDate,
}) => {
  if (!alertType) return <Box></Box>;

  const expirationText = expirationDate ? `Link will expire on ${expirationDate}.` : "";

  return (
    <Alert status={alertType} maxWidth={["300px", "500px", "max-content"]}>
      <AlertIcon />
      {alertType === "info" ? (
        <p>
          <strong>Shareable Link Created</strong>
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
