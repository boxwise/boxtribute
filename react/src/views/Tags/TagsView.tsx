import { gql, useMutation } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { CreateTagMutation, CreateTagMutationVariables } from "types/generated/graphql";
import CreateTagOverlay, { CreateTagFormData } from "./components/CreateTagOverlay";
import OperationsTags from "./components/OperationsTags";

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($name: String!, $description: String, $type: TagType!, $color: String!, $baseId: Int!) {
    createTag(
      creationInput: {
        name: $name
        description: $description
        color: $color
        type: $type
        baseId: $baseId
      }
    ) {
      id
    }
  }
`;

const TagsView = () => {
  const {
    isOpen: isCreateTagOverlayOpen,
    onOpen: onCreateNewTagOpen,
    onClose: onCreateNewTagClose,
  } = useDisclosure();

  const baseId = useParams<{ baseId: string }>().baseId!;
  


  const [createTagMutation] = useMutation<
    CreateTagMutation,
    CreateTagMutationVariables
  >(CREATE_TAG_MUTATION);

const onCreateNewTag = (tagFormValues: CreateTagFormData ) => {
    console.log("tagFormValues", tagFormValues);
    createTagMutation({
        variables:
        {
            name: tagFormValues.name,
            description: tagFormValues.description,
            type: tagFormValues.type,
            color: tagFormValues.color,
            baseId: parseInt(baseId),
        }
    });

}
  return (
    <>
      <OperationsTags onCreateNewTag={onCreateNewTagOpen} />
      <CreateTagOverlay
        isOpen={isCreateTagOverlayOpen}
        onClose={onCreateNewTagClose}
        onCreateNewTag={onCreateNewTag}
      />
    </>
  );
};


export default TagsView;
