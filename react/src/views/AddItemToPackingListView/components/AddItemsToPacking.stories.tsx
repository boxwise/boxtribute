import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProductData } from "./AddItemsToPackingList";
import AddItemsToPackingList from "./AddItemsToPackingList";

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
  title: "Mobile Distro Events/Add Items to Packing List",
  component: AddItemsToPackingList,
  parameters: {},
} as ComponentMeta<typeof AddItemsToPackingList>;

const Template: ComponentStory<typeof AddItemsToPackingList> = (args) => (
  <AddItemsToPackingList {...args} />
);

export const Default = Template.bind({});
Default.args = {
  productsData: mockedAddItemToPacking,
};
