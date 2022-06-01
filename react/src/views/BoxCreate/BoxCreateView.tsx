import { gql, useMutation, useQuery } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AllProductsQuery,
  AllProductsQueryVariables,
  CreateBoxMutation,
  CreateBoxMutationVariables,
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
    $qrCode: String
  ) {
    createBox(
      creationInput: {
        productId: $productId
        sizeId: $sizeId
        locationId: $locationId
        items: $items
        comment: $comment
        qrCode: $qrCode
      }
    ) {
      labelIdentifier
    }
  }
`;

const BoxCreateView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast()
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
    if(createBoxMutationResult.data?.createBox?.labelIdentifier != null) {
              navigate(
          `/bases/${baseId}/boxes/${createBoxMutationResult.data?.createBox?.labelIdentifier}`
        );
    }
  }, [baseId, createBoxMutationResult.data?.createBox?.labelIdentifier, navigate]);

  useEffect(() => {
    if(createBoxMutationResult.error != null) {
      // alert(JSON.stringify(createBoxMutationResult.error))
      // console.log(JSON.stringify(createBoxMutationResult.error))
      console.table(createBoxMutationResult.error)
      toast({
        title: `Error while trying to create the Box`,
        status: "error",
        isClosable: true,
      })
    }
  }, [createBoxMutationResult.error]);

  const onSubmitBoxCreateForm = (boxFormValues: BoxFormValues) => {
    const createBoxMutationVariables: CreateBoxMutationVariables = {
        productId: parseInt(boxFormValues.productForDropdown.value),
        // locationId: parseInt(boxFormValues.locationForDropdown.value),
        locationId: 16,
        // sizeId: parseInt(boxFormValues.sizeForDropdown?.value),
        sizeId: 1,
        items: 99,
        comment: "", 
        qrCode: qrCode
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
  // return <></>
};

export default BoxCreateView;
