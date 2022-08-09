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
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { groupBy } from "utils/helpers";
import { ProductGender } from "types/generated/graphql";

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

  debugger;
  const productsGroupedByGender: ProductsForGender[] = productData.reduce(
    (acc, curr) => {
      console.log("acc");
      console.log(acc);
      console.log("curr");
      console.log(curr);
      // const groupForCurrentGender = acc.find(el => el.gender.id === curr.gender.id);
      debugger;
      const groupForCurrentGender = acc.find(
        (el) => el.gender === curr.gender
      );
      const otherGroupsThanForCurrentGender = acc.filter(
        (el) => el.gender !== curr.gender
      );
      let newGroupForCurrentGender;
      if (groupForCurrentGender) {
        newGroupForCurrentGender = [...groupForCurrentGender.products, curr];
      } else {
        newGroupForCurrentGender = {
          gender: curr.gender,
          products: [curr],
        };
      }
      // return [...acc];
      return [...otherGroupsThanForCurrentGender, newGroupForCurrentGender];
    },
    [] as ProductsForGender[]
  );

  return (
    <Box>
      {/* productData: {JSON.stringify(productData)} */}
      {/* productsGroupedByGender: {JSON.stringify(productsGroupedByGender)} */}
      <Text
        fontSize="xl"
        mb={4}
        borderBottom="1px"
        borderColor="gray.300"
        pb={2}
      >
        Add to / Update Packing List
      </Text>
      <Tabs>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={5} direction="row">
              <Checkbox>Checkbox</Checkbox>
              <Checkbox defaultChecked>Checkbox</Checkbox>
            </VStack>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
          <TabPanel>
            <p>three!</p>
          </TabPanel>
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
            <Button type="submit">Add to Packing List</Button>
        </Flex>
      </form> */}
    </Box>
  );
};

export default AddItemsToPackingList;
