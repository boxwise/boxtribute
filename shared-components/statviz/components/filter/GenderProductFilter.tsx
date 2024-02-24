import { makeVar, useReactiveVar } from "@apollo/client";
import { Wrap, WrapItem } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import { IFilterValue } from "./ValueFilter";
import { ProductDimensionInfo, ProductGender } from "../../../types/generated/graphql";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";

interface IProductFilterValue extends IFilterValue {
  id: number;
  name: string;
  gender: ProductGender;
}

export const genders: IFilterValue[] = [
  {
    value: ProductGender.Boy.valueOf(),
    label: "Boy",
    urlId: "boy",
  },
  {
    value: ProductGender.Girl.valueOf(),
    label: "Girl",
    urlId: "girl",
  },
  {
    value: ProductGender.Men.valueOf(),
    label: "Men",
    urlId: "men",
  },
  {
    value: ProductGender.None.valueOf(),
    label: "None",
    urlId: "none",
  },
  {
    value: ProductGender.TeenBoy.valueOf(),
    label: "Teen Boy",
    urlId: "tb",
  },
  {
    value: ProductGender.TeenGirl.valueOf(),
    label: "Teen Girl",
    urlId: "tg",
  },
  {
    value: ProductGender.UnisexAdult.valueOf(),
    label: "UnisexAdult",
    urlId: "ua",
  },
  {
    value: ProductGender.UnisexBaby.valueOf(),
    label: "Unisex Baby",
    urlId: "ub",
  },
  {
    value: ProductGender.UnisexKid.valueOf(),
    label: "Unisex Kid",
    urlId: "uk",
  },
  {
    value: ProductGender.Women.valueOf(),
    label: "Women",
    urlId: "women",
  },
];

export const genderFilterId = "gf";
export const productFilterId = "pf";

export const products = makeVar<IProductFilterValue[]>([]);

export const productToFilterValue = (product: ProductDimensionInfo): IProductFilterValue => ({
  id: product.id!,
  value: product.id!.toString(),
  name: product.name!,
  label: `${product.name!} (${product.gender!})`,
  urlId: product.id!.toString(),
  gender: product.gender!,
});

export default function GenderProductFilter() {
  const productFilterOptions = useReactiveVar(products);
  const { onFilterChange: onProductFilterChange, filterValue: productFilterValue } =
    useMultiSelectFilter<IProductFilterValue>(productFilterOptions, productFilterId);

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
          values={productFilterOptions}
        />
      </WrapItem>
    </Wrap>
  );
}
