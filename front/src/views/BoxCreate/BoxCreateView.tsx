import { useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import { Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  TAG_BASIC_FIELDS_FRAGMENT,
  TAG_OPTIONS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
} from "queries/fragments";
import { CHECK_IF_QR_EXISTS_IN_DB } from "queries/queries";
import BoxCreate, { ICreateBoxFormData } from "./components/BoxCreate";
import { AlertWithoutAction } from "components/Alerts";
import { selectedBaseAtom, selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useAtomValue } from "jotai";
import { BOXES_QUERY_ELEMENT_FIELD_FRAGMENT } from "views/Boxes/BoxesView";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  SIZE_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";

// TODO: Create fragment or query for ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY
export const ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY = graphql(
  `
    query AllProductsAndLocationsForBase($baseId: ID!) {
      base(id: $baseId) {
        id
        tags(resourceType: Box) {
          ...TagOptions
        }

        # TODO create location Fragment
        locations {
          ... on ClassicLocation {
            defaultBoxState
          }
          id
          seq
          name
        }

        products {
          ...ProductFields
        }
      }
    }
  `,
  [TAG_OPTIONS_FRAGMENT, PRODUCT_FIELDS_FRAGMENT],
);

export const CREATE_BOX_MUTATION = graphql(
  `
    mutation CreateBox(
      $locationId: Int!
      $productId: Int!
      $sizeId: Int!
      $numberOfItems: Int!
      $comment: String
      $tagIds: [Int!]
      $qrCode: String
    ) {
      createBox(
        creationInput: {
          locationId: $locationId
          productId: $productId
          numberOfItems: $numberOfItems
          sizeId: $sizeId
          qrCode: $qrCode
          comment: $comment
          tagIds: $tagIds
        }
      ) {
        ...BoxesQueryElementField
        # update Qr-Code in cache to be associated to this Box
        qrCode {
          code
          box {
            ... on Box {
              labelIdentifier
            }
          }
        }
      }
    }
  `,
  [
    PRODUCT_BASIC_FIELDS_FRAGMENT,
    SIZE_BASIC_FIELDS_FRAGMENT,
    TAG_BASIC_FIELDS_FRAGMENT,
    BOXES_QUERY_ELEMENT_FIELD_FRAGMENT,
  ],
);

function BoxCreateView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const selectedBase = useAtomValue(selectedBaseAtom);
  const baseId = useAtomValue(selectedBaseIdAtom);
  const baseName = selectedBase?.name;

  // no warehouse location or products associated with base
  const [noLocation, setNoLocation] = useState(false);
  const [noProducts, setNoProducts] = useState(false);

  // variables in URL
  const qrCode = useParams<{ qrCode: string }>().qrCode!;

  // Query the QR-Code
  const [
    runCheckIfQRExistsInDB,
    { loading: qrCodeExistsLoading, error: qrCodeExistsError, data: qrCodeExistsData },
  ] = useLazyQuery(CHECK_IF_QR_EXISTS_IN_DB, {
    variables: { qrCode },
  });

  // Check the QR Code if there is a qrCode param (user read a box QR-Code)
  useEffect(() => {
    if (qrCode) runCheckIfQRExistsInDB();

    if (qrCode && qrCodeExistsData?.qrExists === false) {
      createToast({
        title: "Error",
        type: "error",
        message: "The QR-Code is not from Boxtribute!",
      });
    }
    // TODO: Add check if Qr-Code is associated to a Box
  }, [qrCode, createToast, runCheckIfQRExistsInDB, qrCodeExistsData?.qrExists]);

  // Query Data for the Form
  const allFormOptions = useQuery(ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY, {
    variables: { baseId },
  });

  // Mutation after form submission
  const [createBoxMutation, createBoxMutationState] = useMutation(CREATE_BOX_MUTATION, {
    update(cache, { data }) {
      if (!data?.createBox) return;
      const { createBox } = data;

      cache.modify({
        fields: {
          boxes(existingBoxesRef = { totalCount: 0, elements: [] }) {
            const newBoxRef = cache.identify(createBox);

            return {
              ...existingBoxesRef,
              totalCount: existingBoxesRef.totalCount + 1,
              elements: [{ __ref: newBoxRef }, ...existingBoxesRef.elements],
            };
          },
        },
      });
    },
  });

  // Prep data for Form
  const allTags = allFormOptions.data?.base?.tags;
  const allProducts = allFormOptions.data?.base?.products;
  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = allFormOptions.data?.base?.locations
    .filter((location) => location?.defaultBoxState !== "Lost")
    .map((location) => ({
      ...location,
      name: location.name ?? "",
    }))
    .sort((a, b) => Number(a?.seq) - Number(b?.seq));

  useEffect(() => {
    // Disable form submission if no warehouse location or products associated with base, but only if the query response is available
    if (allLocations !== undefined && allLocations.length < 1) setNoLocation(true);
    else if (noLocation) setNoLocation(false);
    if (allProducts !== undefined && allProducts.length < 1) setNoProducts(true);
    else if (noProducts) setNoProducts(false);
  }, [allLocations, allProducts, noLocation, noProducts]);

  // check data for form
  useEffect(() => {
    if (!allFormOptions.loading) {
      if (allLocations === undefined) {
        triggerError({
          message: "No locations are available!",
        });
      }
      if (allProducts === undefined) {
        triggerError({
          message: "No products are available!",
        });
      }
    }
  }, [triggerError, allFormOptions.loading, allLocations, allProducts]);

  // Handle Submission
  const onSubmitBoxCreateForm = (createBoxData: ICreateBoxFormData) => {
    const tagIds = createBoxData?.tags
      ? createBoxData?.tags?.map((tag) => parseInt(tag.value, 10))
      : [];

    createBoxMutation({
      variables: {
        locationId: parseInt(createBoxData.locationId.value, 10),
        productId: parseInt(createBoxData.productId.value, 10),
        sizeId: parseInt(createBoxData.sizeId.value, 10),
        numberOfItems: createBoxData.numberOfItems,
        comment: createBoxData?.comment,
        tagIds,
        qrCode,
      },
    })
      .then((mutationResult) => {
        if (mutationResult.errors) {
          const errorCode = mutationResult.errors[0]?.extensions?.code;
          if (errorCode === "BAD_USER_INPUT") {
            triggerError({
              message: "The QR code is already used for another box.",
            });
          } else if (errorCode === "INTERNAL_SERVER_ERROR") {
            // Box label-identifier generation failed
            triggerError({
              message: "Could not create box. Please try again.",
            });
          } else {
            triggerError({
              message: "Error while trying to create Box",
            });
          }
        } else {
          createToast({
            title: `Box ${mutationResult.data?.createBox?.labelIdentifier}`,
            type: "success",
            message: `Successfully created with ${
              allFormOptions.data?.base?.products.find(
                (p) => p.id === createBoxData.productId.value,
              )?.name
            } (${createBoxData?.numberOfItems}x) in ${
              allFormOptions.data?.base?.locations.find(
                (l) => l.id === createBoxData.locationId.value,
              )?.name
            }.`,
          });
          navigate(`/bases/${baseId}/boxes/${mutationResult.data?.createBox?.labelIdentifier}`);
        }
      })
      .catch((err) => {
        triggerError({
          message: "Your changes could not be saved!",
          statusCode: err.code,
        });
      });
  };

  // Handle Loading State
  if ((qrCode && qrCodeExistsLoading) || allFormOptions.loading || createBoxMutationState.loading)
    return <APILoadingIndicator />;

  if (
    (qrCode && (!qrCodeExistsData?.qrExists || qrCodeExistsError)) ||
    allFormOptions.error ||
    !allFormOptions.data?.base
  )
    return (
      <AlertWithoutAction alertText="Could not fetch QR, Location and Product data! Please try reloading the page." />
    );

  return (
    <Center flexDirection="column" gap={4}>
      {noLocation && (
        <AlertWithoutAction
          alertText={`${baseName} needs a coordinator to create an <InStock> warehouse location before boxes can be created!`}
        />
      )}
      {noProducts && (
        <AlertWithoutAction
          alertText={`${baseName} needs a coordinator to activate products types before boxes can be created!`}
        />
      )}
      <BoxCreate
        allLocations={allLocations || []}
        productAndSizesData={allProducts || []}
        onSubmitBoxCreateForm={onSubmitBoxCreateForm}
        allTags={allTags}
        disableSubmission={noLocation || noProducts}
      />
    </Center>
  );
}

export default BoxCreateView;
