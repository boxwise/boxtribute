import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import SelectField from "../../../form/SelectField";

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
    // TODO: fix types
  } = useForm<any>({
    resolver: zodResolver(ValueFilterSchema),
    defaultValues: values,
  });

  useEffect(() => {
    if (filterValue) {
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
