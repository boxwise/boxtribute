import { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import {
  TAG_OPTIONS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
  LOCATION_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import APILoadingIndicator from "components/APILoadingIndicator";
import BoxEdit, { IBoxEditFormDataOutput } from "./components/BoxEdit";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY = graphql(
  `
    query BoxByLabelIdentifierAndAllProductsWithBaseId($baseId: ID!, $labelIdentifier: String!) {
      box(labelIdentifier: $labelIdentifier) {
        labelIdentifier
        numberOfItems
        comment
        product {
          id
          name
          gender
          deletedOn
        }
        size {
          id
          label
        }
        location {
          id
          name
        }
        tags {
          ...TagOptions
        }
      }

      base(id: $baseId) {
        id
        tags(resourceType: Box) {
          ...TagOptions
        }

        locations {
          ...LocationBasicFields
        }

        products {
          ...ProductFields
        }
      }
    }
  `,
  [TAG_OPTIONS_FRAGMENT, PRODUCT_FIELDS_FRAGMENT, LOCATION_BASIC_FIELDS_FRAGMENT],
);

export const UPDATE_CONTENT_OF_BOX_MUTATION = graphql(`
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
`);

function BoxEditView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();

  // variables in URL
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const baseId = useAtomValue(selectedBaseIdAtom);

  // Query Data for the Form
  const allBoxAndFormData = useQuery(BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, {
    variables: {
      baseId,
      labelIdentifier,
    },
  });

  const refetchBoxByLabelIdentifierQueryConfig = () => ({
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier,
    },
  });

  // Mutation after form submission
  const [updateContentOfBoxMutation, updateContentOfBoxMutationState] = useMutation(
    UPDATE_CONTENT_OF_BOX_MUTATION,
    {
      refetchQueries: [refetchBoxByLabelIdentifierQueryConfig()],
    },
  );

  // Handle Submission
  const onSubmitBoxEditForm = (boxEditFormData: IBoxEditFormDataOutput) => {
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
          createToast({
            title: `Box ${labelIdentifier}`,
            type: "success",
            message: `Successfully modified with ${
              allBoxAndFormData.data?.base?.products.find(
                (p) => p.id === boxEditFormData.productId.value,
              )?.name || boxEditFormData.productId.label
            } (${boxEditFormData?.numberOfItems}x) in ${
              allBoxAndFormData.data?.base?.locations.find(
                (l) => l.id === boxEditFormData.locationId.value,
              )?.name || boxEditFormData.locationId.label
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

  // Prep data for Form
  const boxData = allBoxAndFormData.data?.box;
  const productAndSizesData = allBoxAndFormData.data?.base?.products;
  const allTags = allBoxAndFormData.data?.base?.tags;

  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = allBoxAndFormData.data?.base?.locations
    .filter(
      (location) => location?.defaultBoxState !== "Lost" && location?.defaultBoxState !== "Scrap",
    )
    .map((location) => ({
      ...location,
      name:
        (location.defaultBoxState !== "InStock"
          ? `${location.name} - Boxes are ${location.defaultBoxState}`
          : location.name) ?? "",
    }))
    .sort((a, b) => Number(a?.seq) - Number(b?.seq));

  // check data for form
  useEffect(() => {
    if (!allBoxAndFormData.loading) {
      if (allLocations === undefined) {
        triggerError({
          message: "No locations are available!",
        });
      }

      if (productAndSizesData === undefined) {
        triggerError({
          message: "No products are available!",
        });
      }
      if (boxData === undefined) {
        triggerError({ message: "Could not fetch Box Data!" });
      }
    }
  }, [triggerError, allBoxAndFormData.loading, allLocations, productAndSizesData, boxData]);

  if (allBoxAndFormData.loading || updateContentOfBoxMutationState.loading) {
    return <APILoadingIndicator />;
  }

  // TODO: handle errors not with empty div, but forward or roll data back in the view
  if (
    boxData === undefined ||
    boxData === null ||
    allLocations === undefined ||
    productAndSizesData === undefined
  ) {
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
