import { StoryFn, Meta } from "@storybook/react";
import DistroEventCompleted, { DistroEventData } from "./DistroEventCompleted";

const mockedDistroEvent: DistroEventData = {
  eventDate: new Date("2022/08/22"),
  status: "Completed",
  id: "2",
  outflows: [
    {
      id: "3",
      labelIdentifier: "348293",
      numberOfItems: 32,
      size: "M",
      name: "T-shirt",
      gender: "Men",
    },
    {
      id: "4",
      labelIdentifier: "348323",
      numberOfItems: 10,
      size: "S",
      name: "T-shirt",
      gender: "Men",
    },
  ],
  returns: [
    {
      id: "3",
      labelIdentifier: "348293",
      numberOfItems: 32,
      size: "M",
      name: "T-shirt",
      gender: "Men",
    },
    {
      id: "4",
      labelIdentifier: "348323",
      numberOfItems: 10,
      size: "S",
      name: "T-shirt",
      gender: "Men",
    },
  ],
};

export default {
  title: "Mobile Distro Events/Distro Events/Detail View/State: 8 - Completed/Component",
  component: DistroEventCompleted,
  parameters: {},
} as Meta<typeof DistroEventCompleted>;

const Template: StoryFn<typeof DistroEventCompleted> = (args) => <DistroEventCompleted {...args} />;

export const Default = Template.bind({});
Default.args = {
  distroEventData: mockedDistroEvent,
};
