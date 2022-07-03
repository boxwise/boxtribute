import React from "react";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import HeaderMenu from "./HeaderMenuMobile";
import { action } from "@storybook/addon-actions";
import { Container } from "@chakra-ui/react";
import HeaderMenuContainer from "./HeaderMenuContainer";

export default {
  title: "General/Header Menu",
  component: HeaderMenuContainer,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
      (Story) => <Container maxWidth="container.xl"><Story /></Container>
  ]
} as ComponentMeta<typeof HeaderMenuContainer>;

const Template: ComponentStory<typeof HeaderMenuContainer> = (args) => (
  <HeaderMenuContainer />
);

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  loginWithRedirect: action("loginWithRedirect was clicked"),
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  ...LoggedOut.args,
  isAuthenticated: true,
  user: {
    picture:
      "https://s.gravatar.com/avatar/076a89d48754136a0a1ac3afa082f9d8?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fdc.png",
    email: "emil@ngo.org",
  },
  currentActiveBaseId: "10",
  availableBases: [
    {
      id: "3",
      name: "Base 3",
    },
    {
      id: "10",
      name: "Base 10",
    },
  ],
  logout: action("logout was clicked"),
};
