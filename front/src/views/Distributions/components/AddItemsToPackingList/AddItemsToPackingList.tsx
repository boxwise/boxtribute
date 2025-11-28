import {
  Box,
  Button,
  Checkbox,
  Flex,
  Field,
  Heading,
  Switch,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import _ from "lodash";
import { useContext, useState } from "react";
import { DistroEventDetailsForPlanningStateContext } from "views/Distributions/DistroEventView/components/State1Planning/DistroEventDetailsForPlanningStateContainer";
import { IPackingListEntry } from "views/Distributions/types";
import { ProductGender } from "../../../../../../graphql/types";

export interface ProductDataForPackingList {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
  gender: ProductGender;
}

export interface ProductDataWithPackingListEntryFlags extends ProductDataForPackingList {
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
  productData: ProductDataForPackingList[];
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

  const productDataWithPackingListEntriesSignals = productData.map((productDataPoint) => ({
    ...productDataPoint,
    hasPackingListEntries: packingListEntries.some(
      (entry) => entry.product.id === productDataPoint.id,
    ),
  }));

  const ctx = useContext(DistroEventDetailsForPlanningStateContext);

  const [checkedProductIds, setCheckedProductIds] = useState(productIdsWithPackingListEntries);

  const productsGroupedByGender: ProductsForGender[] = _.chain(
    productDataWithPackingListEntriesSignals,
  )
    .groupBy("gender")
    .map((value, key) => ({ gender: key, products: value }))
    .value();

  const productsGroupedByGenderAndCategory: ProductsGroupedByCategoryForGender[] = _.chain(
    productsGroupedByGender,
  )
    // const productsGroupedByGenderAndCategory = _.chain(productsGroupedByGender)
    .map((productsGroupForGender) => {
      const productsGroupedByCategory = _.chain(productsGroupForGender.products)
        .groupBy("category.id")
        .map((value, key) => ({
          category: {
            id: key,
            name: value[0].category?.name ?? "Uncategeorized",
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

  const onApplyClick = () => {
    const entriesToAdd = checkedProductIds.filter(
      (p1) => !productIdsWithPackingListEntries.some((p2) => p1 === p2),
    );
    const entriesToRemove = productIdsWithPackingListEntries.filter(
      (p1) => !checkedProductIds.some((p2) => p1 === p2),
    );
    ctx?.onUpdateProductsInPackingList(entriesToAdd, entriesToRemove);
    onClose();

    // alert(JSON.stringify(entriesToRemove));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let updatedList = [...checkedProductIds];
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
        <Switch.Root id="show-only-products-in-stock">
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>{" "}
        <Field.Label htmlFor="show-only-products-in-stock" display="inline">
          Only show products in stock
        </Field.Label>
      </Box>
      <Tabs.Root variant="enclosed" colorPalette="green" px="30">
        <Tabs.List flexWrap="wrap">
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <Tabs.Trigger
              key={productsGroupForGender.gender || "No Gender"}
              value={productsGroupForGender.gender || "No Gender"}
            >
              {productsGroupForGender.gender || "No Gender"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.ContentGroup>
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <Tabs.Content
              key={productsGroupForGender.gender || "No Gender"}
              value={productsGroupForGender.gender || "No Gender"}
            >
              <VStack gap={8}>
                {productsGroupForGender.productsForCategory.map((productsGroupForCategory) => (
                  <Box key={productsGroupForCategory.category.id}>
                    <Heading fontSize="lg" fontWeight="bold" textAlign={"center"} mb={15}>
                      {productsGroupForCategory.category.name}
                    </Heading>
                    <VStack>
                      {productsGroupForCategory.products.map((product) => (
                        <Checkbox.Root
                          key={product.id}
                          value={product.id}
                          checked={checkedProductIds.includes(product.id)}
                          onCheckedChange={(e) =>
                            handleCheckboxChange({
                              target: { checked: e.checked, value: product.id },
                            } as React.ChangeEvent<HTMLInputElement>)
                          }
                          defaultChecked={product.hasPackingListEntries}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>{product.name}</Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Tabs.Content>
          ))}
        </Tabs.ContentGroup>
      </Tabs.Root>
      <Button type="submit" onClick={onApplyClick} colorPalette="blue">
        Apply
      </Button>
    </Flex>
  );
};

export default AddItemsToPackingList;
