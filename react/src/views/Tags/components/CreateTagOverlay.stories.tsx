import { ComponentMeta, ComponentStory } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { Container } from "@chakra-ui/react";
import CreateTagOverlay from "./CreateTagOverlay";

export default {
  title: "Tags/Create Tags Overlay",
  component: CreateTagOverlay,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      return (
        <Container maxWidth="container.xl">
          <Story />
        </Container>
      );
    },
  ],
} as ComponentMeta<typeof CreateTagOverlay>;

const Template: ComponentStory<typeof CreateTagOverlay> = (args) => {
  // const {
  //   isOpen: isCreateTagOverlayOpen,
  //   onOpen: onCreateNewTagOpen,
  //   onClose: onCreateNewTagClose,
  // } = useDisclosure();

  return <CreateTagOverlay {...args} />;
};

export const Standard = Template.bind({});
Standard.args = {
  isOpen: true, 
  onCreateNewTag: action("onCreateNewTag"),
  onClose: action("onClose")
};
