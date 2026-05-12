import { Heading } from "@chakra-ui/react";
import StandardProductsContainer from "./components/StandardProductsContainer";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";

function StandardProductsView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath={".."} />
      <Heading fontWeight="bold" mb={4} as="h2">
        ASSORT Standard Products
      </Heading>
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
