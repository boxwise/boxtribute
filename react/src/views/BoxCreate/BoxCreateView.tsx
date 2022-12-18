import { useEffect } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Center } from "@chakra-ui/react";
import { useErrorHandling } from "utils/error-handling";
import APILoadingIndicator from "components/APILoadingIndicator";
import { notificationVar } from "components/NotificationMessage";
import { useNavigate, useParams } from "react-router-dom";
import {
  AllProductsAndLocationsForBaseQuery,
  AllProductsAndLocationsForBaseQueryVariables,
  BoxState,
  CreateBoxMutation,
  CreateBoxMutationVariables,
  CheckIfQrExistsInDbQuery,
  CheckIfQrExistsInDbQueryVariables,
} from "types/generated/graphql";
import { PRODUCT_FIELDS_FRAGMENT, TAG_OPTIONS_FRAGMENT } from "utils/fragments";
import { CHECK_IF_QR_EXISTS_IN_DB } from "utils/queries";
import BoxCreate, { ICreateBoxFormData } from "./components/BoxCreate";

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
        name
        seq
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
    }
  }
`;

function BoxCreateView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();

  // variables in URL
  const baseId = useParams<{ baseId: string }>().baseId!;
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
    variables: {
      baseId,
    },
  });

  // Mutation after form submission
  const [createBoxMutation, createBoxMutationState] = useMutation<
    CreateBoxMutation,
    CreateBoxMutationVariables
  >(CREATE_BOX_MUTATION);

  // Check the QR Code
  useEffect(() => {
    if (qrCodeExists.data?.qrExists === false) {
      notificationVar({
        title: "Error",
        type: "error",
        message: "The QR-Code is not from Boxtribute!",
      });
    }
    // TODO: Add check if Qr-Code is associated to a Box
  }, [qrCodeExists]);

  // Prep data for Form
  const allTags = allFormOptions.data?.base?.tags;
  const allProducts = allFormOptions.data?.base?.products;
  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const allLocations = allFormOptions.data?.base?.locations
    .filter(
      (location) =>
        location?.defaultBoxState !== BoxState.Lost && location?.defaultBoxState !== BoxState.Scrap,
    )
    .map((location) => ({
      ...location,
      name: location.name ?? "",
    }));

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
          triggerError({
            message: "Error while trying to create Box",
          });
        } else {
          notificationVar({
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
  if (qrCodeExists.loading || allFormOptions.loading || createBoxMutationState.loading) {
    return <APILoadingIndicator />;
  }

  // TODO: handle errors not with empty div, but forward or roll data back in the view
  if (
    !qrCodeExists.data?.qrExists ||
    qrCodeExists.error ||
    allLocations === undefined ||
    allProducts === undefined
  ) {
    return <div />;
  }

  return (
    <Center>
      <BoxCreate
        allLocations={allLocations}
        productAndSizesData={allProducts}
        onSubmitBoxCreateForm={onSubmitBoxCreateForm}
        allTags={allTags}
      />
    </Center>
  );
}

export default BoxCreateView;
