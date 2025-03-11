import { Box, Center, Heading } from "@chakra-ui/react";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { graphql, ResultOf } from "../../../../graphql/graphql";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";
import EnableStandardProductForm, {
  IEnableStandardProductFormOutput,
} from "./components/EnableStandardProductForm";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { standardProductRawToFormDataTransformer } from "./components/transformer";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY } from "views/Products/ProductsView";
import { useNotification } from "hooks/useNotification";
import { useErrorHandling } from "hooks/useErrorHandling";

export const ENABLE_STANDARD_PRODUCT_QUERY = graphql(
  `
    query EnableStandardProductQuery($baseId: ID!) {
      standardProducts(baseId: $baseId) {
        __typename
        ... on StandardProductPage {
          elements {
            ...StandardProductBasicFields
            instantiation {
              id
              price
              comment
              inShop
              deletedOn
            }
          }
        }
      }
    }
  `,
  [STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT],
);

export type IEnableStandardProductQueryResultType = ResultOf<typeof ENABLE_STANDARD_PRODUCT_QUERY>;
export const enableStandardProductQueryErrorText =
  "Could not fetch ASSORT standard data! Please try reloading the page.";

export const ENABLE_STANDARD_PRODUCT_MUTATION = graphql(
  `
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
          ...ProductBasicFields
        }
      }
    }
  `,
  [PRODUCT_BASIC_FIELDS_FRAGMENT],
);

function EnableStandardProductFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const requestedStandardProductId = useParams<{ standardProductId: string }>().standardProductId!;
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { data: standardProductRawData } = useQuery(ENABLE_STANDARD_PRODUCT_QUERY, {
    variables: { baseId },
  });

  const [enableStandardProduct, { loading: isEnableStandardProductLoading }] = useMutation(
    ENABLE_STANDARD_PRODUCT_MUTATION,
  );

  const onSubmit = useCallback(
    (enableStandardProductFormOutput: IEnableStandardProductFormOutput) => {
      console.log("enableStandardProductFormOutput", enableStandardProductFormOutput);
      enableStandardProduct({
        variables: {
          standardProductId: parseInt(enableStandardProductFormOutput.standardProduct.value, 10),
          baseId: parseInt(baseId, 10),
          comment: enableStandardProductFormOutput.comment,
          price: enableStandardProductFormOutput.price,
          inShop: enableStandardProductFormOutput.inShop,
        },
        refetchQueries: [{ query: STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, variables: { baseId } }],
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
            message: "Could not disable this ASSORT standard product! Try again?",
          });
        });
    },
    [enableStandardProduct, baseId, createToast, navigate, triggerError],
  );

  if (!standardProductRawData) {
    return null;
  }

  const standardProductData = standardProductRawToFormDataTransformer(standardProductRawData);

  const defaultValues = standardProductData.find(
    (standardProduct) => standardProduct.standardProduct.value === requestedStandardProductId,
  );

  if (!defaultValues) {
    return null;
  }

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
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath="../../" />
      <Center>
        {/* <form action=""> */}
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Enable New Product
          </Heading>
          <ErrorBoundary
            fallback={<AlertWithoutAction alertText={enableStandardProductQueryErrorText} />}
          >
            <Suspense fallback={<TableSkeleton />}>
              <EnableStandardProductFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default EnableStandardProductView;
