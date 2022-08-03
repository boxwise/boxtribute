import { AddIcon } from "@chakra-ui/icons";
import { Button, Flex } from "@chakra-ui/react";

interface OperationsTagsProps {
  onCreateNewTag: () => void;
}

const OperationsTags = ({ onCreateNewTag }: OperationsTagsProps) => {
  return (
    <Flex>
      <Button
        onClick={onCreateNewTag}
        borderRadius="0"
        // backgroundColor="transparent"
        aria-label="create new tag"
      ><AddIcon w={4} h={4} mr={2}/>
        Add a tag
      </Button>
    </Flex>
  );
};

export default OperationsTags;
