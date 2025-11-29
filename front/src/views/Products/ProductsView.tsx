import { Button, Heading, Skeleton, Tabs } from "@chakra-ui/react";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { useAtomValue } from "jotai";
import { selectedBaseAtom } from "stores/globalPreferenceStore";
import StandardProductsContainer from "./components/StandardProductsContainer";
import ProductsContainer from "./components/ProductsContainer";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import { IoAdd } from "react-icons/io5";

function Products() {
  const selectedBase = useAtomValue(selectedBaseAtom);
  const baseName = selectedBase?.name;

  return (
    <>
      <BreadcrumbNavigation
        items={[{ label: "Coordinator Admin" }, { label: "Manage Products" }]}
      />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Products
      </Heading>
      <Tabs.Root variant="enclosed" mb={4} defaultValue="0" fitted>
        <Tabs.List>
          <Tabs.Trigger value="0" fontWeight="bold" flex={1}>
            {baseName ? baseName?.toUpperCase() : <Skeleton height={6} width={20} mr={2} />}{" "}
            PRODUCTS
          </Tabs.Trigger>
          <Tabs.Trigger value="1" fontWeight="bold" flex={1}>
            ASSORT STANDARD PRODUCTS
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="0">
          <Link to="create">
            <Button borderRadius="0">
              <IoAdd />
              Add New Product
            </Button>
          </Link>
          <ErrorBoundary
            fallback={
              <AlertWithoutAction alertText="Could not fetch products data! Please try reloading the page." />
            }
          >
            <Suspense fallback={<TableSkeleton />}>
              <ProductsContainer />
            </Suspense>
          </ErrorBoundary>
        </Tabs.Content>
        <Tabs.Content value="1">
          <ErrorBoundary
            fallback={
              <AlertWithoutAction alertText="Could not fetch standard products data! Please try reloading the page." />
            }
          >
            <StandardProductsContainer />
          </ErrorBoundary>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default Products;
