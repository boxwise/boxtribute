import { gql, useMutation, useQuery } from "@apollo/client";
import { Center } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { notificationVar } from "components/NotificationMessage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AllProductsAndLocationsForBaseQuery,
  AllProductsAndLocationsForBaseQueryVariables,
  BoxState,
  CreateBoxMutation,
  CreateBoxMutationVariables,
} from "types/generated/graphql";
import { PRODUCT_FIELDS_FRAGMENT, TAG_OPTIONS_FRAGMENT } from "utils/fragments";
import BoxCreate, { ICreateBoxFormData } from "./components/BoxCreate";

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

export const ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY = gql`
  ${TAG_OPTIONS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  query AllProductsAndLocationsForBase($baseId: ID!) {
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
        seq
      }

      products {
        ...ProductFields
      }
    }
  }
`;

function BoxCreateView() {
  const baseId = useParams<{ baseId: string }>().baseId!;
  const [searchParams] = useSearchParams();
  const qrCode = searchParams.get("qrCode") as string | undefined;

  const { loading, error, data } = useQuery<
    AllProductsAndLocationsForBaseQuery,
    AllProductsAndLocationsForBaseQueryVariables
  >(ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY, {
    variables: {
      baseId,
    },
  });
  const navigate = useNavigate();

  const [createBoxMutation, createBoxMutationState] = useMutation<
    CreateBoxMutation,
    CreateBoxMutationVariables
  >(CREATE_BOX_MUTATION);

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
          notificationVar({
            title: "Box Create",
            type: "error",
            message: "Error while trying to create Box",
          });
        } else {
          notificationVar({
            title: `Box ${mutationResult.data?.createBox?.labelIdentifier}`,
            type: "success",
            message: `Successfully created with ${
              (data?.base?.products.find((p) => p.id === createBoxData.productId.value) as any).name
            } (${createBoxData?.numberOfItems}x) in ${
              (data?.base?.locations.find((l) => l.id === createBoxData.locationId.value) as any)
                .name
            }.`,
          });
          navigate(`/bases/${baseId}/boxes/${mutationResult.data?.createBox?.labelIdentifier}`);
        }
      })
      .catch((err) => {
        notificationVar({
          title: "Box Create",
          type: "error",
          message: `Error - Code ${err.code}: Your changes could not be saved!`,
        });
      });
  };

  if (loading || createBoxMutationState.loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "Error: The available products could not be loaded!",
    });
  }

  const allTags = data?.base?.tags || null;

  const allProducts = data?.base?.products;
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
    notificationVar({
      title: "Error",
      type: "error",
      message: "Error: No other locations are visible!",
    });
    return <div />;
  }

  if (allProducts == null) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "Error: The available products could not be loaded!",
    });
    return <div />;
  }

  return (
    <Center>
      <BoxCreate
        allLocations={allLocations}
        productAndSizesData={allProducts}
        onSubmitBoxCreateForm={onSubmitBoxCreateForm}
        allTags={allTags}
        qrCode={qrCode}
      />
    </Center>
  );
}

export default BoxCreateView;
