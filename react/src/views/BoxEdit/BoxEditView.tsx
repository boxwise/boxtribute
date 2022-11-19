import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
  BoxState,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import { notificationVar } from "../../components/NotificationMessage";
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
        ... on ClassicLocation {
          defaultBoxState
        }
        id
        name
        base {
          locations {
            ... on ClassicLocation {
              defaultBoxState
            }
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
    const tagIds = boxEditFormData?.tags
      ? boxEditFormData?.tags?.map((tag) => parseInt(tag.value, 10))
      : [];

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
        if (mutationResult?.errors) {
          notificationVar({
            title: `Box ${labelIdentifier}`,
            type: "error",
            message: "Error while trying to update Box",
          });
        } else {
          notificationVar({
            title: `Box ${labelIdentifier}`,
            type: "success",
            message: `Successfully modified with ${
              (data?.products.elements.find((p) => p.id === boxEditFormData.productId.value) as any)
                .name
            } (${boxEditFormData?.numberOfItems}x) in ${
              (
                data?.box?.location?.base?.locations.find(
                  (l) => l.id === boxEditFormData.locationId.value,
                ) as any
              ).name
            }.`,
          });
          navigate(`/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`);
        }
      })
      .catch((error) => {
        notificationVar({
          title: `Box ${labelIdentifier}`,
          type: "error",
          message: `Error - Code ${error.code}: Your changes could not be saved!`,
        });
      });
  };

  if (loading) {
    return <APILoadingIndicator />;
  }

  const boxData = data?.box;
  const productAndSizesData = data?.products;
  const allTags = data?.tags || null;

  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = data?.box?.location?.base?.locations
    .filter(
      (location) =>
        location?.defaultBoxState !== BoxState.Lost && location?.defaultBoxState !== BoxState.Scrap,
    )
    .map((location) => ({
      ...location,
      name: location.name ?? "",
    }));

  if (allLocations == null) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "Error: No other locations are visible!",
    });
    return <div />;
  }

  if (productAndSizesData?.elements == null) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "Error: No products are visible!",
    });
    return <div />;
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
