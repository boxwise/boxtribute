import {
  Box,
  Button,
  FormControl,
  Select,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  TransferAgreementByIdQuery,
  TransferAgreementForShipmentsByIdQuery,
  TransferAgreementForShipmentsByIdQueryVariables,
  ShipmentCreationInput,
} from "types/generated/graphql";
import { BoxFormValues } from "views/BoxEdit/components/BoxEdit";
import { DevTool } from "@hookform/devtools";

export interface CreateShipmentFormValues {
  sourceBaseId: string;
  targetBaseId: string;
  // transferAgreementId: string;
}

interface CreateShipmentFormProps {
  createShipmentViewData: TransferAgreementForShipmentsByIdQuery["transferAgreement"];
  onSubmitCreateShipment: (
    createShipmentViewValues: CreateShipmentFormValues
  ) => void;
}

const CreateShipmentForm = ({
  createShipmentViewData,
  onSubmitCreateShipment,
}: CreateShipmentFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    register
  } = useForm<CreateShipmentFormValues>({
    defaultValues: {
      sourceBaseId: "",
      targetBaseId: "",
      // transferAgreementId: "",
    },
  });

  if (createShipmentViewData == null) {
    console.error("Create Shipment Form: createShipmentViewData is null");
    return <Box>No data found for that transfer agreement id</Box>;
  }
  return (
    <Wrap spacing={"2"}>
      <WrapItem
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Create New Shipment
      </WrapItem>
      <form onSubmit={handleSubmit(onSubmitCreateShipment)}>
        <WrapItem>
          <FormControl
            id="sourceBaseId"
            // isInvalid={errors.targetOrganisationId}
          >
            <Select
              {...register("sourceBaseId")}
              placeholder="Select source base"
            >
              {createShipmentViewData.sourceBases?.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <FormControl
            id="targetBaseId"
            // isInvalid={errors.targetOrganisationId}
          >
            <Select
              {...register("targetBaseId")}
              placeholder="Select target base"
            >
              {createShipmentViewData?.targetBases?.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
            Create new shipment
          </Button>
        </WrapItem>

        <DevTool control={control} />
      </form>
    </Wrap>
  );
};

export default CreateShipmentForm;

// import { useForm } from "react-hook-form";
// import { gql, useQuery, useLazyQuery, useMutation } from "@apollo/client";
// import {
//   BasesForOrganisationsQuery,
//   BasesForOrganisationsQueryVariables,
//   CreateTransferAgreementMutation,
//   CreateTransferAgreementMutationVariables,
//   OrganisationsQuery,
//   TransferAgreementCreationInput,
//   TransferAgreementType,
// } from "types/generated/graphql";

// import {
//   FormControl,
//   Button,
//   Select,
//   Wrap,
//   WrapItem,
//   useToast,
// } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import DatePicker from "views/Boxes/components/DatePicker";
// import { useNavigate, useParams } from "react-router-dom";

// export const ORGANISATIONS_QUERY = gql`
//   query Organisations {
//     organisations {
//       id
//       name
//     }
//   }
// `;

// export const BASES_ORGANISATIONS_QUERY = gql`
//   query BasesForOrganisations($organisationId: ID!) {
//     organisation(id: $organisationId) {
//       id
//       name
//       bases {
//         id
//         name
//       }
//     }
//   }
// `;

// export const CREATE_TRANSFER_AGREEMENT_MUTATION = gql`
//   mutation CreateTransferAgreement(
//     $creationInput: TransferAgreementCreationInput!
//   ) {
//     createTransferAgreement(creationInput: $creationInput) {
//       id
//     }
//   }
// `;

// export interface TransferAgreementFormValues {
//   targetOrganisationId: string;
//   targetBasesIds: string[];
//   transferType: string;
// }

// const TransferAgreement = () => {
//   const [basesForOrganisations, { data: basesdata }] = useLazyQuery<
//     BasesForOrganisationsQuery,
//     BasesForOrganisationsQueryVariables
//   >(BASES_ORGANISATIONS_QUERY);

//   const navigate = useNavigate();
//   const baseId = useParams<{ baseId: string }>().baseId!;

//   const [createTransferAgreement, mutationStatus] = useMutation<
//     CreateTransferAgreementMutation,
//     CreateTransferAgreementMutationVariables
//   >(CREATE_TRANSFER_AGREEMENT_MUTATION);

//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm<TransferAgreementFormValues>({
//     defaultValues: {
//       targetOrganisationId: "",
//       targetBasesIds: [],
//       transferType: "",
//     },
//   });

//   const [selectOrgId, setSelectedOrgId] = useState<string>();
//   // const [submittedVal, setSubmittedVal] = useState();

//   // const toast = useToast();

//   useEffect(() => {
//     if (selectOrgId != null)
//       basesForOrganisations({ variables: { organisationId: selectOrgId } });
//   }, [basesForOrganisations, selectOrgId]);

//   useEffect(() => {
//     mutationStatus?.data?.createTransferAgreement?.id &&
//       navigate(
//         `/bases/${baseId}/transfers/${mutationStatus?.data?.createTransferAgreement?.id}`
//       );
//     // toast({
//     //   title: "Account created.",
//     //   description: "We've created your account for you.",
//     //   status: "success",
//     //   duration: 9000,
//     //   isClosable: true,
//     // });
//   }, [mutationStatus, navigate, baseId]);

//   const { loading, error, data } =
//     useQuery<OrganisationsQuery>(ORGANISATIONS_QUERY);
//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   if (error) {
//     return <div>Error: {JSON.stringify(error)}</div>;
//   }

//   if (mutationStatus.loading) {
//     return <div>Creating transfer agreement...</div>;
//   }
//   if (mutationStatus.error) {
//     return <div>Error: {JSON.stringify(mutationStatus.error)}</div>;
//   }

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

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <Wrap spacing="30px">
//         <WrapItem>
//           <FormControl
//             id="targetOrganisationId"
//             // isInvalid={errors.targetOrganisationId}
//           >
//             <Select
//               {...register("targetOrganisationId")}
//               placeholder="Select Organisation"
//               onChange={onOrgDropdownChange}
//             >
//               {data?.organisations?.map((org) => (
//                 <option value={org.id}>{org.name}</option>
//               ))}
//             </Select>
//           </FormControl>
//         </WrapItem>
//         <WrapItem>
//           <FormControl id="targetBasesIds">
//             <Select
//               {...register("targetBasesIds")}
//               ismulti
//               placeholder="Select bases"
//             >
//               {basesdata?.organisation?.bases?.map((option) => (
//                 <option value={option.id}>{option.name}</option>
//               ))}
//             </Select>
//           </FormControl>
//         </WrapItem>
//         <WrapItem>
//           <FormControl id="transferType">
//             <Select
//               {...register("transferType")}
//               placeholder="Select transfer type"
//             >
//               <option>Unidirectional</option>
//               <option>Bidirectional</option>
//             </Select>
//           </FormControl>
//         </WrapItem>
//         <WrapItem>
//           <DatePicker />
//         </WrapItem>
//         <WrapItem>
//           <DatePicker />
//         </WrapItem>
//         <WrapItem>
//           <Button type="submit">Submit</Button>
//         </WrapItem>
//       </Wrap>
//     </form>
//   );
// };

// export default TransferAgreement;
