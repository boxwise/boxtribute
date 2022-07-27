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
import { SizeIdAndNameTuple, PackingListEntriesForProduct, ProductAndSizesData } from "./AddItemsToPackingListContainer";

interface SizeAndNumberOfItemsFormTuple {
  size: SizeIdAndNameTuple;
  numberOfItemsAsString: string;
}

interface ItemToAddFormValues {
  productId: string;
  sizeAndNumberOfItemsTuples: SizeAndNumberOfItemsFormTuple[];
}


interface AddItemToPackingProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProduct
  ) => void;
  productAndSizesData: ProductAndSizesData[];
  // currentPackingListEntries: PackingListEntriesForProduct[];
}

const AddItemsToPackingList = ({
  onAddEntiresToPackingListForProduct,
  productAndSizesData,
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
      const newEntriesForPackingList: PackingListEntriesForProduct = {
        productId: parseInt(itemToAddFormValues.productId),
        sizeIdAndNumberOfItemTuples:
          itemToAddFormValues.sizeAndNumberOfItemsTuples
          .map(tuple => ({
            sizeId: tuple.size.id,
            numberOfItems: parseInt(tuple.numberOfItemsAsString),
          }))
          .filter(tuple => tuple.numberOfItems > 0)
      };
      onAddEntiresToPackingListForProduct(newEntriesForPackingList);
    },
    [onAddEntiresToPackingListForProduct]
  );

  useEffect(() => {
    if (productId != null) {
      const product = productAndSizesData.find((p) => p.id === productId);
      const newSizeAndNumTuples = product?.sizes.map((s) => ({
        size: s,
      }));
      replace(newSizeAndNumTuples || []);
    }
  }, [productId, productAndSizesData, replace]);

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
                {productAndSizesData?.map((product, i) => (
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
                    {size.size.name}
                  </Box>
                  <Input
                    hidden
                    w={16}
                    value={size.id}
                    type="number"
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.size.id` as const
                    )}
                  />
                  <Input
                    w={16}
                    type="number"
                    value={size.numberOfItemsAsString}
                    {...register(
                      `sizeAndNumberOfItemsTuples.${index}.numberOfItemsAsString` as const
                    )}
                  />
                </Flex>
              ))}
            </>
          </Flex>
          <WrapItem mt={4}>
            <Button type="submit">Add to Packing List</Button>
          </WrapItem>
        </Flex>
      </form>
    </Box>
  );
};

export default AddItemsToPackingList;
