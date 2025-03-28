import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import CreateCustomProductForm from "./components/CreateCustomProductForm";

const createCustomProductQueryErrorText =
  "Could not fetch ASSORT standard data! Please try reloading the page.";

function CreateCustomProductView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath=".." />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Add New Product
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || createCustomProductQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <CreateCustomProductForm />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default CreateCustomProductView;
