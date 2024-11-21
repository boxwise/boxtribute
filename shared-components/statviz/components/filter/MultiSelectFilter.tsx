import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect } from "react";
import SelectField from "../../../form/SelectField";
import { urlFilterValuesEncode } from "../../hooks/useMultiSelectFilter";

export interface IFilterValue {
  value: string;
  label: string;
  urlId: string;
}

interface IValueFilterProps {
  values: IFilterValue[];
  filterId: string;
  onFilterChange: (event) => void;
  filterValue: IFilterValue[];
  fieldLabel?: string;
  placeholder?: string;
  defaultFilterValues?: IFilterValue[];
}

const multiSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  urlId: z.string(),
});

export const ValueFilterSchema = z.object({
  values: multiSelectOptionSchema.array(),
});

export default function MultiSelectFilter({
  values,
  filterId,
  placeholder = undefined,
  filterValue,
  fieldLabel = "display by",
  onFilterChange,
}: IValueFilterProps) {
  const {
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ValueFilterSchema),
    defaultValues: values,
  });

  useEffect(() => {
    if (filterValue) {
      // @ts-expect-error ts(2345)
      setValue(filterId, filterValue);
    }
  }, [filterId, filterValue, setValue]);

  return (
    <SelectField
      fieldId={filterId}
      fieldLabel={fieldLabel ?? ""}
      isMulti
      placeholder={placeholder ?? ""}
      onChangeProp={onFilterChange}
      isRequired={false}
      options={values}
      errors={errors}
      control={control}
    />
  );
}
