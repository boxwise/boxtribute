import { StandardProductsforProductsViewQuery } from "queries/types";

export type ProductRow = {
  enabled: boolean;
  name: string;
  category: string;
  gender: string;
  size: string;
  instockItemsCount?: number;
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
      ({ id, name, category, gender, instantiation, sizeRange, version }) =>
        ({
          id,
          enabled: instantiation?.instockItemsCount !== undefined,
          name,
          category: category.name,
          gender,
          size: sizeRange.label,
          instockItemsCount: instantiation?.instockItemsCount,
          enabledOn: instantiation?.createdOn,
          enabledBy: instantiation?.createdBy?.name,
          disabledOn: instantiation?.deletedOn,
          version,
          instantiationId: instantiation?.id,
        }) satisfies ProductRow,
    );
  } else {
    throw new Error("Could not fetch products data! Please try reloading the page.");
  }
};
