import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect } from "react";
import SelectField from "../../../form/SelectField";
import { urlFilterValuesEncode, urlFilterValuesDecode } from "../../hooks/useMultiSelectFilter";

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
  placeholder,
  onFilterChange,
  defaultFilterValues,
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
    if (filterValue) {
      // @ts-expect-error ts(2345)
      setValue(filterId, urlFilterValuesDecode(filterValue, values));
    } else {
      if (filterValue !== null) {
        searchParams.delete(filterId);
      }
      if (defaultFilterValues) {
        searchParams.append(filterId, urlFilterValuesEncode(defaultFilterValues));
      }
      setSearchParams(searchParams);
    }
  }, [defaultFilterValues, filterId, searchParams, setSearchParams, setValue, values]);

  return (
    <SelectField
      fieldId={filterId}
      fieldLabel="display by"
      placeholder={placeholder ?? ""}
      onChangeProp={onFilterChange}
      isRequired={false}
      options={values}
      errors={errors}
      control={control}
    />
  );
}

MultiSelectFilter.defaultProps = {
  defaultFilterValues: undefined,
  placeholder: undefined,
};
