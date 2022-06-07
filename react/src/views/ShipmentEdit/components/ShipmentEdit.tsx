import {
    Box,
    List,
    ListItem,
    Button,
    Text,
    FormControl,
    FormErrorMessage,
    FormLabel,
  } from "@chakra-ui/react";
  import { Select, OptionBase } from "chakra-react-select";
  
//   import {
//     BoxByLabelIdentifierAndAllProductsQuery,
//     UpdateLocationOfBoxMutation,
//   } from "types/generated/graphql";
//   import { Controller, useForm } from "react-hook-form";
  
 
  
//   export interface ShipmentFormValues {
//     size?: string | null;
//     productForDropdown: OptionsGroup;
//     sizeForDropdown?: OptionsGroup;
//   }
  
//   interface ShipmentEditProps {
//     boxData:
//       | BoxByLabelIdentifierAndAllProductsQuery["box"]
//       | UpdateLocationOfBoxMutation["updateBox"];
//     allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"]["elements"];
//     onSubmitBoxEditForm: (shipmentFormValues: ShipmentFormValues) => void;
//   }
  
  const ShipmentEdit = () => {
//     boxData,
//     allProducts,
//     onSubmitBoxEditForm,
//   }: ShipmentEditProps) => {

  
//     const {
//       handleSubmit,
//       control,
//       formState: { isSubmitting },
//     } = useForm<ShipmentFormValues>({
//       defaultValues: {
//         size: boxData?.size,
//         productForDropdown: productsForDropdownGroups
//           ?.flatMap((i) => i.options)
//           .find((p) => p.value === boxData?.product?.id),
//       },
//     });
  
//     if (boxData == null) {
//       console.error("BoxDetails Component: boxData is null");
//       return <Box>No data found for a box with this id</Box>;
//     }
  
//     if (productsForDropdownGroups == null) {
//       console.error("BoxDetails Component: allProducts is null");
      // return (
//         <Box>
//           There was an error: the available products to choose from couldn't be
//           loaded!
//         </Box>
//       );
//     }
  
    return (
      <Box>
        <Text
          fontSize={{ base: "16px", lg: "18px" }}
          fontWeight={"500"}
          textTransform={"uppercase"}
          mb={"4"}
        > 
          Shipment Edit View
        </Text>
        <Button>Scan the Boxes for Shipment</Button>
  
{/* //         <form onSubmit={handleSubmit(onSubmitBoxEditForm)}>
//           <List spacing={2}>
//             <ListItem>
//               <Text as={"span"} fontWeight={"bold"}>
//                 Box Label:
//               </Text>{" "}
//               {boxData.labelIdentifier}
//             </ListItem>
//             <ListItem>
//               <Text as={"span"} fontWeight={"bold"}>
//                 Location:
//               </Text>{" "}
//               {boxData.location?.name}
//             </ListItem>
  
//             <ListItem> */}
{/* //               <Controller */}
{/* //                 control={control}
//                 name="productForDropdown"
//                 render={({ */}
{/* //                   field: { onChange, onBlur, value, name, ref },
//                   fieldState: { invalid, error },
//                 }) => (
//                   <FormControl py={4} isInvalid={invalid} id="products">
//                     <FormLabel>Product</FormLabel>
  
//                     <Select */}
{/* //                       name={name}
//                       ref={ref}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       value={value}
//                       options={productsForDropdownGroups}
//                       placeholder="Product"
//                       isSearchable
//                     />
  
//                     <FormErrorMessage>{error && error.message}</FormErrorMessage>
//                   </FormControl> */}
{/* //                 )}
//               />
//             </ListItem> */}
  
{/* //             <ListItem>
//               <Text as={"span"} fontWeight={"bold"}>
//                 Items:
//               </Text>{" "}
//               {boxData.items}
//             </ListItem>
//           </List> */}
{/* //           <Button */}
{/* //             mt={4}
//             colorScheme="teal"
//             isLoading={isSubmitting}
//             type="submit"
//           >
//             Update Box
//           </Button> 
//         </form>*/}
      </Box>
    )
  };
  
  export default ShipmentEdit;