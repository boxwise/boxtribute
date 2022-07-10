import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroEventsCalendar, { DistroEventForCalendar } from "./DistroEventsCalendar";
import { DistributionEventState } from "types/generated/graphql";
import { addDays, addHours } from 'date-fns'

export default {
  title: "Mobile Distro Events/Distro Events/Calendar/Component",
  component: DistroEventsCalendar,
  parameters: {},
  decorators: [],
} as ComponentMeta<typeof DistroEventsCalendar>;

const Template: ComponentStory<typeof DistroEventsCalendar> = (args) => (
  <DistroEventsCalendar {...args} />
);


const todayAtTenThirty = new Date();
todayAtTenThirty.setHours(10, 30, 0, 0);

const distroEvents = [
  {
    id: "1",
    startDateTime: addDays(todayAtTenThirty, 3),
    endDateTime: addHours(addDays(todayAtTenThirty, 3), 3),
    state: DistributionEventState.Returned,
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
