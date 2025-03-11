import { StandardProductsforProductsViewQuery } from "queries/types";

export type ProductRow = {
  enabled: boolean;
  name: string;
  category: string;
  gender: string;
  size: string;
  instockItemsCount?: number;
  price?: number | null;
  inShop?: boolean | null;
  comment?: string | null;
  version: number;
  enabledOn?: string | null;
  enabledBy?: string | null;
  disabledOn?: string | null;
  id: string;
  instantiationId?: string;
};

export const standardProductsRawDataToTableDataTransformer = (
  standardProductQueryResult: StandardProductsforProductsViewQuery,
) => {
  if (standardProductQueryResult.standardProducts?.__typename === "StandardProductPage") {
    return standardProductQueryResult.standardProducts.elements.map(
      ({ id, name, category, gender, instantiation, sizeRange, version }) => {
        const nonDeletedInstantiation = instantiation?.deletedOn ? null : instantiation;
        return {
          id,
          enabled: nonDeletedInstantiation?.instockItemsCount !== undefined,
          name,
          category: category.name,
          gender: gender === "none" ? "-" : gender,
          size: sizeRange.label,
          instockItemsCount: nonDeletedInstantiation?.instockItemsCount,
          price: nonDeletedInstantiation?.price,
          inShop: nonDeletedInstantiation?.inShop,
          comment: nonDeletedInstantiation?.comment,
          enabledOn: nonDeletedInstantiation?.createdOn,
          enabledBy: nonDeletedInstantiation?.createdBy?.name,
          disabledOn: nonDeletedInstantiation?.deletedOn,
          version,
          instantiationId: nonDeletedInstantiation?.id,
        } satisfies ProductRow;
      },
    );
  } else {
    throw new Error("Could not fetch products data! Please try reloading the page.");
  }
};
