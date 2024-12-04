import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import {
  AllProductsAndLocationsForBaseQuery,
  AllProductsAndLocationsForBaseQueryVariables,
  BoxState,
  CreateBoxMutation,
  CreateBoxMutationVariables,
  CheckIfQrExistsInDbQuery,
  CheckIfQrExistsInDbQueryVariables,
} from "types/generated/graphql";
import { TAG_OPTIONS_FRAGMENT, PRODUCT_FIELDS_FRAGMENT } from "queries/fragments";
import { CHECK_IF_QR_EXISTS_IN_DB } from "queries/queries";
import BoxCreate, { ICreateBoxFormData } from "./components/BoxCreate";
import { AlertWithoutAction } from "components/Alerts";
import { selectedBaseAtom, selectedBaseIdAtom } from "stores/globalPreferenceStore";

// TODO: Create fragment or query for ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY
export const ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY = gql`
  ${TAG_OPTIONS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  query AllProductsAndLocationsForBase($baseId: ID!) {
    base(id: $baseId) {
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
`;

export const CREATE_BOX_MUTATION = gql`
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
      labelIdentifier
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
`;

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
  const qrCodeExists = useQuery<CheckIfQrExistsInDbQuery, CheckIfQrExistsInDbQueryVariables>(
    CHECK_IF_QR_EXISTS_IN_DB,
    {
      variables: { qrCode },
    },
  );

  // Query Data for the Form
  const allFormOptions = useQuery<
    AllProductsAndLocationsForBaseQuery,
    AllProductsAndLocationsForBaseQueryVariables
  >(ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY, {
    variables: { baseId },
  });

  // Mutation after form submission
  const [createBoxMutation, createBoxMutationState] = useMutation<
    CreateBoxMutation,
    CreateBoxMutationVariables
  >(CREATE_BOX_MUTATION);

  // Check the QR Code
  useEffect(() => {
    if (qrCodeExists.data?.qrExists === false) {
      createToast({
        title: "Error",
        type: "error",
        message: "The QR-Code is not from Boxtribute!",
      });
    }
    // TODO: Add check if Qr-Code is associated to a Box
  }, [createToast, qrCodeExists]);

  // Prep data for Form
  const allTags = allFormOptions.data?.base?.tags;
  const allProducts = allFormOptions.data?.base?.products;
  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = allFormOptions.data?.base?.locations
    .filter((location) => location?.defaultBoxState !== BoxState.Lost)
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
              (
                allFormOptions.data?.base?.products.find(
                  (p) => p.id === createBoxData.productId.value,
                ) as any
              ).name
            } (${createBoxData?.numberOfItems}x) in ${
              (
                allFormOptions.data?.base?.locations.find(
                  (l) => l.id === createBoxData.locationId.value,
                ) as any
              ).name
            }.`,
          });
          navigate(
            `/bases/${selectedBase?.id}/boxes/${mutationResult.data?.createBox?.labelIdentifier}`,
          );
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
  if (qrCodeExists.loading || allFormOptions.loading || createBoxMutationState.loading)
    return <APILoadingIndicator />;

  if (
    !qrCodeExists.data?.qrExists ||
    qrCodeExists.error ||
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
