import { Box, HStack } from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { subMonths } from "date-fns";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateField } from "..";
import { date2String } from "../utils/helpers";

export const FilterCreatedOnFormScheme = z.object({
  from: z
    .string({
      invalid_type_error: "Please enter a valid date",
    })
    .optional(),
  to: z
    .string({
      invalid_type_error: "Please enter a valid date",
    })
    .optional(),
});

export type ITimeRangeSelection = z.infer<typeof FilterCreatedOnFormScheme>;

export default function TimeRangeSelect() {
  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ITimeRangeSelection>({
    resolver: zodResolver(FilterCreatedOnFormScheme),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const toFormValue = watch("to");
  const fromFormValue = watch("from");

  useEffect(() => {
    const currentQuery = searchParams.toString();

    if (!searchParams.get("from")) {
      searchParams.append("from", date2String(subMonths(new Date(), 3)));
    }
    if (!searchParams.get("to")) {
      searchParams.append("to", date2String(new Date()));
    }
    const from = new Date(searchParams.get("from") as string);
    const to = new Date(searchParams.get("to") as string);

    if (toFormValue === undefined) {
      setValue("to", date2String(to));
    }

    if (fromFormValue === undefined) {
      setValue("from", date2String(from));
    }

    if (toFormValue && new Date(toFormValue).getDate() !== to.getDate()) {
      searchParams.delete("to");
      searchParams.append("to", date2String(new Date(toFormValue)));
    }

    if (fromFormValue && new Date(fromFormValue).getDate() !== from.getDate()) {
      searchParams.delete("from");
      searchParams.append("from", date2String(new Date(fromFormValue)));
    }

    if (searchParams.toString() !== currentQuery) {
      setSearchParams(searchParams);
    }
  }, [searchParams, setValue, setSearchParams, fromFormValue, toFormValue]);

  return (
    <Box>
      <form id="filter">
        <HStack>
          <Box>
            <DateField
              fieldId="from"
              fieldLabel="from"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              maxDate="2080-01-01"
              minDate="1910-01-01"
            />
          </Box>
          <Box>
            <DateField
              fieldId="to"
              fieldLabel="to"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              maxDate="2080-01-01"
              minDate="1910-01-01"
            />
          </Box>
        </HStack>
      </form>
    </Box>
  );
}
