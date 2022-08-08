import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroEventsCalendarContainer from "./DistroEventsCalendarContainer";
import { DistributionEventState } from "types/generated/graphql";
import { addDays, addHours } from "date-fns";

export default {
  title: "Mobile Distro Events/Distro Events/Calendar/Component",
  component: DistroEventsCalendarContainer,
  parameters: {},
  decorators: [],
} as ComponentMeta<typeof DistroEventsCalendarContainer>;

const Template: ComponentStory<typeof DistroEventsCalendarContainer> = (
  args
) => <DistroEventsCalendarContainer {...args} />;

const todayAtTenThirty = new Date();
todayAtTenThirty.setHours(10, 30, 0, 0);

const distroEvents = [
  {
    id: "1",
    name: "Distro 1",
    plannedStartDateTime: addDays(todayAtTenThirty, 3),
    plannedEndDateTime: addHours(addDays(todayAtTenThirty, 3), 3),
    state: DistributionEventState.Packing,
    distributionSpot: {
      id: "1",
      name: "Horgos (River)",
    },
  },
  {
    id: "2",
    name: "Distro 2",
    plannedStartDateTime: addDays(todayAtTenThirty, 11),
    plannedEndDateTime: addHours(addDays(todayAtTenThirty, 11), 5),
    state: DistributionEventState.Completed,
    distributionSpot: {
      id: "2",
      name: "Subotica (LIDL)",
    },
  },
];

export const Default = Template.bind({});
Default.args = {
  distributionEvents: distroEvents,
};
