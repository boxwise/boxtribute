import { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { useAtomValue } from "jotai";
import { ErrorBoundary } from "@sentry/react";
import { Box, Center, Heading } from "@chakra-ui/react";

import { graphql } from "../../../../graphql/graphql";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import EnableStandardProductForm, {
  EnableStandardProductFormOutput,
} from "./components/EnableStandardProductForm";
import { AlertWithoutAction } from "components/Alerts";
import { FormSkeleton } from "components/Skeletons";
import {
  findDefaultValues,
  standardProductRawToFormDataTransformer,
} from "./components/transformer";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useNotification } from "hooks/useNotification";
import { useErrorHandling } from "hooks/useErrorHandling";
import { STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY } from "views/Products/components/StandardProductsContainer";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { STANDARD_PRODUCT_QUERY } from "queries/queries";

export const enableStandardProductQueryErrorText =
  "Could not fetch ASSORT standard data! Please try reloading the page.";

export const ENABLE_STANDARD_PRODUCT_MUTATION = graphql(`
  mutation EnableStandardProductMutation(
    $baseId: Int!
    $standardProductId: Int!
    $comment: String
    $inShop: Boolean
    $price: Int
  ) {
    enableStandardProduct(
      enableInput: {
        baseId: $baseId
        standardProductId: $standardProductId
        comment: $comment
        inShop: $inShop
        price: $price
      }
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
        createdOn
        createdBy {
          id
          name
        }
      }
    }
  }
`);

function EnableStandardProductFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const requestedStandardProductId = useParams<{ standardProductId: string }>().standardProductId;
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { data: standardProductsRawData, error } = useSuspenseQuery(STANDARD_PRODUCT_QUERY, {
    variables: { baseId },
  });

  const [enableStandardProduct, { loading: isEnableStandardProductLoading }] = useMutation(
    ENABLE_STANDARD_PRODUCT_MUTATION,
  );

  const onSubmit = useCallback(
    (enableStandardProductFormOutput: EnableStandardProductFormOutput) => {
      enableStandardProduct({
        variables: {
          standardProductId: parseInt(enableStandardProductFormOutput.standardProduct.value, 10),
          baseId: parseInt(baseId, 10),
          comment: enableStandardProductFormOutput.comment,
          price: enableStandardProductFormOutput.price,
          inShop: enableStandardProductFormOutput.inShop,
        },
        refetchQueries: [
          { query: STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, variables: { baseId } },
          { query: PRODUCTS_QUERY, variables: { baseId } },
        ],
      })
        .then(({ data }) => {
          const result = data?.enableStandardProduct;
          if (!result) return;

          switch (result.__typename) {
            case "Product":
              createToast({
                message: `The ASSORT standard product was successfully enabled.`,
              });
              navigate(`../../`);

              break;
            case "InsufficientPermissionError":
              triggerError({
                message: "You don't have permission to enable this ASSORT standard product!",
              });
              break;
            case "InvalidPriceError":
              triggerError({
                message: "Price must be a positive integer number.",
              });
              break;
            case "OutdatedStandardProductVersionError":
              triggerError({
                message: "This standard product is outdated and cannot be enabled. ",
              });
              break;
            case "StandardProductAlreadyEnabledForBaseError":
              triggerError({
                message: "This standard product is already enabled for this base.",
              });
              break;

            default:
              triggerError({
                message: "Could not enable this ASSORT standard product! Try again?",
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: "Could not enable this ASSORT standard product! Try again?",
          });
        });
    },
    [enableStandardProduct, baseId, createToast, navigate, triggerError],
  );

  // If Apollo encountered an error (like network error), throw it
  if (error) {
    throw error;
  }
  // Otherwise, data is now loaded (Suspense has ended), but there could be errors returned in the data
  if (
    !standardProductsRawData ||
    standardProductsRawData.standardProducts?.__typename !== "StandardProductPage"
  ) {
    throw new Error(enableStandardProductQueryErrorText);
  }

  const standardProductData = standardProductRawToFormDataTransformer(standardProductsRawData);

  const defaultValues = findDefaultValues(standardProductData, requestedStandardProductId);

  return (
    <EnableStandardProductForm
      standardProductData={standardProductData}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isEnableStandardProductLoading}
      showAlert={false}
      key={requestedStandardProductId}
    />
  );
}

function EnableStandardProductView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath=".." />
      <Center>
        {/* <form action=""> */}
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Enable New Product
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || enableStandardProductQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <EnableStandardProductFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default EnableStandardProductView;
