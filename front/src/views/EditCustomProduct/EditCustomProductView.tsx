import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { NonNullProductGender } from "../../../../graphql/types";
// TODO: move this to common folder in components?
import {
  customProductRawToFormOptionsTransformer,
  findDefaultValues,
} from "views/CreateCustomProduct/components/transformer";
import EditCustomProductForm, {
  EditCustomProductFormOutput,
} from "./components/EditCustomProductForm";
import { CUSTOM_PRODUCT_FORM_OPTIONS_QUERY } from "queries/queries";

const editCustomProductQueryErrorText = "Something went wrong! Please try reloading the page.";

const EDIT_CUSTOM_PRODUCT_MUTATION = graphql(
  `
    mutation EditCustomProduct(
      $id: ID!
      $name: String!
      $categoryId: Int!
      $sizeRangeId: Int!
      $gender: ProductGender!
      $price: Int
      $inShop: Boolean
      $comment: String
    ) {
      editCustomProduct(
        editInput: {
          id: $id
          name: $name
          categoryId: $categoryId
          sizeRangeId: $sizeRangeId
          gender: $gender
          price: $price
          inShop: $inShop
          comment: $comment
        }
      ) {
        __typename
        ... on Product {
          id
          name
          category {
            id
            name
          }
          sizeRange {
            id
            label
          }
          gender
          price
          inShop
          comment
        }
      }
    }
  `,
  [],
);

const editCustomProductErrorToastText = "Could not edit this custom product! Try again?";

function EditCustomProductFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const customProductId = useParams<{ customProductId: string }>().customProductId;
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { data: customProductFormRawOptions, error } = useSuspenseQuery(
    CUSTOM_PRODUCT_FORM_OPTIONS_QUERY,
  );

  const { data: productsRawData, error: prodError } = useSuspenseQuery(PRODUCTS_QUERY, {
    variables: {
      baseId,
    },
  });

  const [editCustomProduct, { loading: isEditCustomProductLoading }] = useMutation(
    EDIT_CUSTOM_PRODUCT_MUTATION,
  );

  const onSubmit = useCallback(
    (editProductFormOutput: EditCustomProductFormOutput) => {
      editCustomProduct({
        variables: {
          id: customProductId!,
          name: editProductFormOutput.name,
          categoryId: parseInt(editProductFormOutput.category?.value!),
          sizeRangeId: parseInt(editProductFormOutput.sizeRange?.value!),
          gender: editProductFormOutput.gender?.value as NonNullProductGender,
          price: editProductFormOutput.price,
          inShop: editProductFormOutput.inShop,
          comment: editProductFormOutput.comment,
        },
      })
        .then(({ data }) => {
          const result = data?.editCustomProduct;
          if (!result) {
            triggerError({
              message: editCustomProductErrorToastText,
            });
            return;
          }

          switch (result.__typename) {
            case "Product":
              createToast({
                message: `The custom product was successfully edited.`,
              });
              navigate(`../..`);

              break;
            case "InsufficientPermissionError":
            case "UnauthorizedForBaseError":
              triggerError({
                message: "You don't have permission to edit a custom product!",
              });
              break;
            case "InvalidPriceError":
              triggerError({
                message: "Price must be a positive integer number.",
              });
              break;
            case "EmptyNameError":
              triggerError({
                message: "The name of the product cannot be empty.",
              });
              break;
            case "ResourceDoesNotExistError":
              triggerError({
                message: "The selected options do not exist.",
              });
              break;

            default:
              triggerError({
                message: editCustomProductErrorToastText,
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: editCustomProductErrorToastText,
          });
        });
    },
    [editCustomProduct, customProductId, triggerError, createToast, navigate],
  );

  // If Apollo encountered an error (like network error), throw it
  if (error) throw error;
  if (prodError) throw prodError;

  const { categoryOptions, sizeRangeOptions, genderOptions } =
    customProductRawToFormOptionsTransformer(customProductFormRawOptions);

  const defaultValues = findDefaultValues(productsRawData, customProductId);

  return (
    <EditCustomProductForm
      categoryOptions={categoryOptions}
      sizeRangeOptions={sizeRangeOptions}
      genderOptions={genderOptions}
      onSubmit={onSubmit}
      isLoading={isEditCustomProductLoading}
      defaultValues={defaultValues}
    />
  );
}

function EditCustomProductView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath="../.." />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Edit Custom Product
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || editCustomProductQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <EditCustomProductFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default EditCustomProductView;
