import { zodResolver } from "@hookform/resolvers/zod";
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

type MultiSelectFormData = Record<string, IFilterValue[] | undefined>;

export default function MultiSelectFilter({
  values,
  filterId,
  placeholder = undefined,
  filterValue,
  fieldLabel = "display by",
  onFilterChange,
}: IValueFilterProps) {
  // Create a dynamic schema that matches the actual form structure
  const dynamicSchema = z.object({
    [filterId]: multiSelectOptionSchema.array().optional(),
  });

  const {
    setValue,
    control,
    formState: { errors },
  } = useForm<MultiSelectFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {},
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
