import { Button, Flex, FormControl, Select, Wrap, WrapItem, Box, Input, Text} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
// import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { number } from "prop-types";
import { ProductGender } from "types/generated/graphql";
import { useEffect, useState } from "react";
// import { DevTool } from "@hookform/devtools";

interface SizeAndNumberSet {
    sizeId: string,
    numItems: number
}

interface AddItemFormValues {
    name: string;
    sizeAndNumber: SizeAndNumberSet[];
    productId: string;
}

// interface AddItemFormData {
//   gender: ProductGender;
//   name: string;
//   sizeAndNumber: SizeAndNumberSet[];
//   productId: string;
// }

export type ProductData = {
  id: string
  name: string
  sizes: string[]
}


interface AddItemToPackingProps {
    onAddItemClick: () => void;
    addItemFormValues: AddItemFormValues;
    productsData: ProductData[];
}

    
const AddItemToPacking = ({addItemFormValues, onAddItemClick, productsData}: AddItemToPackingProps) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductData>();

    // useEffect(() => {
    //     if (selectedCategory != null)
    //       gender({ variables: { category: selectedCategory } });
    //   }, [gender, selectedCategory]);

    const {
        register,
        handleSubmit,
        // formState: { errors },
      } = useForm<AddItemFormValues>({
        defaultValues: {
          productId: "",
          sizeAndNumber: []
        },
      });
    const onAddSizeAndNumberSet = () => {
        console.log("add size and number")
    }
    const onProductDropdownChange = (e: React.FormEvent<HTMLSelectElement>): void => {
            const newSelectedProduct = (e.target as HTMLInputElement).value;
            const filteredProduct = productsData.find(product => product.id === newSelectedProduct)
            setSelectedProduct(filteredProduct);
          };
    
    return (
      <Box>
        <Text fontSize='xl' mb={4} borderBottom="1px" borderColor="gray.300" pb={2}>Add New Items</Text>
        <form onSubmit={handleSubmit(onAddItemClick)}>
        <Flex direction="column" spacing="30px">
          <WrapItem >
            <FormControl
              id="productId"
              // isInvalid={errors.targetOrganisationId}
            >
              <Select
                {...register("productId")}
                placeholder="Select Product"
                onChange={onProductDropdownChange}
              >
                {productsData?.map((product) => (
                    <option value={product.id}>{product.name}</option>
                  ))}
              </Select>
            </FormControl>
          </WrapItem>
          <Flex direction="column">
            <Text my={2} fontSize='sm' >Size and Quantity</Text>
            {selectedProduct?.sizes.map((size)=>
            <Flex mx={4} my={2} direction="row" justify='flex-start' alignItems='center'>
              <Box mr={4} w={6}>{size}</Box>
              <Input w={16} type="number"
            {...register("sizeAndNumber")}
          />
            </Flex>
            
            )}
            {/* <FormControl id="">
              <Select
                {...register("sizeAndNumber")}
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
    )
}

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

 

