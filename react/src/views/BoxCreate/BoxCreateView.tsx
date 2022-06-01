import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AllProductsQuery,
  AllProductsQueryVariables,
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
  CreateBoxMutation,
  CreateBoxMutationVariables,
  UpdateContentOfBoxMutation,
  UpdateContentOfBoxMutationVariables,
} from "types/generated/graphql";
import BoxCreate, { BoxFormValues } from "./components/BoxCreate";

export const ALL_PRODUCTS_QUERY = gql`
  query AllProducts {
    products(paginationInput: { first: 500 }) {
      elements {
        id
        name
        gender
        category {
          name
        }
        sizeRange {
          label
        }
      }
    }
  }
`;

export const CREATE_BOX_MUTATION = gql`
  mutation CreateBox(
    $productId: Int!
    $sizeId: Int!
    $locationId: Int!
    $items: Int!
    $comment: String!
  ) {
    createBox(
      creationInput: {
        productId: $productId
        sizeId: $sizeId
        locationId: $locationId
        items: $items
        comment: $comment
      }
    ) {
      labelIdentifier
    }
  }
`;

const BoxCreateView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;


  const allProductsQueryResult = useQuery<
    AllProductsQuery,
    AllProductsQueryVariables
  >(ALL_PRODUCTS_QUERY);

  const [createBoxMutation, createBoxMutationResult] = useMutation<
    CreateBoxMutation,
    CreateBoxMutationVariables
  >(CREATE_BOX_MUTATION);


  const qrCode = searchParams.get("qrCode");

  useEffect(() => {
    if(createBoxMutationResult.data?.createBox?.labelIdentifier) {
              navigate(
          `/bases/${baseId}/boxes/${createBoxMutationResult.data?.createBox?.labelIdentifier}`
        );
    }
  }, [baseId, createBoxMutationResult.data?.createBox?.labelIdentifier, navigate]);

  const onSubmitBoxCreateForm = (boxFormValues: BoxFormValues) => {
    const createBoxMutationVariables: CreateBoxMutationVariables = {
        productId: parseInt(boxFormValues.productForDropdown.value),
        // locationId: parseInt(boxFormValues.locationForDropdown.value),
        locationId: 16,
        // sizeId: parseInt(boxFormValues.sizeForDropdown?.value),
        sizeId: 1,
        items: 99,
        comment: ""
        // items: parseInt(boxFormValues.items),
    };
    createBoxMutation({
      variables: createBoxMutationVariables
    });

    // updateContentOfBoxMutation({
    //   variables: {
    //     // boxLabelIdentifier: labelIdentifier,
    //     productId: parseInt(boxFormValues.productForDropdown.value),
    //   },
    // })
    //   .then((mutationResult) => {
    //     navigate(
    //       `/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`
    //     );
    //   })
    //   .catch((error) => {
    //     console.log("Error while trying to update Box", error);
    //   });
  };

  if (allProductsQueryResult.loading) {
    return <div>Loading...</div>;
  }
  const allProducts = allProductsQueryResult.data?.products;

  if (allProducts?.elements == null) {
    console.error("allProducts.elements is null");
    return <div>Error: no products available to choose from for this Box</div>;
  }

  return (
    <BoxCreate
      allProducts={allProducts?.elements}
      qrCode={qrCode}
      onSubmitBoxCreateForm={onSubmitBoxCreateForm}
    />
  );
};

export default BoxCreateView;
