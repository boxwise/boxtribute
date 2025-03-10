import {
  enableStandardProductQueryErrorText,
  IEnableStandardProductQueryResultType,
} from "../EnableStandardProductView";
import { IStandardProductInfoInput } from "./EnableStandardProductForm";

export const standardProductRawToInfoTransformer = (
  standardProductRawData: IEnableStandardProductQueryResultType,
) => {
  if (standardProductRawData.standardProduct?.__typename === "StandardProduct") {
    return {
      productName: standardProductRawData.standardProduct.name,
      category: {
        label: standardProductRawData.standardProduct.category.name,
        value: standardProductRawData.standardProduct.category.id,
      },
      gender: standardProductRawData.standardProduct.gender,
      sizeRange: {
        label: standardProductRawData.standardProduct.sizeRange.label,
        value: standardProductRawData.standardProduct.sizeRange.id,
      },
    } as IStandardProductInfoInput;
  } else {
    throw new Error(enableStandardProductQueryErrorText);
  }
};
