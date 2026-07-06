import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import BoxCreationCalendarFilterContainer from "./BoxCreationCalendarFilterContainer";
import { CREATED_BOXES_QUERY } from "../../../queries/queries";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";

interface BoxCreationCalendarDataContainerProps {
  isActive: boolean;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function BoxCreationCalendarDataContainer({
  isActive,
  appliedFilters,
  boxesOrItems,
}: BoxCreationCalendarDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(CREATED_BOXES_QUERY, {
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
    <BoxCreationCalendarFilterContainer
      createdBoxes={data.createdBoxes!}
      appliedFilters={appliedFilters}
      boxesOrItems={boxesOrItems}
    />
  );
}
