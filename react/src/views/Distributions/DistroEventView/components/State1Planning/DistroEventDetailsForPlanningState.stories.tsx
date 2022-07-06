import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { DistributionEventState, ProductGender } from "types/generated/graphql";
import DistroEventDetailsForPlanningState, {
  DistroEventDetailsDataForPlanningState,
} from "./DistroEventDetailsForPlanningState";
import { action } from "@storybook/addon-actions";

const mockedDistroEventPackingList: DistroEventDetailsDataForPlanningState = {
  distroEventData: {
    id: "1",
    plannedStartDateTime: new Date("2022/09/22"),
    distributionSpot: {
      id: "1",
      name: "Horgosz River",
    },
    state: DistributionEventState.Planning,
  },
  itemsForPacking: [
    {
      id: "3",
      items: 32,
      size: "M",
      productName: "T-shirt",
      gender: ProductGender.Men,
    },
    {
      id: "4",
      items: 10,
      size: "S",
      productName: "T-shirt",
      gender: ProductGender.Women,
    },
  ],
};

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
  distroEventDetailsData: mockedDistroEventPackingList,
  onAddItemsClick: action("onAddItemsClick"),
  onCopyPackingListFromPreviousEventsClick: action(
    "onCopyPackingListFromPreviousEventsClick"
  ),
  onEditItemOnPackingListClick: action("onEditItemOnPackingListClick"),
  onRemoveItemFromPackingListClick: action("onRemoveItemFromPackingListClick"),
};
