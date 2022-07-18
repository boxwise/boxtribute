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

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  isAuthenticated: true,
  user: {
    picture:
      "https://s.gravatar.com/avatar/076a89d48754136a0a1ac3afa082f9d8?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fdc.png",
    email: "emil@ngo-with-many-characters.org",
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
      text: "Boxes",
      links: [
        { link: "link", name: "Print Labels" },
        { link: "link1", name: "Manage Boxes" },
        { link: "link", name: "Stock Overview" },
      ],
    },
    {
      text: "Freeshop",
      links: [
        { link: "link", name: "Manage Beneficiaries" },
        { link: "link1", name: "Checkout" },
        { link: "link2", name: "Generate Market Schedule" },
      ],
    },
    {
      text: "Mobile Distributions",
      links: [
        { link: "link", name: "Calendar" },
        { link: "link1", name: "Distribution Events" },
        { link: "link2", name: "Distribution Spots" },
      ],
    },
    {
      text: "Box Transfers",
      links: [
        { link: "link", name: "Transfer Agreements" },
        { link: "link1", name: "Shipments" },
      ],
    },
    {
      text: "Data Insights",
      links: [
        { link: "link", name: "Charts" },
        { link: "link1", name: "Export" },
      ],
    },
    {
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
