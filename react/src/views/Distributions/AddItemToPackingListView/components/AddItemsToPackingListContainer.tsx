import {
  Button,
  Flex,
  FormControl,
  Select,
  WrapItem,
  Box,
  Input,
  Text,
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import AddItemsToPackingList, {
  PackingListEntriesForProductToAdd, ProductAndSizesData,
} from "./AddItemsToPackingList";
import {
  AllProductsAndSizesQuery,
  AllProductsAndSizesQueryVariables,
} from "types/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { groupBy } from "utils/helpers";

// interface SizeIdAndNameTuple {
//   id: string;
//   name: string;
// }
// interface SizeAndNumberOfItemsFormTuple {
//   size: SizeIdAndNameTuple;
//   numberOfItemsAsString: string;
// }

// interface ItemToAddFormValues {
//   productId: string;
//   sizeAndNumberOfItemsTuples: SizeAndNumberOfItemsFormTuple[];
// }

// export type ProductData = {
//   id: string;
//   name: string;
//   sizes: SizeIdAndNameTuple[];
// };

// export interface SizeIdAndNumberOfItemTuple {
//   sizeId: string;
//   numberOfItems: number;
// }
// export interface PackingListEntriesForProductToAdd {
//   productId: string;
//   sizeIdAndNumberOfItemTuples: SizeIdAndNumberOfItemTuple[];
// }

interface AddItemsToPackingListContainerProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProductToAdd
  ) => void;
}

export const ALL_PRODUCTS_AND_SIZES_QUERY = gql`
  query AllProductsAndSizes {
    products(paginationInput: { first: 1000 }) {
      elements {
        id
        name
        gender
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

type Product = AllProductsAndSizesQuery['products']['elements'][0];

const graphqlToContainerTransformer = (graphQLData: Product[]): ProductAndSizesData[] => {
  // const groupedByProductId = groupBy<Product, string>(graphQLData, product => product.id);
  // Object.keys(groupedByProductId).map(productId => {
  //   const  = groupedByProductId[productId];
  //   return {
  //     id: productId,
  //     products
  // })

  return graphQLData
  // TODO (IMPORTANT): Remove this fitler call again - was just temporary for dev/demo purposes
  // to show products which have at least two sizes
  .filter(product => product.sizeRange.sizes.length > 1)
  .map(product => {
    return {
      id: product.id,
      name: product.name,
      sizes: product.sizeRange.sizes.map(size => ({
        id: size.id,
        name: size.label
      }))
    }
  });

  // return [];
}

const AddItemsToPackingListContainer = ({
  onAddEntiresToPackingListForProduct,
}: AddItemsToPackingListContainerProps) => {
  const { loading, error, data } = useQuery<
    AllProductsAndSizesQuery,
    AllProductsAndSizesQueryVariables
  >(ALL_PRODUCTS_AND_SIZES_QUERY);


  if(loading) {
    return <APILoadingIndicator />
  }

  const productAndSizesData = data?.products?.elements ? graphqlToContainerTransformer(data?.products?.elements) : [];

  // TODO: also handle error case here

  return (
    <AddItemsToPackingList
      onAddEntiresToPackingListForProduct={() =>
        alert("onAddEntiresToPackingListForProduct")
      }
      productAndSizesData={productAndSizesData}
    />
  );
};

export default AddItemsToPackingListContainer;
