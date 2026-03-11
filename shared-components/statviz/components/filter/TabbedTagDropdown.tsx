import { useRef, useMemo, useCallback, useState } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs, Flex } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Select, chakraComponents } from "chakra-react-select";

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
function CustomMenu(menuProps: { selectProps: ICustomSelectProps; children: React.ReactNode }) {
  const [tabIndex, setTabIndex] = useState(0);
  const { tabIndexRef } = menuProps.selectProps;

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    if (tabIndexRef) {
      tabIndexRef.current = index;
    }
  };

  return (
    <chakraComponents.Menu {...(menuProps as any)}>
      <Tabs index={tabIndex} onChange={handleTabChange} size="sm">
        <TabList>
          <Tab flex="1">Include</Tab>
          <Tab flex="1">Exclude</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>{tabIndex === 0 ? menuProps.children : null}</TabPanel>
          <TabPanel p={0}>{tabIndex === 1 ? menuProps.children : null}</TabPanel>
        </TabPanels>
      </Tabs>
    </chakraComponents.Menu>
  );
}

// Custom Option component that shows a color dot and a check mark when already selected.
function CustomOption(optionProps: { data: ITagFilterValue; selectProps: ICustomSelectProps }) {
  const { data, selectProps } = optionProps;
  const { includedTags = [], excludedTags = [] } = selectProps;
  const isIncluded = includedTags.some((t) => t.id === data.id);
  const isExcluded = excludedTags.some((t) => t.id === data.id);

  return (
    <chakraComponents.Option {...(optionProps as any)}>
      <Flex justify="space-between" align="center" width="100%">
        <Flex align="center" gap={2}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: data.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
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
          // Include tab: add to included, remove from excluded if present
          onIncludedChange([...includedTags, added]);
          onExcludedChange(excludedTags.filter((t) => t.id !== added.id));
        } else {
          // Exclude tab: add to excluded, remove from included if present
          onExcludedChange([...excludedTags, added]);
          onIncludedChange(includedTags.filter((t) => t.id !== added.id));
        }
      } else if (
        (actionMeta.action === "remove-value" || actionMeta.action === "pop-value") &&
        actionMeta.removedValue
      ) {
        const removed = actionMeta.removedValue;
        onIncludedChange(includedTags.filter((t) => t.id !== removed.id));
        onExcludedChange(excludedTags.filter((t) => t.id !== removed.id));
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
        multiValue: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          return {
            ...provided,
            background: isIncluded ? tagData.color : "transparent",
            border: isIncluded ? "none" : `2px solid ${tagData.color}`,
            borderRadius: "full",
            paddingLeft: "6px",
            paddingRight: "2px",
          };
        },
        multiValueLabel: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          return {
            ...provided,
            color: isIncluded ? "white" : tagData.color,
            textDecoration: isIncluded ? "none" : "line-through",
          };
        },
        multiValueRemove: (provided, { data }) => {
          const tagData = data as ITagFilterValue;
          const isIncluded = includedTags.some((t) => t.id === tagData.id);
          return {
            ...provided,
            color: isIncluded ? "white" : tagData.color,
            _hover: {
              background: isIncluded ? "whiteAlpha.300" : "transparent",
              color: isIncluded ? "white" : tagData.color,
            },
          };
        },
      }}
    />
  );
}
