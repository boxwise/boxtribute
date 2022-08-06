import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  AllProductsAndLocationsForBaseQuery,
  AllProductsAndLocationsForBaseQueryVariables,
  CreateBoxMutation,
  CreateBoxMutationVariables,
} from "types/generated/graphql";
import BoxCreate, { CreateBoxData } from "./components/BoxCreate";

export const ALL_PRODUCTS_QUERY = gql`
  query AllProductsAndLocationsForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        id
        name
      }
    }

    products(paginationInput: { first: 500 }) {
      elements {
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

const BoxCreateView = () => {
  const baseId = useParams<{ baseId: string }>().baseId!;
  const { loading, error, data } = useQuery<
    AllProductsAndLocationsForBaseQuery,
    AllProductsAndLocationsForBaseQueryVariables
  >(ALL_PRODUCTS_QUERY, {
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
    console.log("boxFormValues", createBoxData);

    createBoxMutation({
      variables: {
        locationId: parseInt(createBoxData.locationId),
        productId: parseInt(createBoxData.productId),
        sizeId: parseInt(createBoxData.sizeId),
        numberOfItems: createBoxData.numberOfItems,
      },
    })
      .then((mutationResult) => {
        navigate(
          `/bases/${baseId}/boxes/${mutationResult.data?.createBox?.labelIdentifier}`
        );
      })
      .catch((error) => {
        console.log("Error while trying to create Box", error);
      });
  };

  if (loading || createBoxMutationState.loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error("Error while trying to fetch all products", error);
    return <div>Error</div>;
  }

  const allProducts = data?.products;
  const allLocations = data?.base?.locations.map((location) => ({
    ...location,
    name: location.name ?? "",
  }));

  if (allLocations == null) {
    console.error("allLocations is null");
    return <div>Error: no locations available to choose from</div>;
  }

  if (allProducts?.elements == null) {
    console.error("allProducts.elements is null");
    return <div>Error: no products available to choose from</div>;
  }

  return (
    <BoxCreate
      allLocations={allLocations}
      productAndSizesData={allProducts?.elements}
      onCreateBox={onSubmitBoxCreateForm}
    />
  );
};

export default BoxCreateView;
