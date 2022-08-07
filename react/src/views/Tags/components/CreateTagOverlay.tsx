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
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useState } from "react";
import "./styles.css";

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
  const [color, setColor] = useState("#aabbcc");
  const [prevColor, setPrevColor] = useState("#aabbcc")
  const [open, setOpen] = useState(false);
  const [openMore, setOpenMore] = useState(false);

  const { handleSubmit, register } = useForm<CreateTagFormData>({
    defaultValues: {
      name: "",
      type: undefined,
      color: "#aabbcc",
      description: "",
    },
  });

  const typesOptions: TagType[] = [
    TagType.All,
    TagType.Beneficiary,
    TagType.Box,
  ];

  const tagsDefaultColors = [
    "#F37067",
    "#A9CFE3",
    "#F8A99E",
    "#305C87",
    "#F4E5A0",
    "#D89016",
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
                <ListItem mb={4}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Box border="2px">
                    <Input border="0" {...register("name", {})} />
                  </Box>
                </ListItem>
                <ListItem mb={4}>
                  <FormLabel htmlFor="color">Color</FormLabel>
                  <Flex border="2px" direction="column">
                    <Flex direction="row">
                      <Button
                        borderRadius="0"
                        backgroundColor={color}
                        onClick={() => setOpen(!open)}
                        mx={2}
                      />
                      <HexColorInput
                        color={color}
                        onChange={setColor}
                        style={{ border: "0", outline: "none" }}
                      />
                    </Flex>

                    {open && (
                      <Flex direction="column">
                        <Flex wrap="wrap">
                          {tagsDefaultColors.map((currColor) => (
                            <Button
                              borderRadius="0"
                              m={2}
                              key={currColor}
                              style={{ background: currColor }}
                              onClick={() => setColor(currColor)}
                            />
                          ))}
                        </Flex>
                        <Button
                          onClick={() => setOpenMore(!openMore)}
                          borderRadius="0"
                          m={2}
                        >
                          {openMore ? "Less" : "More"}
                        </Button>
                      </Flex>
                    )}
                    {openMore && open && (
                      <Flex>
                        <Box className="color-picker" m={2}>
                          <HexColorPicker
                            color={color}
                            onChange={setColor}
                            style={{ border: "0" }}
                          />
                        </Box>
                        <Flex justifyContent="flex-end" direction="column" w="100%">
                          <Button onClick={() => {setPrevColor(color); setOpen(!open)}} borderRadius="0" m={2}>
                            Choose
                          </Button>
                          <Button onClick={() => {setColor(prevColor); setOpen(!open)}} borderRadius="0" m={2}>
                            Cancel
                          </Button>
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
                </ListItem>
                <ListItem mb={4}>
                  <FormLabel htmlFor="type">Apply to</FormLabel>
                  <Box border="2px">
                    <Select
                      borderRadius="0"
                      {...register("type")}
                      placeholder="Please select"
                    >
                      <option value={typesOptions[0]}>
                        Boxes and Beneficiaries
                      </option>
                      <option value={typesOptions[1]}>Beneficiaries</option>
                      <option value={typesOptions[2]}>Boxes</option>
                    </Select>
                  </Box>
                </ListItem>
                <ListItem mb={4}>
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
