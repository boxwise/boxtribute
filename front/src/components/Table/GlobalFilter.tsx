import { useEffect, useRef, useState, ChangeEventHandler } from "react";
import { useAsyncDebounce } from "react-table";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";

interface IProps {
  globalFilter: string;
  setGlobalFilter: (filterValue: string | undefined) => void;
  placeholder?: string;
  /** Opt-in for filters that are controlled externally (e.g. by URL search params): the input
   * follows changes of `globalFilter` that were not caused by the input itself. */
  syncWithGlobalFilter?: boolean;
}

export function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  placeholder = "Search",
  syncWithGlobalFilter = false,
}: IProps) {
  const [value, setValue] = useState<string>(globalFilter);
  const lastEmittedValue = useRef(globalFilter ?? "");
  const { isOpen, onToggle } = useDisclosure();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const onChange = useAsyncDebounce((val: string) => {
    lastEmittedValue.current = val;
    setGlobalFilter(val || undefined);
  }, 200);

  useEffect(() => {
    if (syncWithGlobalFilter && (globalFilter ?? "").trim() !== lastEmittedValue.current.trim()) {
      lastEmittedValue.current = globalFilter ?? "";
      setValue(globalFilter ?? "");
    }
  }, [globalFilter, syncWithGlobalFilter]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  return (
    <InputGroup width="auto" variant="filled">
      <InputLeftElement onClick={onToggle} cursor={isLargerThan768 ? "inherit" : "pointer"}>
        <SearchIcon />
      </InputLeftElement>
      <Input
        _focus={{ bg: "gray.200" }}
        w={isLargerThan768 || isOpen ? "auto" : "0"}
        pr={isLargerThan768 || isOpen ? "auto" : "0"}
        borderRadius={0}
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </InputGroup>
  );
}
