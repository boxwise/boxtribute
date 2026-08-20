import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import MovedBoxesFilterContainer from "./MovedBoxesFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import { MOVED_BOXES_QUERY } from "../../../queries/queries";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type {
  ITargetOption,
  MovementAppliedFilters,
  MovementDirection,
} from "../../../utils/dashboardFilters";

interface MovedBoxesDataContainerProps {
  isActive: boolean;
  appliedFilters: MovementAppliedFilters;
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
  onTargetsAvailable?: (targets: ITargetOption[]) => void;
}

// The data wrapper collects data and passes it to the filter-wrapper
// which applys filters to the data
// the filter wrapper passes it to the Chart which maps the Datacube to a VisX or Nivo Chart
export default function MovedBoxesDataContainer({
  isActive,
  appliedFilters,
  boxesOrItems,
  direction,
  onTargetsAvailable,
}: MovedBoxesDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(MOVED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
    skip: !isActive,
  });

  useEffect(() => {
    if (!data?.movedBoxes?.dimensions?.target) return;
    const targets: ITargetOption[] = data.movedBoxes.dimensions.target
      .filter((t): t is NonNullable<typeof t> => t !== null && t.id != null)
      .map((t) => ({
        id: t.id as string,
        name: t.name ?? "",
        type: t.type ?? undefined,
        deletedOn: t.deletedOn ? new Date(String(t.deletedOn)) : undefined,
      }));
    onTargetsAvailable?.(targets);
  }, [data, onTargetsAvailable]);

  if (!isActive) {
    return null;
  }
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
