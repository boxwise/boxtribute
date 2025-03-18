import { Heading, Skeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { useAtomValue } from "jotai";
import { selectedBaseAtom } from "stores/globalPreferenceStore";
import StandardProductsContainer from "./components/StandardProductsContainer";
import ProductsContainer from "./components/ProductsContainer";

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
      <Tabs variant="enclosed-colored" mb={4} defaultIndex={1}>
        <TabList>
          <Tab fontWeight="bold" flex={1}>
            {baseName ? baseName?.toUpperCase() : <Skeleton height={6} width={20} mr={2} />}{" "}
            PRODUCTS
          </Tab>
          <Tab fontWeight="bold" flex={1}>
            ASSORT STANDARD PRODUCTS
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ProductsContainer />
          </TabPanel>
          <TabPanel>
            <StandardProductsContainer />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Products;
