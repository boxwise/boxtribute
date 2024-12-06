import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import { IPackingListEntry } from "views/Distributions/types";
import DistroEventDetailsForPlanningState from "./DistroEventDetailsForPlanningState";

const mockedDistroEventPackingList: IPackingListEntry[] = [
  {
    id: "3",
    numberOfItems: 32,
    size: {
      id: "123",
      label: "M",
    },
    product: {
      id: "1",
      name: "T-shirt",
      gender: "Men",
    },
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
      name: "T-shirt",
      gender: "Women",
    },
  },
];

export default {
  title: "Mobile Distro Events/Distro Events/Detail View/State: 1 - Planning/Component",
  component: DistroEventDetailsForPlanningState,
  parameters: {},
} as Meta<typeof DistroEventDetailsForPlanningState>;

const Template: StoryFn<typeof DistroEventDetailsForPlanningState> = (args) => (
  <DistroEventDetailsForPlanningState {...args} />
);

export const Default = Template.bind({});
Default.args = {
  packingListEntries: mockedDistroEventPackingList,
  onAddItemsClick: action("onAddItemsClick"),
  onCopyPackingListFromPreviousEventsClick: action("onCopyPackingListFromPreviousEventsClick"),
  onUpdatePackingListEntry: action("onEditItemOnPackingListClick"),
  onRemoveItemFromPackingListClick: action("onRemoveItemFromPackingListClick"),
};
