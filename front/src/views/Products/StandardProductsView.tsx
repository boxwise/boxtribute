import { Heading, Text } from "@chakra-ui/react";
import StandardProductsContainer from "./components/StandardProductsContainer";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";

function StandardProductsView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath={".."} />
      <Heading fontWeight="bold" mb={4} as="h2">
        Explore ASSORT
      </Heading>
      <Text>
        ASSORT is a standardized inventory classification system developed in partnership with IHA,
        HERMINE, and DistributeAid in full compliance with SPHERE and CHS standards for easy and
        effective use even by small volunteer teams.
      </Text>
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch standard products data! Please try reloading the page." />
        }
      >
        <StandardProductsContainer />
      </ErrorBoundary>
    </>
  );
}

export default StandardProductsView;
