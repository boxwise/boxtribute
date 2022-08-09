import {
  Button,
  Flex,
  FormControl,
  Select,
  Box,
  Input,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Checkbox,
  VStack,
  Heading,
  Center,
  Spacer,
  Switch,
  Divider,
  FormLabel,
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { groupBy } from "utils/helpers";
import { ProductGender } from "types/generated/graphql";
import _ from "lodash";
import { IPackingListEntry } from "views/Distributions/types";

export interface ProductData {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  gender: ProductGender;
};

export interface ProductDataWithPackingListEntryFlags extends ProductData{
  hasPackingListEntries: boolean;
};

export interface PackingListEntriesForProductToAdd {
  productId: number;
  sizeIdAndNumberOfItemTuples: {
    sizeId: string;
    numberOfItems: number;
  }[];
}

interface AddItemToPackingProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProductToAdd
  ) => void;
  productData: ProductData[];
  packingListEntries: IPackingListEntry[];
}

const AddItemsToPackingList = ({
  onAddEntiresToPackingListForProduct,
  productData,
  packingListEntries
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

  const productDataWithPackingListEntriesSignals = productData.map(productDataPoint => ({
    ...productDataPoint,
    hasPackingListEntries: packingListEntries.some(entry => entry.product.id === productDataPoint.id)
  }));

  const productsGroupedByGender: ProductsForGender[] = _.chain(productDataWithPackingListEntriesSignals)
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
  return (
    <Flex flexDir={"column"} alignItems="center" justifyContent="space-between">
      {/* <Box> */}
      <Heading fontSize="xl" mb={3} borderBottom="1px" borderColor="gray.300">
        Select Products for Packing List
      </Heading>
      <Box my={7}>
        <Switch id="show-only-products-in-stock" />{" "}
        <FormLabel htmlFor="show-only-products-in-stock" display="inline">
          Only show products in stock
        </FormLabel>
      </Box>
      {/* <Divider /> */}
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
                          <Checkbox key={product.id} value={product.id} defaultChecked={product.hasPackingListEntries}>
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
      <Button onClick={onApplyClick} colorScheme="blue">
        Apply
      </Button>
    </Flex>
  );
};

export default AddItemsToPackingList;
