import { ProductsQuery, StandardProductsforProductsViewQuery } from "queries/types";

export type StandardProductRow = {
  enabled: boolean;
  name: string;
  category: string;
  gender: string;
  sizeRange: string;
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

export type ProductRow = {
  name: string;
  isStandard: boolean;
  category: string;
  gender: string;
  sizeRange: string;
  instockItemsCount: number;
  price?: number | null;
  inShop?: boolean | null;
  comment?: string | null;
  lastModified?: string | null;
  lastModifiedBy?: string | null;
  created?: string | null;
  createdBy?: string | null;
  id: string;
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
          sizeRange: sizeRange.label,
          instockItemsCount: nonDeletedInstantiation?.instockItemsCount,
          price: nonDeletedInstantiation?.price,
          inShop: nonDeletedInstantiation?.inShop,
          comment: nonDeletedInstantiation?.comment,
          enabledOn: nonDeletedInstantiation?.createdOn,
          enabledBy: nonDeletedInstantiation?.createdBy?.name,
          disabledOn: nonDeletedInstantiation?.deletedOn,
          version,
          instantiationId: nonDeletedInstantiation?.id,
        } satisfies StandardProductRow;
      },
    );
  } else {
    throw new Error("Could not fetch standard products data! Please try reloading the page.");
  }
};

export const productsRawToTableDataTransformer = (productsRawData: ProductsQuery) => {
  return productsRawData.products.elements.map(
    ({
      id,
      name,
      type,
      category,
      gender,
      sizeRange,
      instockItemsCount,
      price,
      inShop,
      comment,
      lastModifiedOn,
      lastModifiedBy,
      createdOn,
      createdBy,
    }) => {
      return {
        id,
        name,
        isStandard: type === "StandardInstantiation",
        category: category.name,
        gender: gender === "none" || !gender ? "-" : gender,
        sizeRange: sizeRange.label,
        instockItemsCount: instockItemsCount,
        price: price,
        inShop: inShop,
        comment: comment,
        lastModified: lastModifiedOn,
        lastModifiedBy: lastModifiedBy?.name,
        created: createdOn,
        createdBy: createdBy?.name,
      } satisfies ProductRow;
    },
  );
};
