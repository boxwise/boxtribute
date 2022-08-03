import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Input,
  Button,
  ModalFooter,
  Box,
  FormLabel,
  List,
  ListItem,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { TagType } from "types/generated/graphql";

export interface CreateTagFormData {
  name: string;
  type: TagType;
  color: string;
  description: string;
}

interface CreateTagOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewTag: (data: CreateTagFormData) => void;
  //   createTagFormData: CreateTagFormData;
}

const CreateTagOverlay = ({
  isOpen,
  onClose,
  onCreateNewTag,
}: //   createTagFormData,
CreateTagOverlayProps) => {
  const {
    handleSubmit,
    register,
    
  } = useForm<CreateTagFormData>({
    defaultValues: {
      name: "",
      type: undefined,
      color: "#123456",
      description: "",
    },
  });

  const typesOptions: TagType[] = [
    TagType.All,
    TagType.Beneficiary,
    TagType.Box,
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Enter tag info</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onCreateNewTag)}>
            <Flex direction="column">
              <List mb={4}>
                <ListItem>
                  <FormLabel htmlFor="name">Name of the tag</FormLabel>
                  <Box border="2px">
                    <Input border="0" {...register("name", {})} />
                  </Box>
                </ListItem>
                <ListItem>
                  <FormLabel htmlFor="type">Apply to</FormLabel>
                  <Box>
                    <Select {...register("type")} placeholder="Please select">
                      <option value={typesOptions[0]}>
                        Boxes and Beneficiaries
                      </option>
                      <option value={typesOptions[1]}>Beneficiaries</option>
                      <option value={typesOptions[2]}>Boxes</option>
                    </Select>
                  </Box>
                </ListItem>
                <ListItem>
                  <FormLabel htmlFor="name">Description</FormLabel>
                  <Box border="2px">
                    <Input border="0" {...register("description", {})} />
                  </Box>
                </ListItem>
              </List>

              <Button onClick={onClose} px={6} borderRadius="0" type="submit">
                Save and close
              </Button>
            </Flex>
          </form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default CreateTagOverlay;
