import { useEffect, useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { useReactiveVar } from "@apollo/client";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";
import useValueFilter from "../../../hooks/useValueFilter";
import {
  IBoxesOrItemsFilter,
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import {
  genderFilterId,
  genders,
  productFilterId,
  productToFilterValue,
  products,
} from "../../filter/GenderProductFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { tagFilter, tagFilterId, tagToFilterValue } from "../../filter/TagFilter";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesData;
}

export default function CreatedBoxesFilterContainer({
  createdBoxes,
}: ICreatedBoxesFilterContainerProps) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );
  const productFilterOptions = useReactiveVar(products);

  const { filterValue: filterProductGenders } = useMultiSelectFilter(genders, genderFilterId);
  const { filterValue: filterProducts } = useMultiSelectFilter(
    productFilterOptions,
    productFilterId,
  );

  const tagFilterOptions = useReactiveVar(tagFilter);
  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilterOptions, tagFilterId);

  // use products from the createdBoxes query to feed the global products and tags filter
  // and filter the product filter by filtered product genders
  useEffect(() => {
    const p = createdBoxes.dimensions!.product!.map((e) => productToFilterValue(e!));
    if (filterProductGenders.length > 0) {
      products([
        ...filterProducts,
        ...p.filter(
          (product) => filterProductGenders.findIndex((fPG) => fPG.value === product.gender) !== -1,
        ),
      ]);
    } else {
      products(p);
    }

    const tags = createdBoxes.dimensions!.tag!.map((e) => tagToFilterValue(e!));
    tagFilter(tags);

    // we only need to update products if the product gender selection is updated
    // including filterProducts would cause unnecessary rerenders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdBoxes.dimensions, filterProductGenders]);

  const createdBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (createdBoxes.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      ) as CreatedBoxesResult[];
    } catch (error) {
      // TODO useError
    }
    return [];
  }, [interval, createdBoxes]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (filterProductGenders.length > 0) {
      filters.push(
        filter(
          (fact: CreatedBoxesResult) =>
            filterProductGenders.find((fPG) => fPG.value === fact.gender!) !== undefined,
        ),
      );
    }
    if (filterProducts.length > 0) {
      filters.push(
        filter(
          (fact: CreatedBoxesResult) =>
            filterProducts.find((fBP) => fBP?.id === fact.productId!) !== undefined,
        ),
      );
    }
    if (filteredTags.length > 0) {
      filters.push(
        filter((fact: CreatedBoxesResult) =>
          filteredTags.some((fT) => fact.tagIds!.includes(fT.id)),
        ),
      );
    }

    if (filters.length > 0) {
      // @ts-expect-error
      return tidy(createdBoxesFacts, ...filters);
    }
    return createdBoxesFacts;
  }, [createdBoxesFacts, filterProductGenders, filterProducts, filteredTags]);

  const filteredCreatedBoxesCube = {
    facts: filteredFacts,
    dimensions: createdBoxes.dimensions,
  };

  return <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={filterValue.value} />;
}
