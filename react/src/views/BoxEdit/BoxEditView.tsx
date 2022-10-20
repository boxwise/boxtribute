import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import BoxEdit, { IBoxFormValues } from "./components/BoxEdit";

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY = gql`
  query BoxByLabelIdentifierAndAllProducts($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size {
        id
        label
      }
      numberOfItems
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

    products(paginationInput: { first: 5000 }) {
      elements {
        id
        name
        gender
        category {
          name
        }
        sizeRange {
          label
          sizes {
            id
            label
          }
        }
      }
    }
  }
`;

export const UPDATE_CONTENT_OF_BOX_MUTATION = gql`
  mutation UpdateContentOfBox(
    $boxLabelIdentifier: String!
    $productId: Int!
    $locationId: Int!
    $numberOfItems: Int!
    $sizeId: Int!
  ) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        productId: $productId
        numberOfItems: $numberOfItems
        sizeId: $sizeId
        locationId: $locationId
      }
    ) {
      labelIdentifier
    }
  }
`;

function BoxEditView() {
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const { loading, data } = useQuery<
    BoxByLabelIdentifierAndAllProductsQuery,
    BoxByLabelIdentifierAndAllProductsQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY, {
    variables: {
      labelIdentifier,
    },
  });
  const { baseId } = useParams<{ baseId: string }>();
  const navigate = useNavigate();

  const [updateContentOfBoxMutation] = useMutation<
    UpdateContentOfBoxMutation,
    UpdateContentOfBoxMutationVariables
  >(UPDATE_CONTENT_OF_BOX_MUTATION);

  const onSubmitBoxEditForm = (boxFormValues: IBoxFormValues) => {
    // eslint-disable-next-line no-console
    console.log("boxLabelIdentifier", labelIdentifier);
    // eslint-disable-next-line no-console
    console.log("boxFormValues", boxFormValues);

    updateContentOfBoxMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        productId: parseInt(boxFormValues.productId, 10),
        numberOfItems: boxFormValues.numberOfItems,
        sizeId: parseInt(boxFormValues.sizeId, 10),
        locationId: parseInt(boxFormValues.locationId, 10),
      },
    })
      .then((mutationResult) => {
        navigate(`/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Error while trying to update Box", error);
      });
  };

  if (loading) {
    return <APILoadingIndicator />;
  }
  const boxData = data?.box;
  const productAndSizesData = data?.products;
  const allLocations = data?.box?.location?.base?.locations.map((location) => ({
    ...location,
    name: location.name ?? "",
  }));

  if (allLocations == null) {
    // eslint-disable-next-line no-console
    console.error("allLocations is null");
    return <div>Error: no locations available to choose from</div>;
  }

  if (productAndSizesData?.elements == null) {
    // eslint-disable-next-line no-console
    console.error("allProducts.elements is null");
    return <div>Error: no products available to choose from for this Box</div>;
  }

  return (
    <BoxEdit
      boxData={boxData}
      onSubmitBoxEditForm={onSubmitBoxEditForm}
      productAndSizesData={productAndSizesData?.elements}
      allLocations={allLocations}
    />
  );
}

export default BoxEditView;
