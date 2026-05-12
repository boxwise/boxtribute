import { Button, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import StandardProductsContainer from "./components/StandardProductsContainer";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";

function StandardProductsView() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);

  return (
    <>
      <Button
        leftIcon={<ChevronLeftIcon />}
        variant="link"
        mb={4}
        onClick={() => navigate(`/bases/${baseId}/products`)}
      >
        Back to Manage Products
      </Button>
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
