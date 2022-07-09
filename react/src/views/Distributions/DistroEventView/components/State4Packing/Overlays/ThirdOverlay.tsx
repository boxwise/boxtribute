import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Flex,
    Text,
    FormControl,
    Input,
  } from "@chakra-ui/react";
  import { useCallback, useState } from "react";
  import { ProductGender } from "types/generated/graphql";
import { StateProps } from "./SecondOverlay";
  
  interface ModalProps {
    isThirdOpen: boolean;
    onThirdClose: () => void;
  }
  
 interface ThirdOverlayProps {
    modalProps: ModalProps;
    stateProps: StateProps;
  }
  
  const ThirdOverlay = ({
    modalProps,
    stateProps
  }: ThirdOverlayProps) => {
    
  
  
    return (    
      <>
        <Modal isOpen={modalProps.isThirdOpen} onClose={modalProps.onThirdClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader mx={4} pb={0}>
              Done!
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody mx={4}>
              {stateProps.isMovingItems ?
              <Text>Items are</Text> :
              <Text>Box is</Text>
             } 
             <Text>moved to the distribution</Text>
            </ModalBody>
            <ModalFooter />
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default ThirdOverlay;
  