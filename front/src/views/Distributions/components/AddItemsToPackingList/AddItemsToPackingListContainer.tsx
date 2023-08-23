import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  AllProductsForPackingListQuery,
  AllProductsForPackingListQueryVariables,
  ProductGender,
} from "types/generated/graphql";
import { ALL_PRODUCTS_FOR_PACKING_LIST } from "views/Distributions/queries";
import { IPackingListEntry, Product } from "views/Distributions/types";
import AddItemsToPackingList, {
  ProductDataForPackingList,
} from "./AddItemsToPackingList";

interface AddItemsToPackingListContainerProps {
  // onAddEntiresToPackingListForProduct: (
  //   entriesToAdd: PackingListEntriesForProductToAdd
  // ) => void;
  onClose: () => void;
  currentPackingListEntries: IPackingListEntry[];
}

const graphqlToContainerTransformer = (
  graphQLData: Product[],
  currentPackingListEntries: IPackingListEntry[]
): ProductDataForPackingList[] => {
  return graphQLData.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    gender: product.gender ?? ProductGender.None,
  }));
};

const AddItemsToPackingListContainer = ({
  // onAddEntiresToPackingListForProduct,
  onClose,
  currentPackingListEntries,
}: AddItemsToPackingListContainerProps) => {
  const baseId = useParams<{ baseId: string }>().baseId!;

  const { loading, data } = useQuery<
    AllProductsForPackingListQuery,
    AllProductsForPackingListQueryVariables
  >(ALL_PRODUCTS_FOR_PACKING_LIST, {
    variables: {
      baseId,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  const productAndSizesData = data?.base?.products
    ? graphqlToContainerTransformer(
        data?.base?.products,
        currentPackingListEntries
      )
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
