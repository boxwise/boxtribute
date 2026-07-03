import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import MovedBoxesFilterContainer from "./MovedBoxesFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import { MOVED_BOXES_QUERY } from "../../../queries/queries";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { MovementAppliedFilters, MovementDirection } from "../../../utils/dashboardFilters";

interface MovedBoxesDataContainerProps {
  appliedFilters: MovementAppliedFilters;
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
}

// The data wrapper collects data and passes it to the filter-wrapper
// which applys filters to the data
// the filter wrapper passes it to the Chart which maps the Datacube to a VisX or Nivo Chart
export default function MovedBoxesDataContainer({
  appliedFilters,
  boxesOrItems,
  direction,
}: MovedBoxesDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(MOVED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
  });

  if (error) {
    return <Box>An unexpected error happened {error.message}</Box>;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  return (
    <MovedBoxesFilterContainer
      movedBoxes={data.movedBoxes}
      appliedFilters={appliedFilters}
      boxesOrItems={boxesOrItems}
      direction={direction}
    />
  );
}
