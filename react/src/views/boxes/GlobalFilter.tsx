import { useState } from "react";
import { useAsyncDebounce } from "react-table";
import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";

export function GlobalFilter({ globalFilter, setGlobalFilter }) {
  console.log("globalFilter", globalFilter);
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <InputGroup>
      <InputRightElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
      <Input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search`}
      />
    </InputGroup>
  );
}
