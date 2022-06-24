import {
  Button,
  Flex,
  FormControl,
  Select,
  Wrap,
  WrapItem,
  Box,
  Input,
  Text,
} from "@chakra-ui/react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
// import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { number } from "prop-types";
import { ProductGender } from "types/generated/graphql";
import { useEffect, useState } from "react";
// import { DevTool } from "@hookform/devtools";

interface sizeAndNumberTuplesSet {
  sizeId: string;
  numItems: number;
}

interface AddItemFormValues {
  // name: string;
  sizeAndNumberTuples: sizeAndNumberTuplesSet[];
  productId: string;
}

// interface AddItemFormData {
//   gender: ProductGender;
//   name: string;
//   sizeAndNumberTuples: sizeAndNumberTuplesSet[];
//   productId: string;
// }

interface Size {
  id: string;
  name: string;
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
  addItemFormValues,
  // onAddItemClick,
  productsData,
}: AddItemToPackingProps) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductData>();

  // useEffect(() => {
  //     if (selectedCategory != null)
  //       gender({ variables: { category: selectedCategory } });
  //   }, [gender, selectedCategory]);

  const onAddItemClick = (foo) => console.log("foo: ", foo);

  const {
    register,
    handleSubmit,
    control,
    watch,
    // formState: { errors },
  } = useForm<AddItemFormValues>({
    defaultValues: {
      productId: "",
      sizeAndNumberTuples: [],
    },
  });
  // const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
  //   {
  //     control, // control props comes from useForm (optional: if you are using FormContext)
  //     name: "sizeAndNumberTuples", // unique name for your Field Array
  //   }
  // );

  // const FOO = useWatch("productId", (productId) => {
  //   return productId;
  // });

  // const FOO = watch("productId");

  const onAddsizeAndNumberTuplesSet = () => {
    console.log("add size and number");
  };
  const onProductDropdownChange = (
    e: React.FormEvent<HTMLSelectElement>
  ): void => {
    const newSelectedProduct = (e.target as HTMLInputElement).value;
    const filteredProduct = productsData.find(
      (product) => product.id === newSelectedProduct
    );
    setSelectedProduct(filteredProduct);
  };

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
              // isInvalid={errors.targetOrganisationId}
            >
              <Select
                {...register("productId")}
                placeholder="Select Product"
                onChange={onProductDropdownChange}
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
              {selectedProduct?.sizes.map((size, index) => (
                <Flex
                  mx={4}
                  my={2}
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                >
                  <Box mr={4} w={6}>
                    {size.name}
                  </Box>
                  <Input
                    hidden
                    w={16}
                    value={size.id}
                    type="number"
                    {...register(
                      `sizeAndNumberTuples.${index}.sizeId` as const
                    )}
                  />
                  <Input
                    w={16}
                    type="number"
                    {...register(
                      `sizeAndNumberTuples.${index}.numItems` as const
                    )}
                  />
                </Flex>
              ))}
            </>

            {/* <Controller
              name="sizeAndNumberTuples"
              control={control}
              render={(props) => {
                return (

                );
              }}
            /> */}

            {/* <FormControl id="">
              <Select
                {...register("sizeAndNumberTuples")}
                placeholder="Select size and number"
              >
                <option>Unidirectional</option>
                <option>Bidirectional</option>
              </Select>
            </FormControl> */}
          </Flex>
          <WrapItem mt={4}>
            <Button type="submit">Add to Packing List</Button>
          </WrapItem>
        </Flex>
        {/* <DevTool control={control} /> */}
      </form>
    </Box>
  );
};

export default AddItemToPacking;

//   const navigate = useNavigate();
//   const baseId = useParams<{ baseId: string }>().baseId!;
//   const { globalPreferences } = useContext(GlobalPreferencesContext);

//   const [createTransferAgreement, mutationStatus] = useMutation<
//     CreateTransferAgreementMutation,
//     CreateTransferAgreementMutationVariables
//   >(CREATE_TRANSFER_AGREEMENT_MUTATION);

// const [submittedVal, setSubmittedVal] = useState();
// const toast = useToast();

////////////NAVIGATE/////////////

//   useEffect(() => {
//     mutationStatus?.data?.createTransferAgreement?.id &&
//       navigate(
//         `/bases/${baseId}/transfers/${mutationStatus?.data?.createTransferAgreement?.id}`
//       );
//   }, [mutationStatus, navigate, baseId]);

////////ONDROPDOWNCHANGE/////////
//   const onOrgDropdownChange = (e: React.FormEvent<HTMLSelectElement>): void => {
//     const newSelectedOrgId = (e.target as HTMLInputElement).value;
//     setSelectedOrgId(newSelectedOrgId);
//     console.log("newSelectedOrgId", newSelectedOrgId);
//   };

//   const onSubmit = (data: TransferAgreementFormValues) => {
//     // setSubmittedVal(data);
//     const creationInput: TransferAgreementCreationInput = {
//       targetOrganisationId: parseInt(data.targetOrganisationId),
//       type: TransferAgreementType[data.transferType],
//     };
//     createTransferAgreement({ variables: { creationInput } });
//     console.log(data);
//   };
