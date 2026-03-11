import { useRef, useMemo, useCallback, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Select, chakraComponents } from "chakra-react-select";

import { colorIsBright } from "../../../utils/helpers";
import { ITagFilterValue } from "../../state/filter";

interface ITabbedTagDropdownProps {
  availableTags: ITagFilterValue[];
  includedTags: ITagFilterValue[];
  excludedTags: ITagFilterValue[];
  onIncludedChange: (tags: ITagFilterValue[]) => void;
  onExcludedChange: (tags: ITagFilterValue[]) => void;
  onClearAll?: () => void;
  placeholder?: string;
}

// Minimal typing for react-select action metadata (react-select is a transitive dep only)
interface ISelectActionMeta {
  action: string;
  option?: ITagFilterValue;
  removedValue?: ITagFilterValue;
}

// Extended selectProps type for custom data passed through to custom components
interface ICustomSelectProps {
  tabIndexRef?: React.MutableRefObject<number>;
  includedTags?: ITagFilterValue[];
  excludedTags?: ITagFilterValue[];
}

// Custom Menu component that wraps the dropdown in Include/Exclude tabs.
// Defined at module level so the reference is stable and avoids hook violations.
// NOTE: We intentionally avoid Chakra's Tab/TabList/Tabs here. Chakra's Tab is a <button>
// whose useTab hook calls element.focus() on click, which steals focus from the react-select
// input and closes the dropdown. Using plain Box elements with onMouseDown preventDefault
// prevents focus transfer without that side-effect.
function CustomMenu(menuProps: { selectProps: ICustomSelectProps; children: React.ReactNode }) {
  const { tabIndexRef } = menuProps.selectProps;
  // Initialize from the ref so the active tab is remembered across menu open/close cycles.
  const [tabIndex, setTabIndex] = useState(() => tabIndexRef?.current ?? 0);

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    if (tabIndexRef) {
      tabIndexRef.current = index;
    }
  };

  const TAB_LABELS = ["Include", "Exclude"] as const;

  return (
    <chakraComponents.Menu {...(menuProps as any)}>
      {/* Plain flex row for tabs — no Chakra Tab/TabList so focus stays on the Select input */}
      <Flex bg="white" border="1px solid" borderColor="gray.200" borderBottom="none">
        {TAB_LABELS.map((label, i) => (
          <Box
            key={label}
            as="button"
            type="button"
            flex="1"
            py={2}
            fontSize="sm"
            fontWeight="medium"
            textAlign="center"
            cursor="pointer"
            color={tabIndex === i ? "blue.600" : "gray.500"}
            borderBottom="2px solid"
            borderBottomColor={tabIndex === i ? "blue.500" : "transparent"}
            bg="white"
            _focus={{ outline: "none" }}
            /* preventDefault on mousedown keeps focus on the react-select input */
            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
            onClick={() => handleTabChange(i)}
          >
            {label}
          </Box>
        ))}
      </Flex>
      {menuProps.children}
    </chakraComponents.Menu>
  );
}

// Custom Option component that shows a check mark when already selected.
function CustomOption(optionProps: { data: ITagFilterValue; selectProps: ICustomSelectProps }) {
  const { data, selectProps } = optionProps;
  const { includedTags = [], excludedTags = [] } = selectProps;
  const isIncluded = includedTags.some((t) => t.id === data.id);
  const isExcluded = excludedTags.some((t) => t.id === data.id);

  return (
    <chakraComponents.Option {...(optionProps as any)}>
      <Flex justify="space-between" align="center" width="100%">
        <Flex align="center" gap={2}>
          {data.label}
        </Flex>
        {(isIncluded || isExcluded) && <CheckIcon boxSize={3} />}
      </Flex>
    </chakraComponents.Option>
  );
}

const CUSTOM_COMPONENTS = {
  Menu: CustomMenu,
  Option: CustomOption,
};

/**
 * Tabbed dropdown component for selecting included and excluded tags.
 * Features two tabs: "Include" for tags to include and "Exclude" for tags to exclude.
 * Uses chakra-react-select for built-in search/filter functionality.
 */
