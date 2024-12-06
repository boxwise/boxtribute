import { useReactiveVar } from "@apollo/client";
import { Wrap, WrapItem } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import { IFilterValue } from "./ValueFilter";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import { IProductFilterValue, productFilterValuesVar } from "../../state/filter";
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

export const productToFilterValue = (product: Product): IProductFilterValue => ({
  id: product.id!,
  value: product.id!.toString(),
  name: product.name!,
  label: `${product.name!} (${product.gender!})`,
  urlId: product.id!.toString(),
  gender: product.gender!,
});

export default function GenderProductFilter() {
  const productFilterValues = useReactiveVar(productFilterValuesVar);
  const { onFilterChange: onProductFilterChange, filterValue: productFilterValue } =
    useMultiSelectFilter<IProductFilterValue>(productFilterValues, productFilterId);

  const { onFilterChange: onGenderFilterChange, filterValue: genderFilterValue } =
    useMultiSelectFilter(genders, genderFilterId);

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
    </Wrap>
  );
}
