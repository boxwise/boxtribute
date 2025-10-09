import { CombinedGraphQLErrors } from "@apollo/client";
import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";

import { graphql } from "../../../graphql/graphql";
import { useNotification } from "./useNotification";
import { useErrorHandling } from "./useErrorHandling";

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
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();

  const [disableStandardProductMutation, { loading: disableStandardProductMutationLoading }] =
    useMutation(DISABLE_STANDARD_PRODUCT_MUTATION);
  const [deleteProductMutation, { loading: deleteProductMutationLoading }] =
    useMutation(DELETE_PRODUCT_MUTATION);

  const handleDisableOrDeleteProduct = useCallback(
    (
      disableOrDelete: "disable" | "delete",
      message: JSX.Element,
      customProductOrinstantiationId?: string,
      instockItemsCount?: number,
      transferItemsCount?: number,
    ) => {
      const displayMessageToUser = (
        typename: string,
        organisationName: string,
        labelIdentifiers: string[],
      ) => {
        switch (typename) {
          case "Product":
            createToast({
              message:
                disableOrDelete === "disable"
                  ? "The ASSORT standard product was successfully disabled."
                  : "The product was successfully deleted.",
            });
            break;
          case "InsufficientPermissionError":
            triggerError({
              message:
                disableOrDelete === "disable"
                  ? "You don't have permission to disable this ASSORT standard product!"
                  : "You don't have permission to delete this product!",
            });
            break;
          case "UnauthorizedForBaseError":
            triggerError({
              message: `This product belongs to organization ${organisationName}.`,
            });
            break;
          case "BoxesStillAssignedToProductError":
            triggerError({
              message: `This product is still assigned to the following boxes: ${labelIdentifiers.join(", ")}.`,
            });
            break;
          default:
            triggerError({
              message:
                disableOrDelete === "disable"
                  ? "Could not disable this ASSORT standard product! Try again?"
                  : "Could not delete this product! Try again?",
            });
            break;
        }
      };

      if (
        (instockItemsCount !== undefined && instockItemsCount > 0) ||
        (transferItemsCount !== undefined && transferItemsCount > 0)
      ) {
        createToast({
          title: `${disableOrDelete === "disable" ? "Disabling" : "Deleting"} Product with Active Stock`,
          message,
          type: "error",
          duration: 10000,
        });
      } else if (customProductOrinstantiationId && disableOrDelete === "disable") {
        disableStandardProductMutation({
          variables: {
            instantiationId: customProductOrinstantiationId,
          },
        }).then(({ data, error }) => {
          if (CombinedGraphQLErrors.is(error)) {
            // GraphQL error
            triggerError({
              message: "Could not disable this ASSORT standard product! Try again?",
            });
            return;
          } else if (error) {
            // Network error
            triggerError({
              message: "Network issue: Could not disable this ASSORT standard product! Try again?",
            });
            return;
          }

          const result = data?.disableStandardProduct;
          if (!result) return;

          displayMessageToUser(
            result.__typename,
            (result.__typename === "UnauthorizedForBaseError" && result.organisationName) || "",
            (result.__typename === "BoxesStillAssignedToProductError" &&
              result.labelIdentifiers) || [""],
          );
        });
      } else if (customProductOrinstantiationId && disableOrDelete === "delete") {
        deleteProductMutation({
          variables: {
            productId: customProductOrinstantiationId,
          },
        }).then(({ data, error }) => {
          if (CombinedGraphQLErrors.is(error)) {
            // GraphQL error
            triggerError({
              message: "Could not delete this product! Try again?",
            });
            return;
          } else if (error) {
            // Network error
            triggerError({
              message: "Network issue: Could not delete this product! Try again?",
            });
            return;
          }

          const result = data?.deleteProduct;
          if (!result) return;

          displayMessageToUser(
            result.__typename,
            (result.__typename === "UnauthorizedForBaseError" && result.organisationName) || "",
            (result.__typename === "BoxesStillAssignedToProductError" &&
              result.labelIdentifiers) || [""],
          );
        });
      } else {
        triggerError({
          message:
            disableOrDelete === "disable"
              ? "No instantiationId provided for disabling product."
              : "No product ID provided for deleting product.",
          userMessage: "Something went wrong.",
        });
      }
    },
    [createToast, deleteProductMutation, disableStandardProductMutation, triggerError],
  );

  return {
    disableStandardProductMutationLoading,
    deleteProductMutationLoading,
    handleDisableOrDeleteProduct,
  };
};
