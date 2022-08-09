import AddItemsToPackingList, {
  PackingListEntriesForProductToAdd,
  ProductData,
  ProductDataWithPackingListEntryFlags,
} from "./AddItemsToPackingList";
import { AllProductsForPackingListQuery, AllProductsForPackingListQueryVariables, ProductGender } from "types/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { IPackingListEntry } from "views/Distributions/types";

interface AddItemsToPackingListContainerProps {
  onAddEntiresToPackingListForProduct: (
    entriesToAdd: PackingListEntriesForProductToAdd
  ) => void;
  currentPackingListEntries: IPackingListEntry[];
}

export const ALL_PRODUCTS_FOR_PACKING_LIST = gql`
  query AllProductsForPackingList {
    products(paginationInput: { first: 1000 }) {
      elements {
        id
        name
        gender
        category {
        id
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

type Product = AllProductsForPackingListQuery["products"]["elements"][0];

const graphqlToContainerTransformer = (
  graphQLData: Product[],
  currentPackingListEntries: IPackingListEntry[]
): ProductData[] => {

  return graphQLData.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    gender: product.gender ?? ProductGender.None
  }));

  // return graphQLData.map(product => {
  //   product.
  //   return {
  //     id: product.id,
  //     name: product.name,
  //     category: product?.category,
  //     gender: product?.gender
  //   }
  // });

  // return (
  //   graphQLData
  //     // TODO (IMPORTANT): Remove this fitler call again - was just temporary for dev/demo purposes
  //     // to show products which have at least two sizes
  //     // Instead, we should adapt the init.sql file to have better test data
  //     .filter((product) => product.sizeRange.sizes.length > 1)
  //     .map((product) => {
  //       return {
  //         id: product.id,
  //         name: product.name,
  //         sizes: product.sizeRange.sizes.map((size) => {
  //         const numberOfItems = currentPackingListEntries.find(el => el.product.id === product.id && el.size?.id === size.id)?.numberOfItems;
  //           return {
  //           id: size.id,
  //           name: size.label,
  //           numberOfItems
  //           }}),
  //       };
  //     })
  // );

};

const AddItemsToPackingListContainer = ({
  onAddEntiresToPackingListForProduct,
  currentPackingListEntries
}: AddItemsToPackingListContainerProps) => {
  const { loading, data } = useQuery<
  AllProductsForPackingListQuery,
  AllProductsForPackingListQueryVariables
  >(ALL_PRODUCTS_FOR_PACKING_LIST);

  if (loading) {
    return <APILoadingIndicator />;
  }

  const productAndSizesData = data?.products?.elements
    ? graphqlToContainerTransformer(data?.products?.elements, currentPackingListEntries)
    : [];

  // TODO: also handle error case here

  return (
    <AddItemsToPackingList
      onAddEntiresToPackingListForProduct={onAddEntiresToPackingListForProduct}
      productData={productAndSizesData}
      packingListEntries={currentPackingListEntries}
    />
  );
};

export default AddItemsToPackingListContainer;
