import { useState, ChangeEventHandler } from "react";
import { useAsyncDebounce } from "react-table";
import { IoSearch } from "react-icons/io5";
import { Group, IconButton, Input, useDisclosure, useMediaQuery } from "@chakra-ui/react";

interface IProps {
  globalFilter: string;
  setGlobalFilter: (filterValue: string | undefined) => void;
}

export function GlobalFilter({ globalFilter, setGlobalFilter }: IProps) {
  const [value, setValue] = useState<string>(globalFilter);
  const { open, onToggle } = useDisclosure();
  const [isLargerThan768] = useMediaQuery(["(min-width: 768px)"]);
  const onChange = useAsyncDebounce((val: string) => {
    setGlobalFilter(val || undefined);
  }, 200);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  return (
    <Group width="auto" attached>
      <Input
        _focus={{ bg: "gray.200" }}
        w={isLargerThan768 || open ? "auto" : "0"}
        pr={isLargerThan768 || open ? "auto" : "0"}
        borderRadius={0}
        value={value || ""}
        onChange={handleChange}
        placeholder="Search"
      />
      <IconButton
        aria-label="Toggle search"
        onClick={onToggle}
        cursor={isLargerThan768 ? "inherit" : "pointer"}
        variant="ghost"
      >
        <IoSearch />
      </IconButton>
    </Group>
  );
}
