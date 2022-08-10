import {
  Box, Button, Checkbox, Flex, FormLabel, Heading, Switch, Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs, VStack
} from "@chakra-ui/react";
import _ from "lodash";
import { useContext, useState } from "react";
import { ProductGender } from "types/generated/graphql";
import { DistroEventDetailsForPlanningStateContext } from "views/Distributions/DistroEventView/components/State1Planning/DistroEventDetailsForPlanningStateContainer";
import { IPackingListEntry } from "views/Distributions/types";

export interface ProductData {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  gender: ProductGender;
}

export interface ProductDataWithPackingListEntryFlags extends ProductData {
  hasPackingListEntries: boolean;
}

export interface PackingListEntriesForProductToAdd {
  productId: number;
  sizeIdAndNumberOfItemTuples: {
    sizeId: string;
    numberOfItems: number;
  }[];
}

interface AddItemToPackingProps {
  // onAddEntiresToPackingListForProduct: (
  //   entriesToAdd: PackingListEntriesForProductToAdd
  // ) => void;
  onClose: () => void;
  productData: ProductData[];
  packingListEntries: IPackingListEntry[];
}

// TODO rename this (and also the container component) to SelectProductsForPackingList (or something like that)
const AddItemsToPackingList = ({
  // onAddEntiresToPackingListForProduct,
  onClose,
  productData,
  packingListEntries,
}: AddItemToPackingProps) => {
  type ProductsForGender = {
    gender: ProductGender;
    products: ProductDataWithPackingListEntryFlags[];
  };

  type ProductsForCategory = {
    category: {
      id: string;
      name: string;
    };
    products: ProductDataWithPackingListEntryFlags[];
  };

  type ProductsGroupedByCategoryForGender = {
    gender: ProductGender;
    productsForCategory: ProductsForCategory[];
  };

  const productIdsWithPackingListEntries = _.chain(packingListEntries)
    .map((p) => p.product.id)
    .uniq()
    .value();

  const productDataWithPackingListEntriesSignals = productData.map(
    (productDataPoint) => ({
      ...productDataPoint,
      hasPackingListEntries: packingListEntries.some(
        (entry) => entry.product.id === productDataPoint.id
      ),
    })
  );

  const ctx = useContext(DistroEventDetailsForPlanningStateContext);

  const [checkedProductIds, setCheckedProductIds] = useState(
    productIdsWithPackingListEntries
  );

  const productsGroupedByGender: ProductsForGender[] = _.chain(
    productDataWithPackingListEntriesSignals
  )
    .groupBy("gender")
    .map((value, key) => ({ gender: ProductGender[key], products: value }))
    .value();

  const productsGroupedByGenderAndCategory: ProductsGroupedByCategoryForGender[] =
    _.chain(productsGroupedByGender)
      // const productsGroupedByGenderAndCategory = _.chain(productsGroupedByGender)
      .map((productsGroupForGender) => {
        const productsGroupedByCategory = _.chain(
          productsGroupForGender.products
        )
          .groupBy("category.id")
          .map((value, key) => ({
            category: {
              id: key,
              name: value[0].category.name ?? "Uncategeorized",
            },
            products: value,
          }))
          .value();
        // return { ...productsGroupForGender, productsGroupedByCategory };
        return {
          gender: productsGroupForGender.gender,
          productsForCategory: productsGroupedByCategory,
        };
      })
      .value();

  console.log(
    "productsGroupedByGenderAndCategory",
    productsGroupedByGenderAndCategory
  );

  const onApplyClick = () => {
    const entriesToAdd = checkedProductIds.filter(
      (p1) => !productIdsWithPackingListEntries.some((p2) => p1 === p2)
    );
    const entriesToRemove = productIdsWithPackingListEntries.filter(
      (p1) => !checkedProductIds.some((p2) => p1 === p2)
    );
    ctx?.onUpdateProductsInPackingList(entriesToAdd, entriesToRemove);
    onClose();

    // alert(JSON.stringify(entriesToRemove));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var updatedList = [...checkedProductIds];
    if (event.target.checked) {
      updatedList = [...checkedProductIds, event.target.value];
    } else {
      updatedList.splice(checkedProductIds.indexOf(event.target.value), 1);
    }
    setCheckedProductIds(updatedList);
  };

  return (
    <Flex flexDir={"column"} alignItems="center" justifyContent="space-between">
      {/* productIdsWithPackingListEntries: {JSON.stringify(productIdsWithPackingListEntries)} <br />
      checkedProductIds: {JSON.stringify(checkedProductIds)} <br /> */}
      <Heading fontSize="xl" mb={3} borderBottom="1px" borderColor="gray.300">
        Select Products for Packing List
      </Heading>
      <Box my={7}>
        <Switch id="show-only-products-in-stock" />{" "}
        <FormLabel htmlFor="show-only-products-in-stock" display="inline">
          Only show products in stock
        </FormLabel>
      </Box>
      <Tabs variant="soft-rounded" colorScheme="green" px="30">
        <TabList flexWrap="wrap">
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <Tab key={productsGroupForGender.gender || "No Gender"}>
              {productsGroupForGender.gender || "No Gender"}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <TabPanel key={productsGroupForGender.gender || "No Gender"}>
              <VStack spacing={8}>
                {productsGroupForGender.productsForCategory.map(
                  (productsGroupForCategory) => (
                    <Box key={productsGroupForCategory.category.id}>
                      <Heading
                        fontSize="lg"
                        fontWeight="bold"
                        textAlign={"center"}
                        mb={15}
                      >
                        {productsGroupForCategory.category.name}
                      </Heading>
                      <VStack>
                        {productsGroupForCategory.products.map((product) => (
                          <Checkbox
                            key={product.id}
                            value={product.id}
                            checked={checkedProductIds.includes(product.id)}
                            onChange={handleCheckboxChange}
                            defaultChecked={product.hasPackingListEntries}
                          >
                            {product.name}
                          </Checkbox>
                        ))}
                      </VStack>
                    </Box>
                  )
                )}
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Button type="submit" onClick={onApplyClick} colorScheme="blue">
        Apply
      </Button>
    </Flex>
  );
};

export default AddItemsToPackingList;
