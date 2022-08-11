import { gql, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { AllProductsForPackingListQuery, AllProductsForPackingListQueryVariables, ProductGender } from "types/generated/graphql";
import { IPackingListEntry } from "views/Distributions/types";
import AddItemsToPackingList, {
  ProductData
} from "./AddItemsToPackingList";

interface AddItemsToPackingListContainerProps {
  // onAddEntiresToPackingListForProduct: (
  //   entriesToAdd: PackingListEntriesForProductToAdd
  // ) => void;
  onClose: () => void;
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
};

const AddItemsToPackingListContainer = ({
  // onAddEntiresToPackingListForProduct,
  onClose,
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
    onClose={onClose}
      // onAddEntiresToPackingListForProduct={onAddEntiresToPackingListForProduct}
      productData={productAndSizesData}
      packingListEntries={currentPackingListEntries}
    />
  );
};

export default AddItemsToPackingListContainer;
