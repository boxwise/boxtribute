import React from "react";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import HeaderMenu from "./HeaderMenu";
import { action } from "@storybook/addon-actions";
import { Container } from "@chakra-ui/react";

export default {
  title: "General/Header Menu",
  component: HeaderMenu,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
      (Story) => <Container maxWidth="container.xl"><Story /></Container>
  ]
} as ComponentMeta<typeof HeaderMenu>;

const Template: ComponentStory<typeof HeaderMenu> = (args) => (
  <HeaderMenu {...args} />
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
  menuItems: [
    {
      to: `/bases/123/boxes`,
      text: "Boxes",
      links: [
        { link: "link", name: "Print Labels" },
        { link: "link1", name: "Manage Boxes" },
        { link: "link", name: "Stock Overview" },
      ],
    },
    {
      to: `/bases/123/freeshop`,
      text: "Freeshop",
      links: [
        { link: "link", name: "Manage Beneficiaries" },
        { link: "link1", name: "Checkout" },
        { link: "link2", name: "Generate Market Schedule" },
      ],
    },
    {
      to: `/bases/123/distributions`,
      text: "Mobile Distributions",
      links: [
        { link: "link", name: "Calendar" },
        { link: "link1", name: "Distribution Events" },
        { link: "link2", name: "Distribution Spots" },
      ],
    },
    {
      to: `/bases/123/box-transfers`,
      text: "Box Transfers",
      links: [
        { link: "link", name: "Transfer Agreements" },
        { link: "link1", name: "Shipments" },
      ],
    },
    {
      to: `/bases/123/insights`,
      text: "Data Insights",
      links: [
        { link: "link", name: "Charts" },
        { link: "link1", name: "Export" },
      ],
    },
    {
      to: `/bases/123/admin`,
      text: "Admin",
      links: [
        { link: "link", name: "Manage Tags" },
        { link: "link1", name: "Manage Products" },
        { link: "link1", name: "Edit Warehouses" },
        { link: "link1", name: "Manage Users" },
      ],
    },
  ],
  logout: action("logout was clicked"),
};
