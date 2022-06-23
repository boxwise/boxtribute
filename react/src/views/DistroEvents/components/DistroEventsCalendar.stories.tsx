import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroEventsCalendar from "./DistroEventsCalendar";

export default {
  title: "Mobile Distro Events/Distro Events/Calendar/Component",
  component: DistroEventsCalendar,
  parameters: {},
  decorators: [
  ],
} as ComponentMeta<typeof DistroEventsCalendar>;

const Template: ComponentStory<typeof DistroEventsCalendar> = (args) => (
  <DistroEventsCalendar />
);

export const Default = Template.bind({});
Default.args = {
  onGoToDistroEventView: action("onGoToDistroEventView for id"),
};
