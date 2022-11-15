import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import BoxEdit, { IBoxEditFormData } from "./components/BoxEdit";

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY = gql`
  query BoxByLabelIdentifierAndAllProducts($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size {
        id
        label
      }
      numberOfItems
      comment
      tags {
        value: id
        label: name
        color
      }
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

    tags {
      value: id
      label: name
      color
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
    $comment: String
    $tagIds: [Int!]
  ) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        productId: $productId
        numberOfItems: $numberOfItems
        sizeId: $sizeId
        locationId: $locationId
        comment: $comment
        tagIds: $tagIds
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

  const onSubmitBoxEditForm = (boxEditFormData: IBoxEditFormData) => {
    // eslint-disable-next-line no-console
    console.log("boxLabelIdentifier", labelIdentifier);
    // eslint-disable-next-line no-console
    console.log("boxEditFormData", boxEditFormData);

    const tagIds = boxEditFormData?.tags
      ? boxEditFormData?.tags?.map((tag) => parseInt(tag.value, 10)) : [];

    updateContentOfBoxMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        productId: parseInt(boxEditFormData.productId.value, 10),
        sizeId: parseInt(boxEditFormData.sizeId.value, 10),
        numberOfItems: boxEditFormData.numberOfItems,
        locationId: parseInt(boxEditFormData.locationId.value, 10),
        tagIds,
        comment: boxEditFormData?.comment,
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
  const allTags = data?.tags || null;

  const allLocations = data?.box?.location?.base?.locations.map((location) => ({
    ...location,
    name: location.name ?? "",
  }));

  if (allLocations == null) {
    return <div>Error: no locations available to choose from</div>;
  }

  if (productAndSizesData?.elements == null) {
    return <div>Error: no products available to choose from for this Box</div>;
  }

  return (
    <BoxEdit
      boxData={boxData}
      onSubmitBoxEditForm={onSubmitBoxEditForm}
      productAndSizesData={productAndSizesData?.elements}
      allLocations={allLocations}
      allTags={allTags}
    />
  );
}

export default BoxEditView;
