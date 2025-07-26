import { useEffect, useMemo } from "react";
import { TidyFn, distinct, filter, tidy } from "@tidyjs/tidy";
import { useReactiveVar } from "@apollo/client";
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
  categoryFilterId,
  productToFilterValue,
  categoryToFilterValue,
} from "../../filter/GenderProductFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { tagFilterId, tagToFilterValue } from "../../filter/TagFilter";
import {
  productFilterValuesVar,
  tagFilterValuesVar,
  categoryFilterValuesVar,
} from "../../../state/filter";
import { CreatedBoxes, CreatedBoxesResult } from "../../../../../graphql/types";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxes;
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
  const productFilterValues = useReactiveVar(productFilterValuesVar);
  const categoryFilterValues = useReactiveVar(categoryFilterValuesVar);

  const { filterValue: filterProductGenders } = useMultiSelectFilter(genders, genderFilterId);
  const { filterValue: filterProducts } = useMultiSelectFilter(
    productFilterValues,
    productFilterId,
  );
  const { filterValue: filterCategories } = useMultiSelectFilter(
    categoryFilterValues,
    categoryFilterId,
  );

  const tagFilterValues = useReactiveVar(tagFilterValuesVar);
  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilterValues, tagFilterId);

  // use products from the createdBoxes query to feed the global products and Tags for Boxes filter
  // Beneficiary and All Tags are merged inside the DemographicFilterContainer
  // and filter the product filter by filtered product genders
  useEffect(() => {
    const p = createdBoxes?.dimensions!.product!.map((e) => productToFilterValue(e!));
    if (filterProductGenders.length > 0 && p?.length) {
      productFilterValuesVar([
        ...filterProducts,
        ...p.filter(
          (product) => filterProductGenders.findIndex((fPG) => fPG.value === product.gender) !== -1,
        ),
      ]);
    } else {
      productFilterValuesVar(p);
    }

    const c = createdBoxes?.dimensions!.category!.map((e) => categoryToFilterValue(e!));
    categoryFilterValuesVar(c);

    const boxTags = createdBoxes?.dimensions!.tag!.map((e) => tagToFilterValue(e!));
    if (boxTags?.length) {
      const distinctTagFilterValues = tidy([...tagFilterValues, ...boxTags], distinct(["id"]));

      tagFilterValuesVar(distinctTagFilterValues);
    }
    // we only need to update products if the product gender selection is updated
    // including filterProducts would cause unnecessary rerenders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdBoxes?.dimensions, filterProductGenders]);

  const createdBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (createdBoxes?.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      );
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
    if (filterCategories.length > 0) {
      filters.push(
        filter(
          (fact: CreatedBoxesResult) =>
            filterCategories.find((fC) => fC?.id === fact.categoryId!) !== undefined,
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
      return tidy(createdBoxesFacts, ...filters) as CreatedBoxesResult[];
    }
    return createdBoxesFacts satisfies CreatedBoxesResult[];
  }, [createdBoxesFacts, filterProductGenders, filterProducts, filterCategories, filteredTags]);

  const filteredCreatedBoxesCube = {
    facts: filteredFacts,
    dimensions: createdBoxes?.dimensions,
  };

  return <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={filterValue.value} />;
}
