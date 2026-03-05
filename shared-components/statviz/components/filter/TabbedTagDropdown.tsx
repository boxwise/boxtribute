import {
  Box,
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
  TagCloseButton,
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
          <Tag key={`inc-${tag.id}`} size="md" bg={tag.color} color="white" borderRadius="full">
            {tag.label}
            <TagCloseButton
              ml={1}
              onClick={(e) => {
                e.stopPropagation();
                onIncludedChange(includedTags.filter((t) => t.id !== tag.id));
              }}
            />
          </Tag>
        ))}
        {excludedTags.map((tag) => (
          <Tag
            key={`exc-${tag.id}`}
            size="md"
            variant="outline"
            shadow={`inset 0 0 0px 2px ${tag.color}`}
            color={tag.color}
            borderRadius="full"
          >
            <TagLabel textDecoration="line-through">{tag.label}</TagLabel>
            <TagCloseButton
              ml={1}
              onClick={(e) => {
                e.stopPropagation();
                onExcludedChange(excludedTags.filter((t) => t.id !== tag.id));
              }}
            />
          </Tag>
        ))}
      </Flex>
    );
  };

  return (
    <Popover closeOnBlur>
      {() => (
        <>
          <PopoverTrigger>
            <Flex
              gap={1}
              width="100%"
              justifyContent="space-between"
              align="center"
              borderColor="black"
              borderWidth="2px"
              borderRadius="0"
              fontWeight="normal"
              minH="40px"
              minW="150px"
              h="auto"
              py={0}
              _hover={{ borderColor: "gray.300" }}
            >
              <Box flex="1" ml={4} textAlign="left" overflow="hidden">
                {renderSelectedTags()}
              </Box>
              {hasSelections && (
                <Flex ml={2} mr={2}>
                  <IconButton
                    aria-label="Clear all filters"
                    icon={<CloseIcon boxSize="3" />}
                    size="sm"
                    borderRadius="5"
                    variant="ghost"
                    onClick={handleClearAll}
                  />
                </Flex>
              )}
              <Flex mr={2}>
                <ChevronDownIcon boxSize="5" />
              </Flex>
            </Flex>
          </PopoverTrigger>
          <PopoverContent
            width="250px"
            borderColor="gray.100"
            borderWidth="1px"
            borderRadius="5"
          >
            <PopoverBody p={0}>
              <Tabs>
                <TabList>
                  <Tab flex="1">Include</Tab>
                  <Tab flex="1">Exclude</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p={0}>
                    <MultiSelectList
                      values={availableTags}
                      selectedValues={includedTags}
                      onChange={onIncludedChange}
                    />
                  </TabPanel>
                  <TabPanel p={0}>
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
  );
}
