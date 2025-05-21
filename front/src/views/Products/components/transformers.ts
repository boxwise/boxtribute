import { ProductsQuery, StandardProductsforProductsViewQuery } from "queries/types";

export type StandardProductRow = {
  enabled: boolean;
  name: string;
  category: string;
  gender: string;
  sizeRange: string;
  instockItemsCount?: number;
  transferItemsCount?: number;
  inUseItemsCount?: number;
  price?: number | null;
  inShop?: boolean | null;
  comment?: string | null;
  version: number;
  enabledOn?: Date | null;
  enabledBy?: string | null;
  disabledOn?: Date | null;
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
  transferItemsCount: number;
  inUseItemsCount: number;
  price?: number | null;
  inShop?: boolean | null;
  comment?: string | null;
  lastModified?: Date | null;
  lastModifiedBy?: string | null;
  created?: Date | null;
  createdBy?: string | null;
  id: string;
  standardInstantiationId?: string;
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
          transferItemsCount: nonDeletedInstantiation?.transferItemsCount,
          inUseItemsCount: nonDeletedInstantiation
            ? nonDeletedInstantiation.instockItemsCount + nonDeletedInstantiation.transferItemsCount
            : 0,
          price: nonDeletedInstantiation?.price,
          inShop: nonDeletedInstantiation?.inShop,
          comment: nonDeletedInstantiation?.comment,
          enabledOn: nonDeletedInstantiation?.createdOn
            ? new Date(nonDeletedInstantiation.createdOn)
            : null,
          enabledBy: nonDeletedInstantiation?.createdBy?.name,
          disabledOn: nonDeletedInstantiation?.deletedOn
            ? new Date(nonDeletedInstantiation.deletedOn)
            : null,
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
  return productsRawData.products.elements
    .filter(({ deletedOn }) => !deletedOn)
    .map(
      ({
        id,
        name,
        type,
        category,
        gender,
        sizeRange,
        instockItemsCount,
        transferItemsCount,
        price,
        inShop,
        comment,
        lastModifiedOn,
        lastModifiedBy,
        createdOn,
        createdBy,
        standardProduct,
      }) => {
        return {
          id,
          standardInstantiationId: standardProduct?.id,
          name,
          isStandard: type === "StandardInstantiation",
          category: category.name,
          gender: gender === "none" || !gender ? "-" : gender,
          sizeRange: sizeRange.label,
          instockItemsCount,
          transferItemsCount,
          inUseItemsCount: instockItemsCount + transferItemsCount,
          price,
          inShop,
          comment,
          lastModified: lastModifiedOn
            ? new Date(lastModifiedOn)
            : createdOn
              ? new Date(createdOn)
              : null,
          lastModifiedBy: lastModifiedBy?.name,
          created: createdOn ? new Date(createdOn) : null,
          createdBy: createdBy?.name,
        } satisfies ProductRow;
      },
    );
};
