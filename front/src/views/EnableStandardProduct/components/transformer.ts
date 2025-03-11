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
      ({ id, name, category, gender, sizeRange, instantiation }) =>
        ({
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
          comment: instantiation?.comment ? instantiation.comment : undefined,
          inShop: instantiation?.inShop ? instantiation.inShop : undefined,
          price: instantiation?.price ? instantiation.price : undefined,
        }) as IEnableStandardProductFormInput,
    );
  } else {
    throw new Error(enableStandardProductQueryErrorText);
  }
};
