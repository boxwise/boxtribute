import { Box, Center, Heading } from "@chakra-ui/react";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { graphql, ResultOf } from "../../../../graphql/graphql";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";
import EnableStandardProductForm from "./components/EnableStandardProductForm";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { standardProductRawToInfoTransformer } from "./components/transformer";

export const ENABLE_STANDARD_PRODUCT_QUERY = graphql(
  `
    query EnableStandardProductQuery($standardProductId: ID!) {
      standardProduct(id: $standardProductId) {
        __typename
        ... on StandardProduct {
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
  `,
  [STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT],
);

export type IEnableStandardProductQueryResultType = ResultOf<typeof ENABLE_STANDARD_PRODUCT_QUERY>;
export const enableStandardProductQueryErrorText =
  "Could not fetch ASSORT standard data! Please try reloading the page.";

export const ENABLE_STANDARD_PRODUCT_MUTATION = graphql(
  `
    mutation EnableStandardProductMutation(
      $baseId: ID!
      $standardProductId: ID!
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
  const standardProductId = useParams<{ standardProductId: string }>().standardProductId!;
  const { data: standardProductRawData } = useQuery(ENABLE_STANDARD_PRODUCT_QUERY, {
    variables: { standardProductId },
  });

  // const [enableStandardProductMutation] = useMutation(
  //   ENABLE_STANDARD_PRODUCT_MUTATION,
  // );
  if (!standardProductRawData) {
    return null;
  }

  return (
    <EnableStandardProductForm
      standardProductData={standardProductRawToInfoTransformer(standardProductRawData)}
      onSubmit={() => null}
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
