import { useReactiveVar } from '@apollo/client/react';
import { Wrap, WrapItem } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import { IFilterValue } from "./ValueFilter";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import {
  IProductFilterValue,
  productFilterValuesVar,
  ICategoryFilterValue,
  categoryFilterValuesVar,
} from "../../state/filter";
import { Product } from "../../../../graphql/types";

export const genders: IFilterValue[] = [
  {
    value: "Boy",
    label: "Boy",
    urlId: "boy",
  },
  {
    value: "Girl",
    label: "Girl",
    urlId: "girl",
  },
  {
    value: "Men",
    label: "Men",
    urlId: "men",
  },
  {
    value: "None",
    label: "None",
    urlId: "none",
  },
  {
    value: "Teen Boy",
    label: "Teen Boy",
    urlId: "tb",
  },
  {
    value: "Teen Girl",
    label: "Teen Girl",
    urlId: "tg",
  },
  {
    value: "UnisexAdult",
    label: "UnisexAdult",
    urlId: "ua",
  },
  {
    value: "Unisex Baby",
    label: "Unisex Baby",
    urlId: "ub",
  },
  {
    value: "Unisex Kid",
    label: "Unisex Kid",
    urlId: "uk",
  },
  {
    value: "Women",
    label: "Women",
    urlId: "women",
  },
];

export const genderFilterId = "gf";
export const productFilterId = "pf";
export const categoryFilterId = "cf";

export const productToFilterValue = (product: Product): IProductFilterValue => ({
  id: product.id!,
  value: product.id!.toString(),
  name: product.name!,
  label: `${product.name!} (${product.gender!})`,
  urlId: product.id!.toString(),
  gender: product.gender!,
});

export const categoryToFilterValue = (category: {
  id: number | null;
  name: string | null;
}): ICategoryFilterValue => ({
  id: category.id!,
  value: category.id!.toString(),
  name: category.name!,
  label: category.name!,
  urlId: category.id!.toString(),
});

export default function GenderProductFilter() {
  const productFilterValues = useReactiveVar(productFilterValuesVar);
  const categoryFilterValues = useReactiveVar(categoryFilterValuesVar);

  const { onFilterChange: onProductFilterChange, filterValue: productFilterValue } =
    useMultiSelectFilter<IProductFilterValue>(productFilterValues, productFilterId);

  const { onFilterChange: onGenderFilterChange, filterValue: genderFilterValue } =
    useMultiSelectFilter(genders, genderFilterId);

  const { onFilterChange: onCategoryFilterChange, filterValue: categoryFilterValue } =
    useMultiSelectFilter<ICategoryFilterValue>(categoryFilterValues, categoryFilterId);

  return (
    <Wrap>
      <WrapItem maxW="300">
        <MultiSelectFilter
          onFilterChange={onGenderFilterChange}
          filterValue={genderFilterValue}
          placeholder="products gender"
          filterId={genderFilterId}
          fieldLabel="products gender"
          values={genders}
        />
      </WrapItem>
      <WrapItem maxW="300">
        <MultiSelectFilter
          onFilterChange={onProductFilterChange}
          filterValue={productFilterValue}
          placeholder="products"
          filterId={productFilterId}
          fieldLabel="products"
          values={productFilterValues}
        />
      </WrapItem>
      <WrapItem maxW="300">
        <MultiSelectFilter
          onFilterChange={onCategoryFilterChange}
          filterValue={categoryFilterValue}
          placeholder="product category"
          filterId={categoryFilterId}
          fieldLabel="product category"
          values={categoryFilterValues}
        />
      </WrapItem>
    </Wrap>
  );
}
