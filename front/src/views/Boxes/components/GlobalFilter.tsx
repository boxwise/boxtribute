import { useState, ChangeEventHandler } from "react";
import { useAsyncDebounce } from "react-table";
import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";

interface IProps {
  globalFilter: string;
  setGlobalFilter: (filterValue: string | undefined) => void;
}

export function GlobalFilter({ globalFilter, setGlobalFilter }: IProps) {
  const [value, setValue] = useState<string>(globalFilter);
  const onChange = useAsyncDebounce((val: string) => {
    setGlobalFilter(val || undefined);
  }, 200);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  return (
    <InputGroup width="auto">
      <InputRightElement pointerEvents="none">
        <SearchIcon color="gray.300" />
      </InputRightElement>
      <Input value={value || ""} onChange={handleChange} placeholder="Search" />
    </InputGroup>
  );
}
