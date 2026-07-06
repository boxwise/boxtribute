import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import StockOverviewBarsFilterContainer from "./StockOverviewBarsFilterContainer";
import { STOCK_QUERY } from "../../../queries/queries";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";

interface StockOverviewBarsDataContainerProps {
  isActive: boolean;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function StockOverviewBarsDataContainer({
  isActive,
  appliedFilters,
  boxesOrItems,
}: StockOverviewBarsDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(STOCK_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
    skip: !isActive,
  });

  if (!isActive) {
    return null;
  }
  if (error) {
    return <ErrorCard error={error.message} />;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  return (
    <StockOverviewBarsFilterContainer
      stockOverview={data.stockOverview!}
      appliedFilters={appliedFilters}
      boxesOrItems={boxesOrItems}
    />
  );
}
