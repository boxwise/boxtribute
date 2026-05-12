import { Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import ProductsContainer from "./components/ProductsContainer";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";

function Products() {
  return (
    <>
      <Flex alignItems="center" mb={4}>
        <Heading fontWeight="bold" as="h2" flex="1">
          Manage Products
        </Heading>
        <Link as={RouterLink} to={"assort"} color="blue.500" fontWeight="semibold">
          Check ASSORT Standard Products {">"}
        </Link>
      </Flex>
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch products data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <ProductsContainer />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default Products;
