import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import CreateCustomProductForm, {
  ICreateCustomProductFormOutput,
} from "./components/CreateCustomProductForm";
// import { useNavigate } from "react-router-dom";
// import { useAtomValue } from "jotai";
// import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
// import { useErrorHandling } from "hooks/useErrorHandling";
// import { useNotification } from "hooks/useNotification";
import { useSuspenseQuery } from "@apollo/client";
import { ResultOf } from "gql.tada";
import { customProductRawToFormOptionsTransformer } from "./components/transformer";
import { graphql } from "../../../../graphql/graphql";

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

function CreateCustomProductFormContainer() {
  //   const navigate = useNavigate();
  //   const baseId = useAtomValue(selectedBaseIdAtom);
  //   const { createToast } = useNotification();
  //   const { triggerError } = useErrorHandling();
  const { data: customProductFormRawOptions, error } = useSuspenseQuery(
    CUSTOM_PRODUCT_FORM_OPTIONS_QUERY,
  );

  //   const [enableStandardProduct, { loading: isEnableStandardProductLoading }] = useMutation(
  //     ENABLE_STANDARD_PRODUCT_MUTATION,
  //   );

  //   const onSubmit = useCallback(
  //     (enableStandardProductFormOutput: IEnableStandardProductFormOutput) => {
  //       enableStandardProduct({
  //         variables: {
  //           standardProductId: parseInt(enableStandardProductFormOutput.standardProduct.value, 10),
  //           baseId: parseInt(baseId, 10),
  //           comment: enableStandardProductFormOutput.comment,
  //           price: enableStandardProductFormOutput.price,
  //           inShop: enableStandardProductFormOutput.inShop,
  //         },
  //         refetchQueries: [
  //           { query: STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, variables: { baseId } },
  //           { query: PRODUCTS_QUERY },
  //         ],
  //       })
  //         .then(({ data }) => {
  //           const result = data?.enableStandardProduct;
  //           if (!result) return;

  //           switch (result.__typename) {
  //             case "Product":
  //               createToast({
  //                 message: `The ASSORT standard product was successfully enabled.`,
  //               });
  //               navigate(`../../`);

  //               break;
  //             case "InsufficientPermissionError":
  //               triggerError({
  //                 message: "You don't have permission to enable this ASSORT standard product!",
  //               });
  //               break;
  //             case "InvalidPriceError":
  //               triggerError({
  //                 message: "Price must be a positive integer number.",
  //               });
  //               break;
  //             case "OutdatedStandardProductVersionError":
  //               triggerError({
  //                 message: "This standard product is outdated and cannot be enabled. ",
  //               });
  //               break;
  //             case "StandardProductAlreadyEnabledForBaseError":
  //               triggerError({
  //                 message: "This standard product is already enabled for this base.",
  //               });
  //               break;

  //             default:
  //               triggerError({
  //                 message: "Could not enable this ASSORT standard product! Try again?",
  //               });
  //               break;
  //           }
  //         })
  //         .catch(() => {
  //           // Handle network or other errors
  //           triggerError({
  //             message: "Could not enable this ASSORT standard product! Try again?",
  //           });
  //         });
  //     },
  //     [enableStandardProduct, baseId, createToast, navigate, triggerError],
  //   );

  const onSubmit = useCallback((createProductFormOutput: ICreateCustomProductFormOutput) => {
    // Handle form submission logic here
    console.log("Form submitted with data:", createProductFormOutput);
    // You can call an API or perform any other actions with the form data
  }, []);

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
      isLoading={false}
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
