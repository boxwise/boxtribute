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
}: IValueFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ValueFilterSchema),
    defaultValues: values,
  });

  useEffect(() => {
    const filterValue = searchParams.get(filterId);
    const filterOption = values.find((value) => value.urlId === filterValue);
    if (filterOption) {
      // @ts-expect-error
      setValue(filterId, filterOption);
    } else {
      if (filterValue !== null) {
        searchParams.delete(filterId);
      }
      if (defaultFilterValue) {
        searchParams.append(filterId, defaultFilterValue.urlId);
      }
      setSearchParams(searchParams);
    }
  }, [defaultFilterValue, filterId, searchParams, setSearchParams, setValue, values]);

  return (
    <SelectField
      fieldId={filterId}
      fieldLabel="display by"
      placeholder={defaultFilterValue?.label ?? placeholder ?? ""}
      onChangeProp={onFilterChange}
      isRequired={false}
      options={values}
      errors={errors}
      control={control}
    />
  );
}
