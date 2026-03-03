import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Text,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { ITagFilterValue } from "../../state/filter";
import MultiSelectList from "./MultiSelectList";

interface ITabbedTagDropdownProps {
  availableTags: ITagFilterValue[];
  includedTags: ITagFilterValue[];
  excludedTags: ITagFilterValue[];
  onIncludedChange: (tags: ITagFilterValue[]) => void;
  onExcludedChange: (tags: ITagFilterValue[]) => void;
  onClearAll?: () => void;
  placeholder?: string;
}

/**
 * Tabbed dropdown component for selecting included and excluded tags.
 * Features two tabs: "Include" for tags to include and "Exclude" for tags to exclude.
 * The dropdown remains open after selecting tags and only closes when clicking outside.
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
  const hasSelections = includedTags.length > 0 || excludedTags.length > 0;

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearAll) {
      onClearAll();
    } else {
      // Fallback: clear both separately
      onIncludedChange([]);
      onExcludedChange([]);
    }
  };

  const renderSelectedTags = () => {
    const allSelected = [...includedTags, ...excludedTags];
    if (allSelected.length === 0) {
      return (
        <Text color="gray.500" fontSize="md">
          {placeholder}
        </Text>
      );
    }

    return (
      <Flex flexWrap="wrap" gap={1} alignItems="center">
        {includedTags.map((tag) => (
          <Tag key={`inc-${tag.id}`} size="sm" bg={tag.color} color="white" borderRadius="full">
            {tag.label}
          </Tag>
        ))}
        {excludedTags.map((tag) => (
          <Tag
            key={`exc-${tag.id}`}
            size="sm"
            variant="outline"
            shadow={`inset 0 0 0px 2px ${tag.color}`}
            color={tag.color}
            borderRadius="full"
          >
            <TagLabel textDecoration="line-through">{tag.label}</TagLabel>
          </Tag>
        ))}
      </Flex>
    );
  };

  return (
    <Flex gap={0} position="relative">
      <Popover closeOnBlur>
        {() => (
          <>
            <PopoverTrigger>
              <Button
                variant="outline"
                width="100%"
                justifyContent="space-between"
                rightIcon={<ChevronDownIcon />}
                borderColor="black"
                borderWidth="2px"
                borderRadius="0"
                fontWeight="normal"
                minH="40px"
                h="auto"
                py={2}
              >
                <Box flex="1" textAlign="left" overflow="hidden">
                  {renderSelectedTags()}
                </Box>
              </Button>
            </PopoverTrigger>
            <PopoverContent width="250px" borderRadius="0" borderColor="black" borderWidth="2px">
              <PopoverBody p={0}>
                <Tabs>
                  <TabList>
                    <Tab flex="1">Include</Tab>
                    <Tab flex="1">Exclude</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={2}>
                      <MultiSelectList
                        values={availableTags}
                        selectedValues={includedTags}
                        onChange={onIncludedChange}
                      />
                    </TabPanel>
                    <TabPanel p={2}>
                      <MultiSelectList
                        values={availableTags}
                        selectedValues={excludedTags}
                        onChange={onExcludedChange}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </PopoverBody>
            </PopoverContent>
          </>
        )}
      </Popover>
      {hasSelections && (
        <IconButton
          aria-label="Clear all filters"
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          onClick={handleClearAll}
          position="absolute"
          right="32px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
          pointerEvents="auto"
        />
      )}
    </Flex>
  );
}
