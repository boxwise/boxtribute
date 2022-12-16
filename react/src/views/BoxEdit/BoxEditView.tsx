import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierAndAllProductsWithBaseIdQuery,
  BoxByLabelIdentifierAndAllProductsWithBaseIdQueryVariables,
  BoxState,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import {
  PRODUCT_FIELDS_FRAGMENT,
  SIZE_FIELDS_FRAGMENT,
  TAG_OPTIONS_FRAGMENT,
} from "utils/fragments";
import { BOX_BY_LABEL_IDENTIFIER_QUERY } from "views/Box/BoxView";
import { useErrorHandling } from "utils/error-handling";
import { notificationVar } from "../../components/NotificationMessage";
import BoxEdit, { IBoxEditFormData } from "./components/BoxEdit";

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY = gql`
  ${TAG_OPTIONS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  ${SIZE_FIELDS_FRAGMENT}
  query BoxByLabelIdentifierAndAllProductsWithBaseId($baseId: ID!, $labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size {
        ...SizeFields
      }
      numberOfItems
      comment
      tags {
        ...TagOptions
      }
      product {
        ...ProductFields
      }
      location {
        ... on ClassicLocation {
          defaultBoxState
        }
        id
        name
      }
    }

    base(id: $baseId) {
      tags(resourceType: Box) {
        ...TagOptions
      }

      locations {
        ... on ClassicLocation {
          defaultBoxState
        }
        id
        name
      }

      products {
        ...ProductFields
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
  const { triggerError } = useErrorHandling();
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const baseId = useParams<{ baseId: string }>().baseId!;
  const { loading, data } = useQuery<
    BoxByLabelIdentifierAndAllProductsWithBaseIdQuery,
    BoxByLabelIdentifierAndAllProductsWithBaseIdQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, {
    variables: {
      baseId,
      labelIdentifier,
    },
  });
  const navigate = useNavigate();

  const refetchBoxByLabelIdentifierQueryConfig = () => ({
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier,
    },
  });

  const [updateContentOfBoxMutation] = useMutation<
    UpdateContentOfBoxMutation,
    UpdateContentOfBoxMutationVariables
  >(UPDATE_CONTENT_OF_BOX_MUTATION, {
    refetchQueries: [refetchBoxByLabelIdentifierQueryConfig()],
  });

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
          triggerError({
            message: "Could not update Box.",
          });
        } else {
          notificationVar({
            title: `Box ${labelIdentifier}`,
            type: "success",
            message: `Successfully modified with ${
              (data?.base?.products.find((p) => p.id === boxEditFormData.productId.value) as any)
                .name
            } (${boxEditFormData?.numberOfItems}x) in ${
              (data?.base?.locations.find((l) => l.id === boxEditFormData.locationId.value) as any)
                .name
            }.`,
          });
          navigate(`/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`);
        }
      })
      .catch((error) => {
        triggerError({
          message: "Could not update Box.",
          statusCode: error.code,
        });
      });
  };

  if (loading) {
    return <APILoadingIndicator />;
  }

  const boxData = data?.box;
  const productAndSizesData = data?.base?.products;
  const allTags = data?.base?.tags || null;

  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = data?.base?.locations
    .filter(
      (location) =>
        location?.defaultBoxState !== BoxState.Lost && location?.defaultBoxState !== BoxState.Scrap,
    )
    .map((location) => ({
      ...location,
      name: location.name ?? "",
    }));

  if (allLocations == null) {
    triggerError({
      message: "No locations are available!",
    });
    return <div />;
  }

  if (productAndSizesData == null) {
    triggerError({
      message: "No products are available!",
    });
    return <div />;
  }

  return (
    <BoxEdit
      boxData={boxData}
      onSubmitBoxEditForm={onSubmitBoxEditForm}
      productAndSizesData={productAndSizesData}
      allLocations={allLocations}
      allTags={allTags}
    />
  );
}

export default BoxEditView;
