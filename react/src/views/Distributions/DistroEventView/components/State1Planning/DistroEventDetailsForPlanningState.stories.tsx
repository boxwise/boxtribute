import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { DistributionEventState, ProductGender } from "types/generated/graphql";
import DistroEventDetailsForPlanningState from "./DistroEventDetailsForPlanningState";
import { action } from "@storybook/addon-actions";
import { PackingListEntry } from "views/Distributions/types";

const mockedDistroEventPackingList: PackingListEntry[] =
  [
    {
      id: "3",
      numberOfItems: 32,
      size: {
        id: "123",
        label: "M",
      },
      product: {
        id: "1",
        name: "T-shirt"
      },
      gender: ProductGender.Men,
    },
    {
      id: "4",
      numberOfItems: 10,
      size: {
        id: "234",
        label: "S",
      },
      product: {
        id: "2",
        name: "T-shirt"
      },
      gender: ProductGender.Women,
    },
  ];

export default {
  title:
    "Mobile Distro Events/Distro Events/Detail View/State: 1 - Planning/Component",
  component: DistroEventDetailsForPlanningState,
  parameters: {},
} as ComponentMeta<typeof DistroEventDetailsForPlanningState>;

const Template: ComponentStory<typeof DistroEventDetailsForPlanningState> = (args) => (
  <DistroEventDetailsForPlanningState {...args} />
);

export const Default = Template.bind({});
Default.args = {
  packingListEntries: mockedDistroEventPackingList,
  onAddItemsClick: action("onAddItemsClick"),
  onCopyPackingListFromPreviousEventsClick: action(
    "onCopyPackingListFromPreviousEventsClick"
  ),
  onEditItemOnPackingListClick: action("onEditItemOnPackingListClick"),
  onRemoveItemFromPackingListClick: action("onRemoveItemFromPackingListClick"),
};
