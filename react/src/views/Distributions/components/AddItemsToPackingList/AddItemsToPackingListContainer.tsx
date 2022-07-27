import AddItemsToPackingList, {
  PackingListEntriesForProductToAdd,
  ProductAndSizesData,
} from "./AddItemsToPackingList";
import {
  AllProductsAndSizesQuery,
  AllProductsAndSizesQueryVariables,
} from "types/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";

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

type Product = AllProductsAndSizesQuery["products"]["elements"][0];

const graphqlToContainerTransformer = (
  graphQLData: Product[]
): ProductAndSizesData[] => {

  return (
    graphQLData
      // TODO (IMPORTANT): Remove this fitler call again - was just temporary for dev/demo purposes
      // to show products which have at least two sizes
      // Instead, we should adapt the init.sql file to have better test data
      .filter((product) => product.sizeRange.sizes.length > 1)
      .map((product) => {
        return {
          id: product.id,
          name: product.name,
          sizes: product.sizeRange.sizes.map((size) => ({
            id: size.id,
            name: size.label,
          })),
        };
      })
  );

};

const AddItemsToPackingListContainer = ({
  onAddEntiresToPackingListForProduct,
}: AddItemsToPackingListContainerProps) => {
  const { loading, data } = useQuery<
    AllProductsAndSizesQuery,
    AllProductsAndSizesQueryVariables
  >(ALL_PRODUCTS_AND_SIZES_QUERY);

  if (loading) {
    return <APILoadingIndicator />;
  }

  const productAndSizesData = data?.products?.elements
    ? graphqlToContainerTransformer(data?.products?.elements)
    : [];

  // TODO: also handle error case here

  return (
    <AddItemsToPackingList
      onAddEntiresToPackingListForProduct={onAddEntiresToPackingListForProduct}
      productAndSizesData={productAndSizesData}
    />
  );
};

export default AddItemsToPackingListContainer;
