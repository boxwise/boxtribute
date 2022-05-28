import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AllProductsQuery,
  AllProductsQueryVariables,
  BoxByLabelIdentifierAndAllProductsQuery,
  BoxByLabelIdentifierAndAllProductsQueryVariables,
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

export const UPDATE_CONTENT_OF_BOX_MUTATION = gql`
  mutation UpdateContentOfBox($boxLabelIdentifier: String!, $productId: Int!) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        productId: $productId
      }
    ) {
      labelIdentifier
    }
  }
`;

const BoxCreateView = () => {
  const [searchParams] = useSearchParams();
  const qrCode = searchParams.get("qrCode");
  // alert(qrCode.get("qrCode"));

  const { loading, data } = useQuery<
    AllProductsQuery,
    AllProductsQueryVariables
  >(ALL_PRODUCTS_QUERY);
  // const baseId = useParams<{ baseId: string }>().baseId;
  const navigate = useNavigate();

  // const [updateContentOfBoxMutation] = useMutation<
  //   UpdateContentOfBoxMutation,
  //   UpdateContentOfBoxMutationVariables
  // >(UPDATE_CONTENT_OF_BOX_MUTATION);

  const onSubmitBoxCreateForm = (boxFormValues: BoxFormValues) => {
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

  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  const allProducts = data?.products;

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
