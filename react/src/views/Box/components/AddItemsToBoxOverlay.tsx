import {
    Button,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { IChangeNumberOfItemsBoxData } from "../BoxView";

interface IPropsAddItemsToBoxOverlay {
    isOpen: boolean;
    onClose: () => void;
    onSubmitAddItemstoBox: (data: IChangeNumberOfItemsBoxData) => void;
}

function AddItemsToBoxOverlay({
    isOpen,
    onClose,
    onSubmitAddItemstoBox,
}: IPropsAddItemsToBoxOverlay) {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<IChangeNumberOfItemsBoxData>({});

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent borderRadius="0">
                <ModalHeader>Add Items to the Box</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmitAddItemstoBox)}>
                        <Flex>
                            <Input
                                placeholder="Number of items"
                                mr={4}
                                border="2px"
                                focusBorderColor="gray.400"
                                borderRadius="0"
                                type="number"
                                mb={4}
                                {...register("numberOfItems", {
                                    valueAsNumber: true,
                                })}
                            />
                            <Button px={6} borderRadius="0" type="submit" isLoading={isSubmitting}>
                                Submit
                            </Button>
                        </Flex>
                    </form>
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}

export default AddItemsToBoxOverlay;
