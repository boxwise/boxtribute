import { useMemo } from "react";
import { Wrap, FormLabel, Box } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { z } from "zod";
import SelectField from "../../../../Form/SelectField";
import useTimerange from "../../../hooks/useTimerange";
import {
  MovedBoxesData,
  MovedBoxesResult,
  TargetDimensionInfo,
} from "../../../../types/generated/graphql";
import { filterListByInterval } from "../../../utils/helpers";
import MovedBoxesCharts from "./MovedBoxesCharts";
import useListFilter from "../../../hooks/useListFilter";

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const MovedBoxesFilterSchema = z.object({
  locations: singleSelectOptionSchema.array().optional(),
});

export type IMovedBoxesFilterInput = z.input<typeof MovedBoxesFilterSchema>;
export type IMovedBoxesFilterOutput = z.output<typeof MovedBoxesFilterSchema>;

export default function MovedBoxesFilterContainer(props: { movedBoxes: MovedBoxesData }) {
  const { interval } = useTimerange();

  const mapTargetToSelectableLocation = (target: TargetDimensionInfo) => ({
    id: target.id,
    location: target.name,
  });

  const locations = props.movedBoxes.dimensions?.target.map(mapTargetToSelectableLocation);

  const { control, errors } = useListFilter(
    "locations",
    "locations",
    locations,
    zodResolver(MovedBoxesFilterSchema),
  );

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        props.movedBoxes.facts as MovedBoxesResult[],
        "movedOn",
        interval,
      ) as MovedBoxesResult[];
    } catch (error) {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, props.movedBoxes.facts]);

  const filteredMovedBoxesCube = {
    facts: movedBoxesFacts,
    dimensions: props.movedBoxes.dimensions,
  };
  return (
    <>
      <Wrap>
        <Box width="250px">
          <FormLabel htmlFor="box-item-select">Categories</FormLabel>
          <SelectField
            fieldId="locations"
            fieldLabel="locations"
            placeholder="select locations"
            options={locations}
            isRequired={false}
            isMulti
            errors={errors}
            control={control}
          />
        </Box>
      </Wrap>
      <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} />
    </>
  );
}