export default function TabbedTagDropdown({
  availableTags,
  includedTags,
  excludedTags,
  onIncludedChange,
  onExcludedChange,
  onClearAll,
  placeholder = "Filter by tags",
}: ITabbedTagDropdownProps) {
  // Ref to track the currently active tab (0 = Include, 1 = Exclude).
  // Using a ref instead of state avoids re-rendering the Select on tab change.
  const tabIndexRef = useRef<number>(0);

  const handleChange = useCallback(
    (_newValue: unknown, actionMeta: ISelectActionMeta) => {
      if (actionMeta.action === "select-option" && actionMeta.option) {
        const added = actionMeta.option;
        if (tabIndexRef.current === 0) {
          // Include tab: add to included list.
          // Only remove from excluded if it was actually there (avoids a second setSearchParams
          // call that would overwrite the first one with a stale URL params snapshot).
          if (excludedTags.some((t) => t.id === added.id)) {
            onExcludedChange(excludedTags.filter((t) => t.id !== added.id));
          }
          onIncludedChange([...includedTags, added]);
        } else {
          // Exclude tab: add to excluded list.
          if (includedTags.some((t) => t.id === added.id)) {
            onIncludedChange(includedTags.filter((t) => t.id !== added.id));
          }
          onExcludedChange([...excludedTags, added]);
        }
      } else if (
        (actionMeta.action === "remove-value" || actionMeta.action === "pop-value") &&
        actionMeta.removedValue
      ) {
        const removed = actionMeta.removedValue;
        // Only call the handler that actually owns this tag.
        if (includedTags.some((t) => t.id === removed.id)) {
          onIncludedChange(includedTags.filter((t) => t.id !== removed.id));
        } else {
          onExcludedChange(excludedTags.filter((t) => t.id !== removed.id));
        }
      } else if (actionMeta.action === "clear") {
        if (onClearAll) {
          onClearAll();
        } else {
          onIncludedChange([]);
          onExcludedChange([]);
        }
      }
    },
    [includedTags, excludedTags, onIncludedChange, onExcludedChange, onClearAll],
  );

  const value = useMemo(() => [...includedTags, ...excludedTags], [includedTags, excludedTags]);

  // Custom props forwarded to custom components via selectProps
  const customSelectProps: ICustomSelectProps = { tabIndexRef, includedTags, excludedTags };

  return (
    <Select
      isMulti
      isSearchable
      isClearable
      options={availableTags}
      value={value}
      onChange={handleChange as any}
      placeholder={placeholder}
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      components={CUSTOM_COMPONENTS as any}
      // Pass custom data to custom components via selectProps
      {...(customSelectProps as any)}
      chakraStyles={{
        control: (provided) => ({
          ...provided,
          borderWidth: "2px",
          borderColor: "black",
          borderRadius: "0",
          minH: "40px",
          minW: "150px",
          _hover: { borderColor: "gray.300" },
        }),
        menuList: (provided) => ({
          ...provided,
          borderTopRadius: 0,
        }),
        option: (provided) => ({
          ...provided,
          color: "black",
          background: "white",
          _hover: { background: "gray.100" },
          _active: { background: "gray.100" },
        }),
        multiValue: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          return {
            ...provided,
            background: isIncluded ? tagData.color : "transparent",
            border: isIncluded ? "none" : `2px solid ${tagData.color}`,
            borderRadius: "full",
            paddingLeft: "6px",
            paddingRight: "6px",
          };
        },
        multiValueLabel: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          const labelColor = isIncluded
            ? colorIsBright(tagData.color)
              ? "black"
              : "white"
            : tagData.color;
          return {
            ...provided,
            color: labelColor,
            textDecoration: isIncluded ? "none" : "line-through",
          };
        },
        multiValueRemove: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          const removeColor = isIncluded
            ? colorIsBright(tagData.color)
              ? "black"
              : "white"
            : tagData.color;
          return {
            ...provided,
            color: removeColor,
            _hover: {
              background: isIncluded ? "blackAlpha.100" : "transparent",
              color: removeColor,
            },
          };
        },
      }}
    />
  );
}
