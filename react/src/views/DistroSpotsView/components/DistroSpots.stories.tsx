import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DistroSpots, { DistributionEventState, DistroSpot } from "./DistroSpots";

const mockedDistroSpots: DistroSpot[] = [
  {
    id: "1",
    name: "Horgosz",
    distroEvents: [],
  },
  {
    id: "2",
    name: "Subotica",
    nextDistroEventDate: new Date("2022/08/22"),
    distroEvents: [
      {
        date: new Date("2022/08/22"),
        state: DistributionEventState.PlanningDone,
        id: "1",
      },
      {
        date: new Date("2022/02/13"),
        state: DistributionEventState.Completed,
        id: "2",
      },
    ],
  },
  {
    id: "3",
    name: "Bihac",
    nextDistroEventDate: new Date("2022/09/15"),
    comment:
      "This distro spot is currently having issues regarding accessibility for our 2nd vehicle.",
    distroEvents: [
      {
        date: new Date("2022/09/15"),
        state: DistributionEventState.Planning,
        id: "3",
      },
    ],
  },
];

export default {
  title: "Mobile Distro Events/Distro Spots/Component",
  component: DistroSpots,
  parameters: {},
} as ComponentMeta<typeof DistroSpots>;

const Template: ComponentStory<typeof DistroSpots> = (args) => (
  <DistroSpots {...args} />
);

export const Default = Template.bind({});
Default.args = {
  distroSpots: mockedDistroSpots,
};

export const NoData = Template.bind({});
NoData.args = {
  distroSpots: [],
};
