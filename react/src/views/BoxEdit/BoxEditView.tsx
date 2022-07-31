import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import BoxEdit, { BoxFormValues } from "./components/BoxEdit";

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY = gql`
  query BoxByLabelIdentifierAndAllProducts($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size {
        id
        label
      }
      items
      product {
        id
        name
        gender
        sizeRange {
          sizes {
            id
            label
          }
        }
      }
      location {
        id
        name
        base {
          locations {
            id
            name
          }
        }
      }
    }

    products(paginationInput: { first: 500 }) {
      elements {
        id
        name
        gender
        category {
          name
        }
        sizeRange {
          label
        }
      }
    }
  }
`;

export const UPDATE_CONTENT_OF_BOX_MUTATION = gql`
  mutation UpdateContentOfBox($boxLabelIdentifier: String!, $productId: Int!, $numberOfItems: Int!, $sizeId: Int!) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        productId: $productId
        items: $numberOfItems
        sizeId: $sizeId
      }
    ) {
      labelIdentifier
    }
  }
`;

const BoxEditView = () => {
  const labelIdentifier =
    useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const { loading, data } = useQuery<
    BoxByLabelIdentifierAndAllProductsQuery,
    BoxByLabelIdentifierAndAllProductsQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY, {
    variables: {
      labelIdentifier,
    },
  });
  const baseId = useParams<{ baseId: string }>().baseId;
  const navigate = useNavigate();

  const [updateContentOfBoxMutation] = useMutation<
    UpdateContentOfBoxMutation,
    UpdateContentOfBoxMutationVariables
  >(UPDATE_CONTENT_OF_BOX_MUTATION);

  const onSubmitBoxEditForm = (boxFormValues: BoxFormValues) => {
    console.log("boxLabelIdentifier", labelIdentifier);
    console.log("boxFormValues", boxFormValues);
    
    updateContentOfBoxMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        productId: parseInt(boxFormValues.productForDropdown.value),
        numberOfItems: boxFormValues.numberOfItems,
        sizeId: parseInt(boxFormValues.sizeId),
      },
    })
      .then((mutationResult) => {
        navigate(
          `/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`
        );
      })
      .catch((error) => {
        console.log("Error while trying to update Box", error);
      });
  };

  if (loading) {
    return <APILoadingIndicator />;
  }
  const boxData = data?.box;
  const allProducts = data?.products;

  if (allProducts?.elements == null) {
    console.error("allProducts.elements is null");
    return <div>Error: no products available to choose from for this Box</div>;
  }

  return (
    <BoxEdit
      boxData={boxData}
      allProducts={allProducts?.elements}
      onSubmitBoxEditForm={onSubmitBoxEditForm}
    />
  );
};

export default BoxEditView;
