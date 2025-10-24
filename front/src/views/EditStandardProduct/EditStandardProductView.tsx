import { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useSuspenseQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";
import { ErrorBoundary } from "@sentry/react";
import { Box, Center, Heading } from "@chakra-ui/react";

import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { graphql } from "../../../../graphql/graphql";
import { AlertWithoutAction } from "components/Alerts";
import { FormSkeleton } from "components/Skeletons";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useNotification } from "hooks/useNotification";
import { useErrorHandling } from "hooks/useErrorHandling";
import {
  findDefaultValues,
  standardProductRawToFormDataTransformer,
} from "views/EnableStandardProduct/components/transformer";
import EditStandardProductForm, {
  EditStandardProductFormOutput,
} from "./components/EditStandardProductForm";
import { STANDARD_PRODUCT_QUERY } from "queries/queries";

export const StandardProductQueryErrorText =
  "Could not fetch ASSORT standard data! Please try reloading the page.";

export const EDIT_STANDARD_PRODUCT_MUTATION = graphql(
  `
    mutation EditStandardProductMutation(
      $id: ID!
      $comment: String
      $inShop: Boolean
      $price: Int
    ) {
      editStandardProductInstantiation(
        editInput: { id: $id, comment: $comment, inShop: $inShop, price: $price }
      ) {
        __typename
        ... on Product {
          id
          type
          standardProduct {
            id
          }
          comment
          inShop
          price
          lastModifiedOn
          lastModifiedBy {
            id
            name
          }
        }
      }
    }
  `,
  [],
);

function EditStandardProductFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const requestedStandardProductId = useParams<{ standardProductId: string }>().standardProductId;
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { data: standardProductsRawData, error } = useSuspenseQuery(STANDARD_PRODUCT_QUERY, {
    variables: { baseId },
  });

  const [editStandardProduct, { loading: isEditStandardProductLoading }] = useMutation(
    EDIT_STANDARD_PRODUCT_MUTATION,
  );

  const onSubmit = useCallback(
    (editStandardProductFormOutput: EditStandardProductFormOutput) => {
      editStandardProduct({
        variables: {
          id: editStandardProductFormOutput.instantiation.value,
          comment: editStandardProductFormOutput.comment,
          price: editStandardProductFormOutput.price,
          inShop: editStandardProductFormOutput.inShop,
        },
      })
        .then(({ data }) => {
          const result = data?.editStandardProductInstantiation;
          if (!result) return;

          switch (result.__typename) {
            case "Product":
              createToast({
                message: `The ASSORT standard product was successfully edited.`,
              });
              navigate(`../../../`);

              break;
            case "InsufficientPermissionError":
              triggerError({
                message: "You don't have permission to edit this ASSORT standard product!",
              });
              break;
            case "InvalidPriceError":
              triggerError({
                message: "Price must be a positive integer number.",
              });
              break;
            default:
              triggerError({
                message: "Could not edit this ASSORT standard product! Try again?",
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: "Could not edit this ASSORT standard product! Try again?",
          });
        });
    },
    [editStandardProduct, createToast, navigate, triggerError],
  );

  // If Apollo encountered an error (like network error), throw it
  if (error) throw error;

  // Otherwise, data is now loaded (Suspense has ended), but there could be errors returned in the data
  if (
    !standardProductsRawData ||
    standardProductsRawData.standardProducts?.__typename !== "StandardProductPage"
  ) {
    throw new Error(StandardProductQueryErrorText);
  }

  const standardProductData = standardProductRawToFormDataTransformer(standardProductsRawData);

  const defaultValues = findDefaultValues(standardProductData, requestedStandardProductId);

  return (
    <EditStandardProductForm
      standardProductData={standardProductData}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isEditStandardProductLoading}
      showAlert={false}
      key={requestedStandardProductId}
    />
  );
}

function EditStandardProductView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath="../../../" />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Edit Standard Product
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || StandardProductQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <EditStandardProductFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default EditStandardProductView;
