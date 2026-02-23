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
  CloseButton,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { ITagFilterValue } from "../../state/tagFilterDashboard";
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
        <Text color="gray.500" fontSize="m">
          {placeholder}
        </Text>
      );
    }

    return (
      <Flex flexWrap="wrap" gap={1} alignItems="center">
        {includedTags.map((tag) => (
          <Tag key={`inc-${tag.id}`} size="sm" bg={tag.color} color="white" borderRadius="full">
            {tag.label}
            <CloseButton
              size="sm"
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
            size="sm"
            variant="outline"
            shadow={`inset 0 0 0px 2px ${tag.color}`}
            color={tag.color}
            borderRadius="full"
          >
            <TagLabel textDecoration="line-through">{tag.label}</TagLabel>
            <CloseButton
              size="sm"
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
            <Button
              variant="outline"
              width="100%"
              justifyContent="space-between"
              rightIcon={hasSelections ? undefined : <ChevronDownIcon />}
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
              {hasSelections && (
                <Flex gap={1} ml={2}>
                  <IconButton
                    aria-label="Clear all filters"
                    icon={<CloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={handleClearAll}
                  />
                  <ChevronDownIcon boxSize={5} />
                </Flex>
              )}
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
  );
}
