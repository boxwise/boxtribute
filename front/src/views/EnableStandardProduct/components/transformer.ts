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
        } as IEnableStandardProductFormInput;
      },
    );
  } else {
    throw new Error(enableStandardProductQueryErrorText);
  }
};
