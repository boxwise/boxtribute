import { StoryFn, Meta } from "@storybook/react";
import DistroSpots from "./DistroSpots";
import { DistributionSpotEnrichedData } from "views/Distributions/types";

const mockedDistroSpots: DistributionSpotEnrichedData[] = [
  {
    id: "1",
    baseId: "10",
    name: "Horgosz",
    distroEvents: [],
  },
  {
    id: "2",
    baseId: "10",
    name: "Subotica",
    nextDistroEventDate: new Date("2022/08/22"),
    distroEvents: [
      {
        plannedStartDateTime: new Date("2022/08/22"),
        plannedEndDateTime: new Date("2022/08/22"),
        state: "Packing",
        id: "1",
      },
      {
        plannedStartDateTime: new Date("2022/02/13"),
        plannedEndDateTime: new Date("2022/08/22"),
        state: "Completed",
        id: "2",
      },
    ],
  },
  {
    id: "3",
    baseId: "10",
    name: "Bihac",
    nextDistroEventDate: new Date("2022/09/15"),
    comment:
      "This distro spot is currently having issues regarding accessibility for our 2nd vehicle.",
    distroEvents: [
      {
        plannedStartDateTime: new Date("2022/09/15"),
        plannedEndDateTime: new Date("2022/09/22"),
        state: "Planning",
        id: "3",
      },
    ],
  },
];

export default {
  title: "Mobile Distro Events/Distro Spots/List View/Component",
  component: DistroSpots,
  parameters: {},
} as Meta<typeof DistroSpots>;

const Template: StoryFn<typeof DistroSpots> = (args) => <DistroSpots {...args} />;

export const Default = Template.bind({});
Default.args = {
  distroSpots: mockedDistroSpots,
};

export const NoData = Template.bind({});
NoData.args = {
  distroSpots: [],
};
