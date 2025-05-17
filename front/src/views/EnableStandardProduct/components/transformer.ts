import {
  enableStandardProductQueryErrorText,
  IEnableStandardProductQueryResultType,
} from "../EnableStandardProductView";
import { IEnableStandardProductFormInput } from "./EnableStandardProductForm";

export const standardProductRawToFormDataTransformer = (
  standardProductRawData: IEnableStandardProductQueryResultType,
) => {
  if (standardProductRawData.standardProducts?.__typename === "StandardProductPage") {
    return standardProductRawData.standardProducts.elements.map(
      ({ id, name, category, gender, sizeRange, instantiation }) => {
        const nonDeletedInstantiation = instantiation?.deletedOn ? undefined : instantiation;
        return {
          standardProduct: {
            label: name,
            value: id,
          },
          category: {
            label: category.name,
            value: id,
          },
          gender,
          sizeRange: {
            label: sizeRange.label,
            value: sizeRange.id,
          },
          comment: nonDeletedInstantiation?.comment ? nonDeletedInstantiation.comment : undefined,
          inShop: nonDeletedInstantiation?.inShop ? nonDeletedInstantiation.inShop : undefined,
          price: nonDeletedInstantiation?.price ? nonDeletedInstantiation.price : undefined,
        } satisfies IEnableStandardProductFormInput;
      },
    );
  } else {
    throw new Error(enableStandardProductQueryErrorText);
  }
};

export const findDefaultValues = (
  standardProductData: IEnableStandardProductFormInput[],
  requestedStandardProductId: string | undefined,
) => {
  if (!requestedStandardProductId) {
    return undefined;
  }
  const defaultValues = standardProductData.find(
    (standardProduct) => standardProduct.standardProduct.value === requestedStandardProductId,
  );

  // Handle the case where the requested standard product is not found
  if (!defaultValues) {
    throw new Error("Requested ASSORT standard product not found!");
  }
  return defaultValues;
};
