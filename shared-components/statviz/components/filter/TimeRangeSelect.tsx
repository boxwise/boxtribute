import { Wrap, WrapItem } from "@chakra-ui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { subMonths } from "date-fns";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateField } from "../../..";
import { date2String } from "../../../utils/helpers";
import { trackFilter } from "../../utils/analytics/heap";

export const FilterCreatedOnFormScheme = z.object({
  from: z
    .date({
      invalid_type_error: "Please enter a valid date",
    })
    .transform((value) => value?.toISOString().substring(0, 10))
    .optional(),
  to: z
    .date({
      invalid_type_error: "Please enter a valid date",
    })
    .transform((value) => value?.toISOString().substring(0, 10))
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
    const from = new Date(searchParams.get("from")!);
    const to = new Date(searchParams.get("to")!);

    if (toFormValue === undefined) {
      setValue("to", date2String(to));
    }

    if (fromFormValue === undefined) {
      setValue("from", date2String(from));
    }

    if (toFormValue && new Date(toFormValue) !== to) {
      searchParams.delete("to");
      const newToDate = date2String(new Date(toFormValue));
      const stringifiedFrom = date2String(from);
      searchParams.append("to", newToDate);
      trackFilter({ filterId: "timeRange", newToDate, stringifiedFrom });
    }

    if (fromFormValue && new Date(fromFormValue) !== from) {
      searchParams.delete("from");
      searchParams.append("from", date2String(new Date(fromFormValue)));
      const stringifiedTo = date2String(to);
      trackFilter({
        filterId: "timerange",
        from: date2String(new Date(fromFormValue)),
        stringifiedTo,
      });
    }

    if (searchParams.toString() !== currentQuery) {
      setSearchParams(searchParams);
    }
  }, [searchParams, setValue, setSearchParams, fromFormValue, toFormValue]);

  return (
    <form id="filter">
      <Wrap>
        <WrapItem>
          <DateField
            fieldId="from"
            fieldLabel="from"
            errors={errors}
            control={control}
            register={register}
            isRequired={false}
            maxDate={date2String(new Date())}
            minDate="2023-01-01"
          />
        </WrapItem>
        <WrapItem>
          <DateField
            fieldId="to"
            fieldLabel="to"
            errors={errors}
            control={control}
            register={register}
            isRequired={false}
            maxDate={date2String(new Date())}
            minDate="2023-01-01"
          />
        </WrapItem>
      </Wrap>
    </form>
  );
}
