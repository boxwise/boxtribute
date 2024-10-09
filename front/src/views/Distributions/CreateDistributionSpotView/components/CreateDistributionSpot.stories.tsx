import { StoryFn, Meta } from "@storybook/react";
import CreateDistributionSpot from "./CreateDistributionSpot";

export default {
  title: "Mobile Distro Events/Distro Spots/Create Distro Spot",
  component: CreateDistributionSpot,
  parameters: {},
} as Meta<typeof CreateDistributionSpot>;

const Template: StoryFn<typeof CreateDistributionSpot> = (args) => (
  <CreateDistributionSpot {...args} />
);

export const Default = Template.bind({});
