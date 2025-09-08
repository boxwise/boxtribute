import { z } from "zod";

import { StandardProductQueryResultType } from "queries/types";
import { enableStandardProductQueryErrorText } from "../EnableStandardProductView";
import { EnableStandardProductFormInput } from "./EnableStandardProductForm";

const SingleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const StandardProductFormSchema = z.object({
  // see BoxEdit.tsx how to validate a select field
  instantiation: z.object({ value: z.string(), label: z.string() }),
  standardProduct: z.object(
    { value: z.string(), label: z.string() },
    {
      error: (issue) =>
        issue.input === undefined ? "Please select a standard product." : undefined,
    },
  ),
  category: SingleSelectOptionSchema.optional(),
  gender: z.string().optional(),
  sizeRange: SingleSelectOptionSchema.optional(),
  comment: z.string().optional(),
  inShop: z.boolean().optional(),
  price: z.int().nonnegative().optional(),
});

export const standardProductRawToFormDataTransformer = (
  standardProductRawData: StandardProductQueryResultType,
) => {
  if (standardProductRawData.standardProducts?.__typename === "StandardProductPage") {
    return standardProductRawData.standardProducts.elements.map(
      ({ id, name, category, gender, sizeRange, instantiation }) => {
        const nonDeletedInstantiation = instantiation?.deletedOn ? undefined : instantiation;
        return {
          instantiation: {
            label: name,
            value: instantiation?.id || "",
          },
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
        } satisfies EnableStandardProductFormInput;
      },
    );
  } else {
    throw new Error(enableStandardProductQueryErrorText);
  }
};

export const findDefaultValues = (
  standardProductData: EnableStandardProductFormInput[],
  requestedStandardProductId: string | undefined,
) => {
  if (!requestedStandardProductId) return undefined;

  const defaultValues = standardProductData.find(
    (standardProduct) => standardProduct.standardProduct.value === requestedStandardProductId,
  );

  // Handle the case where the requested standard product is not found
  if (!defaultValues) throw new Error("Requested ASSORT standard product not found!");

  return defaultValues;
};
