import { Wrap, WrapItem, Box } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";
import SelectField from "../../../../Form/SelectField";

export type BoxesOrItems = "boxesCount" | "itemsCount";

const isBoxesOrItemsCount = (x: any | undefined): x is BoxesOrItems =>
  x === "boxesCount" || x === "itemsCount";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesData;
}

const displayByOptions: { value: BoxesOrItems; label: string }[] = [
  {
    value: "boxesCount",
    label: "Boxes",
  },
  {
    value: "itemsCount",
    label: "Items",
  },
];

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const CreatedBoxesFilterSchema = z.object({
  displayByOptions: singleSelectOptionSchema.array().default(displayByOptions),
});

export default function CreatedBoxesFilterContainer({
  createdBoxes,
}: ICreatedBoxesFilterContainerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { interval } = useTimerange();

  const [selectedBoxesOrItems, setSelectedBoxesOrItems] = useState<BoxesOrItems>("boxesCount");

  const {
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreatedBoxesFilterSchema),
    defaultValues: displayByOptions,
  });

  useEffect(() => {
    const boi = searchParams.get("boi");
    if (isBoxesOrItemsCount(boi)) {
      setSelectedBoxesOrItems(boi);
    } else {
      if (boi !== null) {
        searchParams.delete("boi");
      }
      searchParams.append("boi", selectedBoxesOrItems);
      setSearchParams(searchParams);
    }
    // @ts-ignore ts(2345) i have no idea why the fieldId is not accepted as an input, but it works
    setValue("displayby", displayByOptions.find((dbo) => dbo.value === boi)!);
  }, [selectedBoxesOrItems, setSelectedBoxesOrItems, searchParams, setSearchParams, setValue]);

  const onBoxesItemsSelectChange = (event) => {
    const selected = event.value as BoxesOrItems;

    // boi short for boxes or items (see type BoxesOrItems)
    if (searchParams.get("boi")) {
      searchParams.delete("boi");
    }

    searchParams.append("boi", selected);

    setSearchParams(searchParams);
  };

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
  const filteredCreatedBoxesCube = {
    facts: createdBoxesFacts,
    dimensions: createdBoxes.dimensions,
  };

  return (
    <>
      <Wrap borderWidth="1px" borderRadius="12px" padding="5" marginBottom="30px">
        <WrapItem>
          <Box width="250px">
            <SelectField
              fieldId="displayby"
              fieldLabel="display by"
              placeholder="Boxes"
              defaultValue="boxesCount"
              onChangeProp={onBoxesItemsSelectChange}
              isRequired={false}
              options={displayByOptions}
              errors={errors}
              control={control}
            />
          </Box>
        </WrapItem>
      </Wrap>
      <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={selectedBoxesOrItems} />
    </>
  );
}
