import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
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
  placeholder?: string;
  defaultFilterValue?: IFilterValue;
  fieldLabel?: string;
  inlineLabel?: boolean;
}

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  urlId: z.string(),
});

export const ValueFilterSchema = z.object({
  values: singleSelectOptionSchema.array(),
});

export default function ValueFilter({
  values,
  filterId,
  placeholder = undefined,
  onFilterChange,
  defaultFilterValue = undefined,
  fieldLabel = "display by",
  inlineLabel = false,
}: IValueFilterProps) {
  const [searchParams] = useSearchParams();

  const {
    control,
    setValue,
    formState: { errors },
    // TODO: fix types
  } = useForm<any>({
    resolver: zodResolver(ValueFilterSchema),
    defaultValues: values,
  });

  useEffect(() => {
    const filterValue = searchParams.get(filterId);
    const filterOption = values.find((value) => value.urlId === filterValue);
    if (filterOption) {
      setValue(filterId, filterOption);
    }
  }, [filterId, searchParams, setValue, values]);

  return (
    <SelectField
      fieldId={filterId}
      fieldLabel={fieldLabel}
      placeholder={defaultFilterValue?.label ?? placeholder ?? ""}
      onChangeProp={onFilterChange}
      isRequired={false}
      options={values}
      errors={errors}
      control={control}
      data-testid="value-filter"
      inlineLabel={inlineLabel}
    />
  );
}
