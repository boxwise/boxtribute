import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import StockOverviewRingFilterContainer from "./StockOverviewRingFilterContainer";
import { STOCK_QUERY } from "../../../queries/queries";
import type { BoxesOrItemsCount, StockAppliedFilters } from "../../../utils/dashboardFilters";

interface StockOverviewRingDataContainerProps {
  isActive: boolean;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItemsCount;
}

export default function StockOverviewRingDataContainer({
  isActive,
  appliedFilters,
  boxesOrItems,
}: StockOverviewRingDataContainerProps) {
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
    <StockOverviewRingFilterContainer
      stockOverview={data.stockOverview!}
      appliedFilters={appliedFilters}
      boxesOrItems={boxesOrItems}
    />
  );
}
