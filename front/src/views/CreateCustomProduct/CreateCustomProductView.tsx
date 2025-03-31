import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import CreateCustomProductForm, {
  ICreateCustomProductFormOutput,
} from "./components/CreateCustomProductForm";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { ResultOf } from "gql.tada";
import { customProductRawToFormOptionsTransformer } from "./components/transformer";
import { graphql } from "../../../../graphql/graphql";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { NonNullProductGender } from "../../../../graphql/types";

const createCustomProductQueryErrorText = "Something went wrong! Please try reloading the page.";

const CUSTOM_PRODUCT_FORM_OPTIONS_QUERY = graphql(
  `
    query CustomProductFormOptions {
      productCategories {
        id
        name
      }
      sizeRanges {
        id
        label
      }
    }
  `,
  [],
);

export type ICustomProductFormQueryResult = ResultOf<typeof CUSTOM_PRODUCT_FORM_OPTIONS_QUERY>;

const CREATE_CUSTOM_PRODUCT_MUTATION = graphql(
  `
    mutation CreateCustomProduct(
      $baseId: Int!
      $name: String!
      $categoryId: Int!
      $sizeRangeId: Int!
      $gender: ProductGender!
      $price: Int
      $inShop: Boolean
      $comment: String
    ) {
      createCustomProduct(
        creationInput: {
          baseId: $baseId
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
        }
      }
    }
  `,
  [],
);

const createCustomProductErrorToastText = "Could not create this custom product! Try again?";

function CreateCustomProductFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();
  const { data: customProductFormRawOptions, error } = useSuspenseQuery(
    CUSTOM_PRODUCT_FORM_OPTIONS_QUERY,
  );

  const [createCustomProduct, { loading: isCreateCustomProductLoading }] = useMutation(
    CREATE_CUSTOM_PRODUCT_MUTATION,
  );

  const onSubmit = useCallback(
    (createProductFormOutput: ICreateCustomProductFormOutput) => {
      createCustomProduct({
        variables: {
          baseId: parseInt(baseId, 10),
          name: createProductFormOutput.name,
          categoryId: createProductFormOutput.category,
          sizeRangeId: createProductFormOutput.sizeRange,
          gender: createProductFormOutput.gender as NonNullProductGender, // this is not a validation, but a work-around to make ts happy
          price: createProductFormOutput.price,
          inShop: createProductFormOutput.inShop,
          comment: createProductFormOutput.comment,
        },
        refetchQueries: [{ query: PRODUCTS_QUERY }],
      })
        .then(({ data }) => {
          const result = data?.createCustomProduct;
          if (!result) {
            triggerError({
              message: createCustomProductErrorToastText,
            });
            return;
          }

          switch (result.__typename) {
            case "Product":
              createToast({
                message: `The custom product was successfully created.`,
              });
              navigate(`..`);

              break;
            case "InsufficientPermissionError":
            case "UnauthorizedForBaseError":
              triggerError({
                message: "You don't have permission to create a custom product!",
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
                message: createCustomProductErrorToastText,
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: createCustomProductErrorToastText,
          });
        });
    },
    [createCustomProduct, baseId, createToast, navigate, triggerError],
  );

  // If Apollo encountered an error (like network error), throw it
  if (error) {
    throw error;
  }

  const { categoryOptions, sizeRangeOptions, genderOptions } =
    customProductRawToFormOptionsTransformer(customProductFormRawOptions);

  return (
    <CreateCustomProductForm
      categoryOptions={categoryOptions}
      sizeRangeOptions={sizeRangeOptions}
      genderOptions={genderOptions}
      onSubmit={onSubmit}
      isLoading={isCreateCustomProductLoading}
    />
  );
}

function CreateCustomProductView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Products" linkPath=".." />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Add New Product
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || createCustomProductQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <CreateCustomProductFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}

export default CreateCustomProductView;
