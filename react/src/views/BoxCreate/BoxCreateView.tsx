import { gql, useMutation, useQuery } from "@apollo/client";
import { Center } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AllProductsAndLocationsForBaseQuery,
  AllProductsAndLocationsForBaseQueryVariables,
  CreateBoxMutation,
  CreateBoxMutationVariables,
} from "types/generated/graphql";
import BoxCreate, { CreateBoxData } from "./components/BoxCreate";

export const CREATE_BOX_MUTATION = gql`
  mutation CreateBox(
    $locationId: Int!
    $productId: Int!
    $sizeId: Int!
    $numberOfItems: Int!
    $qrCode: String
  ) {
    createBox(
      creationInput: {
        locationId: $locationId
        productId: $productId
        items: $numberOfItems
        sizeId: $sizeId
        qrCode: $qrCode
      }
    ) {
      labelIdentifier
    }
  }
`;

export const ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY = gql`
  query AllProductsAndLocationsForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        id
        name
      }

      products {
        id
        name
        gender
        category {
          name
        }
        sizeRange {
          sizes {
            id
            label
          }
        }
      }
    }
  }
`;

const BoxCreateView = () => {
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

  const onSubmitBoxCreateForm = (createBoxData: CreateBoxData) => {
    createBoxMutation({
      variables: {
        locationId: parseInt(createBoxData.locationId),
        productId: parseInt(createBoxData.productId),
        sizeId: parseInt(createBoxData.sizeId),
        numberOfItems: createBoxData.numberOfItems,
        qrCode,
      },
    })
      .then((mutationResult) => {
        navigate(
          `/bases/${baseId}/boxes/${mutationResult.data?.createBox?.labelIdentifier}`
        );
      })
      .catch((error) => {
        console.error("Error while trying to create Box", error);
      });
  };

  if (loading || createBoxMutationState.loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error("Error while trying to fetch all products", error);
    return <div>Error</div>;
  }

  const allProducts = data?.base?.products;
  const allLocations = data?.base?.locations.map((location) => ({
    ...location,
    name: location.name ?? "",
  }));

  if (allLocations == null) {
    console.error("allLocations is null");
    return <div>Error: no locations available to choose from</div>;
  }

  if (allProducts == null) {
    console.error("allProducts.elements is null");
    return <div>Error: no products available to choose from</div>;
  }

  return (
    <Center>
      <BoxCreate
        allLocations={allLocations}
        productAndSizesData={allProducts}
        onCreateBox={onSubmitBoxCreateForm}
        qrCode={qrCode}
      />
    </Center>
  );
};

export default BoxCreateView;
