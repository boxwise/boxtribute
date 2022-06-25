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
import { useEffect } from "react";

interface Size {
  id: string;
  name: string;
}

interface sizeAndNumberTuplesSet {
  // sizeId: string;
  size: Size;
  numItems: number;
}

interface AddItemFormValues {
  productId: string;
  sizeAndNumberTuples: sizeAndNumberTuplesSet[];
}

export type ProductData = {
  id: string;
  name: string;
  sizes: Size[];
};

interface AddItemToPackingProps {
  onAddItemClick: () => void;
  addItemFormValues: AddItemFormValues;
  productsData: ProductData[];
}

const AddItemToPacking = ({
  onAddItemClick,
  productsData,
}: AddItemToPackingProps) => {
  const { register, handleSubmit, control, watch } = useForm<AddItemFormValues>(
    {
      defaultValues: {
        productId: "",
        sizeAndNumberTuples: [],
      },
    }
  );
  const { fields, replace } = useFieldArray({
    control,
    name: "sizeAndNumberTuples",
  });
  const productId = watch("productId");

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
            <FormControl
              id="productId"
            >
              <Select
                {...register("productId")}
                placeholder="Select Product"
              >
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
                      `sizeAndNumberTuples.${index}.size.id` as const
                    )}
                  />
                  <Input
                    w={16}
                    type="number"
                    value={size.numItems}
                    {...register(
                      `sizeAndNumberTuples.${index}.numItems` as const
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

export default AddItemToPacking;
