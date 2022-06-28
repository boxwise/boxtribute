import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroEventsCalendarContainer, { DistroEventForCalendar } from "./DistroEventsCalendar";
import { DistributionEventState } from "types/generated/graphql";
import { addDays, addHours } from 'date-fns'

export default {
  title: "Mobile Distro Events/Distro Events/Calendar/Component",
  component: DistroEventsCalendarContainer,
  parameters: {},
  decorators: [],
} as ComponentMeta<typeof DistroEventsCalendarContainer>;

const Template: ComponentStory<typeof DistroEventsCalendarContainer> = (args) => (
  <DistroEventsCalendarContainer {...args} />
);


const todayAtTenThirty = new Date();
todayAtTenThirty.setHours(10, 30, 0, 0);

const distroEvents = [
  {
    id: "1",
    startDateTime: addDays(todayAtTenThirty, 3),
    endDateTime: addHours(addDays(todayAtTenThirty, 3), 3),
    state: DistributionEventState.PlanningDone,
    distroSpotName: "Horgos (River)"
  },
  {
    id: "2",
    startDateTime: addDays(todayAtTenThirty, 11),
    endDateTime: addHours(addDays(todayAtTenThirty, 11), 5),
    state: DistributionEventState.Completed,
    distroSpotName: "Subotica (LIDL)",
  },
] as DistroEventForCalendar[];

export const Default = Template.bind({});
Default.args = {
  distroEvents
};
