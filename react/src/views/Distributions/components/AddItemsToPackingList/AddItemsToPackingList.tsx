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
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { groupBy } from "utils/helpers";
import { ProductGender } from "types/generated/graphql";
import _ from "lodash";

interface SizeIdAndNameTuple {
  id: string;
  name: string;
  numberOfItems?: number;
}

// export type ProductAndSizesData = {
//   id: string;
//   name: string;
//   sizes: SizeIdAndNameTuple[];
// };

export type ProductData = {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  gender: ProductGender;
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
}

interface SizeAndNumberOfItemsFormTuple {
  size: SizeIdAndNameTuple;
  numberOfItems: number;
}

interface ItemToAddFormValues {
  productId: string;
  sizeAndNumberOfItemsTuples: SizeAndNumberOfItemsFormTuple[];
}

const AddItemsToPackingList = ({
  onAddEntiresToPackingListForProduct,
  productData,
}: AddItemToPackingProps) => {
  const { register, handleSubmit, control, watch } =
    useForm<ItemToAddFormValues>({
      defaultValues: {
        productId: "",
        sizeAndNumberOfItemsTuples: [],
        // productAndSizesData.map(
        //   (productAndSizesData) => ({
        //     size: productAndSizesData.sizes[0],
        //     numberOfItems: 0,
        //   })
        // ),
      },
    });
  const { fields, replace } = useFieldArray({
    control,
    name: "sizeAndNumberOfItemsTuples",
  });
  const productId = watch("productId");
  const onAddItemClick = useCallback(
    (itemToAddFormValues: ItemToAddFormValues) => {
      const newEntriesForPackingList: PackingListEntriesForProductToAdd = {
        productId: parseInt(itemToAddFormValues.productId),
        sizeIdAndNumberOfItemTuples:
          itemToAddFormValues.sizeAndNumberOfItemsTuples
            .map((tuple) => ({
              sizeId: tuple.size.id,
              numberOfItems: tuple.numberOfItems,
            }))
            .filter((tuple) => tuple.numberOfItems > 0),
      };
      onAddEntiresToPackingListForProduct(newEntriesForPackingList);
    },
    [onAddEntiresToPackingListForProduct]
  );

  console.log("productData");
  console.log(productData);

  // useEffect(() => {
  //   if (productId != null) {
  //     const product = productAndSizesData.find((p) => p.id === productId);
  //     const newSizeAndNumTuples = product?.sizes.map((s) => ({
  //       size: s,
  //       // numberOfItems: s.currentNumberOfItems
  //       // currentNumberOfItems: s
  //     }));
  //     replace(newSizeAndNumTuples || []);
  //   }
  // }, [productId, productAndSizesData, replace]);

  // const productsGroupedByGender = groupBy(
  //   productData,
  //   (product) => product.gender.id
  // );

  // const productsGroupedByCategory = Object.keys(productsGroupedByGender).map(productsForGender => groupBy(productsForGender, (product) => product.));

  // console.log(productsGroupedByGender);

  // list.reduce((previous, currentItem) => {
  //   const group = getKey(currentItem);
  //   if (!previous[group]) previous[group] = [];
  //   previous[group].push(currentItem);
  //   return previous;
  // }, {} as Record<K, T[]>);

  type ProductsForGender = {
    gender: ProductGender;
    products: ProductData[];
  };

  type ProductsForCategory = {
    category: {
      id: string;
      name: string;
    };
    products: ProductData[];
  };

  type ProductsGroupedByCategoryForGender = {
    gender: ProductGender;
    productsForCategory: ProductsForCategory[];
  };

  const productsGroupedByGender: ProductsForGender[] = _.chain(productData)
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
            category: { id: key, name: value[0].category.name },
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
      <Text
        fontSize="xl"
        mb={4}
        borderBottom="1px"
        borderColor="gray.300"
        pb={2}
      >
        Add to / Update Packing List
      </Text>
      <Tabs variant="soft-rounded" colorScheme="green" px="30">
        <TabList>
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <Tab key={productsGroupForGender.gender}>
              {productsGroupForGender.gender}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {productsGroupedByGenderAndCategory.map((productsGroupForGender) => (
            <TabPanel key={productsGroupForGender.gender}>
              <VStack spacing={8}>
                {productsGroupForGender.productsForCategory.map(
                  (productsGroupForCategory) => (
                    <Box key={productsGroupForCategory.category.id}>
                      <Heading fontSize="lg" fontWeight="bold" textAlign={"center"} mb={15}>
                        {productsGroupForCategory.category.name}
                      </Heading>
                      <VStack>
                        {productsGroupForCategory.products.map((product) => (
                          <Checkbox key={product.id} value={product.id}>
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
      {/* <form onSubmit={handleSubmit(onAddItemClick)}>
        <Flex direction="column">
            <FormControl id="productId">
              <Select {...register("productId")} placeholder="Select Product">
                {productAndSizesData?.map((product, i) => (
                  <option value={product.id} key={i}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          <Flex direction="column">
            <Text my={2} fontSize="sm">
              Size and Quantity
            </Text>
            <>
              {fields?.map((size, index) => (
                <Flex
                  mx={4}
                  px={2}
                  my={2}
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  w="auto"
                  key={size.id}
                  _hover={{
                    backgroundColor: "gray.100",
                  }}
                >
                  <Box mr={4} w="25%">
                    {size.size.name}
                  </Box>
                  <Input
                    hidden
                    w={16}
                    // value={size.id}
                    type="number"
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.size.id` as const
                    )}
                  />
                  <Input
                    w={16}
                    type="number"
                    // value={size.numberOfItems}
                    // defaultValue={size.size.currentNumberOfItems}
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.numberOfItems` as const,
                      {
                        valueAsNumber: true,

                        // setValueAs
                      }
                    )}
                  />
                </Flex>
              ))}
            </>
          </Flex>
        </Flex>
      </form> */}
      {/* <Spacer /> */}
      <Button type="submit">Apply</Button>
      {/* <Spacer /> */}
    </Flex>
  );
};

export default AddItemsToPackingList;
