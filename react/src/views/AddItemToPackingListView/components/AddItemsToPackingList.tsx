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

interface SizeIdAndNameTuple {
  id: string;
  name: string;
}
interface SizeAndNumberOfItemsFormTuple {
  size: SizeIdAndNameTuple;
  numberOfItemsAsString: string;
}

interface ItemToAddFormValues {
  productId: string;
  sizeAndNumberOfItemsTuples: SizeAndNumberOfItemsFormTuple[];
}

export type ProductData = {
  id: string;
  name: string;
  sizes: SizeIdAndNameTuple[];
};

export interface SizeIdAndNumberOfItemTuple {
  sizeId: string;
  numberOfItems: number;
}
export interface PackingListEntriesForProductToAdd {
  productId: string;
  sizeIdAndNumberOfItemTuples: SizeIdAndNumberOfItemTuple[];
}
interface AddItemToPackingProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProductToAdd
  ) => void;
  productsData: ProductData[];
}

const AddItemsToPackingList = ({
  onAddEntiresToPackingListForProduct,
  productsData,
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
        productId: itemToAddFormValues.productId,
        sizeIdAndNumberOfItemTuples:
          itemToAddFormValues.sizeAndNumberOfItemsTuples
          .map(tuple => ({
            size: tuple.size,
            numberOfItemsAsString: parseInt(tuple.numberOfItemsAsString),
          }))
          .filter(tuple => tuple.numberOfItemsAsString > 0)
          .map((tuple) => ({
            sizeId: tuple.size.id,
            numberOfItems: tuple.numberOfItemsAsString,
          })),
      };
      onAddEntiresToPackingListForProduct(newEntriesForPackingList);
    },
    [onAddEntiresToPackingListForProduct]
  );

  useEffect(() => {
    if (productId != null) {
      const product = productsData.find((p) => p.id === productId);
      const newSizeAndNumTuples = product?.sizes.map((s) => ({
        size: s,
      }));
      replace(newSizeAndNumTuples || []);
    }
  }, [productId, productsData, replace]);

  return (
    <Box>
      <Text
        fontSize="xl"
        mb={4}
        borderBottom="1px"
        borderColor="gray.300"
        pb={2}
      >
        Add New Items
      </Text>
      <form onSubmit={handleSubmit(onAddItemClick)}>
        <Flex direction="column" spacing="30px">
          <WrapItem>
            <FormControl id="productId">
              <Select {...register("productId")} placeholder="Select Product">
                {productsData?.map((product, i) => (
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
                  my={2}
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  key={size.id}
                >
                  <Box mr={4} w={6}>
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
