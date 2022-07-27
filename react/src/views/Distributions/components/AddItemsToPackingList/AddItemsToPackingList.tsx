import {
  Button,
  Flex,
  FormControl,
  Select,
  WrapItem,
  Box,
  Input,
  Text,
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { SizeIdAndNameTupleWithTargetNumberOfItems as SizeIdAndNameTupleWithCurrentTargetNumberOfItems, PackingListEntriesForProductToAdd, ProductAndSizesDataWithTargetNumberOfItems } from "./AddItemsToPackingListContainer";

// interface SizeAndNumberOfItemsFormTuple {
//   sizeIdAndNameTupleWithCurrentTargetNumberOfItems: SizeIdAndNameTupleWithCurrentTargetNumberOfItems;
//   // targetNumberOfItems: number;
// }

interface ItemToAddFormValues {
  productId: string;
  sizeAndNumberOfItemsTuples: SizeIdAndNameTupleWithCurrentTargetNumberOfItems[];
}


interface AddItemToPackingProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProductToAdd
  ) => void;
  productAndSizesDataWithTargetNumberOfItems: ProductAndSizesDataWithTargetNumberOfItems[];
  // currentPackingListEntries: PackingListEntriesForProduct[];
}

const AddItemsToPackingList = ({
  onAddEntiresToPackingListForProduct,
  productAndSizesDataWithTargetNumberOfItems,
}: AddItemToPackingProps) => {
  const { register, handleSubmit, control, watch } =
    useForm<ItemToAddFormValues>({
      defaultValues: {
        productId: "",
        sizeAndNumberOfItemsTuples: [],
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
          .map(tuple => ({
            sizeId: tuple.id,
            targetNumberOfItems: tuple.targetNumberOfItems,
          }))
          .filter(tuple => tuple.targetNumberOfItems > 0)
      };
      onAddEntiresToPackingListForProduct(newEntriesForPackingList);
    },
    [onAddEntiresToPackingListForProduct]
  );

  useEffect(() => {
    if (productId != null) {
      const product = productAndSizesDataWithTargetNumberOfItems.find((p) => p.id === productId);
      const newSizeAndNumTuples = product?.sizesWithTargetNumberOfItems;
      // .map((s) => ({
      //   size: s,
      // }));
      replace(newSizeAndNumTuples || []);
    }
  }, [productId, productAndSizesDataWithTargetNumberOfItems, replace]);

  return (
    <Box>
      <Text
        fontSize="xl"
        mb={4}
        borderBottom="1px"
        borderColor="gray.300"
        pb={2}
      >
        Add to / Update Packing List
      </Text>
      <form onSubmit={handleSubmit(onAddItemClick)}>
        <Flex direction="column">
          <WrapItem>
            <FormControl id="productId">
              <Select {...register("productId")} placeholder="Select Product">
                {productAndSizesDataWithTargetNumberOfItems?.map((product, i) => (
                  <option value={product.id} key={i}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </WrapItem>
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
                  <Box mr={4} w='25%'>
                    {size.name}
                  </Box>
                  <Input
                    hidden
                    w={16}
                    value={size.id}
                    type="number"
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.id` as const
                    )}
                  />
                  <Input
                    w={16}
                    type="number"
                    value={size.targetNumberOfItems}
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.targetNumberOfItems` as const,
                      {
                        valueAsNumber: true,
                      }
                    )}
                  />
                </Flex>
              ))}
            </>
          </Flex>
          <WrapItem mt={4}>
            <Button type="submit">Add to / Update Packing List</Button>
          </WrapItem>
        </Flex>
      </form>
    </Box>
  );
};

export default AddItemsToPackingList;
