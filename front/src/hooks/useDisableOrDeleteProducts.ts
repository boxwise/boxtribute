import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { useAtomValue } from "jotai";

import { graphql } from "../../../graphql/graphql";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useNotification } from "./useNotification";
import { useErrorHandling } from "./useErrorHandling";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY } from "views/Products/components/StandardProductsContainer";

export const DISABLE_STANDARD_PRODUCT_MUTATION = graphql(
  `
    mutation DisableStandardProduct($instantiationId: ID!) {
      disableStandardProduct(instantiationId: $instantiationId) {
        __typename
        ... on Product {
          id
          type
          standardProduct {
            id
          }
          deletedOn
        }
        ... on UnauthorizedForBaseError {
          name
          organisationName
        }
        ... on BoxesStillAssignedToProductError {
          labelIdentifiers
        }
      }
    }
  `,
  [],
);

export const DELETE_PRODUCT_MUTATION = graphql(
  `
    mutation DeleteProduct($productId: ID!) {
      deleteProduct(id: $productId) {
        __typename
        ... on Product {
          id
          type
          standardProduct {
            id
          }
          deletedOn
        }
        ... on UnauthorizedForBaseError {
          name
          organisationName
        }
        ... on BoxesStillAssignedToProductError {
          labelIdentifiers
        }
      }
    }
  `,
  [],
);

export const useDisableOrDeleteProducts = () => {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();

  const [disableStandardProductMutation, { loading: disableStandardProductMutationLoading }] =
    useMutation(DISABLE_STANDARD_PRODUCT_MUTATION);
  const [deleteProductMutation, { loading: deleteProductMutationLoading }] =
    useMutation(DELETE_PRODUCT_MUTATION);

  const refetchQueries = useCallback(
    () => [
      { query: STANDARD_PRODUCTS_FOR_PRODUCTVIEW_QUERY, variables: { baseId } },
      { query: PRODUCTS_QUERY, variables: { baseId } },
    ],
    [baseId],
  );

  const handleDisableProduct = useCallback(
    (
      message: JSX.Element,
      instantiationId?: string,
      instockItemsCount?: number,
      transferItemsCount?: number,
    ) => {
      if (
        (instockItemsCount !== undefined && instockItemsCount > 0) ||
        (transferItemsCount !== undefined && transferItemsCount > 0)
      ) {
        createToast({
          title: "Disabling Product with Active Stock",
          message,
          type: "error",
          duration: 10000,
        });
      } else if (instantiationId) {
        disableStandardProductMutation({
          variables: {
            instantiationId,
          },
          refetchQueries,
        })
          .then(({ data }) => {
            const result = data?.disableStandardProduct;
            if (!result) return;

            switch (result.__typename) {
              case "Product":
                createToast({
                  message: `The ASSORT standard product was successfully disabled.`,
                });
                break;
              case "InsufficientPermissionError":
                triggerError({
                  message: "You don't have permission to disable this ASSORT standard product!",
                });
                break;
              case "UnauthorizedForBaseError":
                triggerError({
                  message: `This product belongs to organization ${result?.organisationName}.`,
                });
                break;
              case "BoxesStillAssignedToProductError":
                triggerError({
                  message: `This product is still assigned to the following boxes: ${result?.labelIdentifiers.join(", ")}.`,
                });
                break;
              default:
                triggerError({
                  message: "Could not disable this ASSORT standard product! Try again?",
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
      } else {
        triggerError({
          message: "No instantiationId provided for disabling product.",
          userMessage: "Something went wrong.",
        });
      }
    },
    [createToast, disableStandardProductMutation, refetchQueries, triggerError],
  );

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      if (productId) {
        deleteProductMutation({
          variables: {
            productId,
          },
          refetchQueries,
        })
          .then(({ data }) => {
            const result = data?.deleteProduct;
            if (!result) return;

            switch (result.__typename) {
              case "Product":
                createToast({
                  message: `The product was successfully disabled.`,
                });
                break;
              case "InsufficientPermissionError":
                triggerError({
                  message: "You don't have permission to delete this product!",
                });
                break;
              case "UnauthorizedForBaseError":
                triggerError({
                  message: `This product belongs to organization ${result?.organisationName}.`,
                });
                break;
              case "BoxesStillAssignedToProductError":
                triggerError({
                  message: `This product is still assigned to the following boxes: ${result?.labelIdentifiers.join(", ")}.`,
                });
                break;
              default:
                triggerError({
                  message: "Could not delete this product! Try again?",
                });
                break;
            }
          })
          .catch(() => {
            // Handle network or other errors
            triggerError({
              message: "Could not delete this product! Try again?",
            });
          });
      } else {
        triggerError({
          message: "No product ID provided for disabling product.",
          userMessage: "Something went wrong.",
        });
      }
    },
    [deleteProductMutation, refetchQueries, createToast, triggerError],
  );

  return {
    disableStandardProductMutationLoading,
    deleteProductMutationLoading,
    handleDisableProduct,
    handleDeleteProduct,
  };
};
