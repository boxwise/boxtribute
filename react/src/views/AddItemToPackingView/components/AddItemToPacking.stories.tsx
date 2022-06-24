import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProductData } from "./../../AddItemToPackingView/components/AddItemToPacking";
import AddItemToPacking from "./AddItemToPacking";

const mockedAddItemToPacking: ProductData[] = [
  {
    id: "1",
    name: "Jacket",
    sizes: [
      {
        id: "1",
        name: "S",
      },
      {
        id: "2",
        name: "M",
      },
      {
        id: "3",
        name: "L",
      },
    ],
  },
  {
    id: "2",
    name: "T-shirt",
    sizes: [
      {
        id: "1",
        name: "S",
      },
      {
        id: "3",
        name: "L",
      },
      {
        id: "4",
        name: "XL",
      },
    ],
  },
  {
    id: "3",
    name: "Skirt",
    sizes: [
      {
        id: "1",
        name: "S",
      },
      {
        id: "4",
        name: "XL",
      },
    ],
  },
];

export default {
  title: "Mobile Distro Events/Add Items to Packing",
  component: AddItemToPacking,
  parameters: {},
} as ComponentMeta<typeof AddItemToPacking>;

const Template: ComponentStory<typeof AddItemToPacking> = (args) => (
  <AddItemToPacking {...args} />
);

export const Default = Template.bind({});
Default.args = {
  productsData: mockedAddItemToPacking,
};
