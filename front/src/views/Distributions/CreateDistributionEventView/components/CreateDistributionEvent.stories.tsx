import { action } from "@storybook/addon-actions";
import { StoryFn, Meta } from "@storybook/react";
import CreateDistroEvent from "./CreateDistributionEvent";

const mockedDistroSpot = {
  name: "Horgosz River",
};

export default {
  title: "Mobile Distro Events/Distro Events/Create Distro Event Date/Component",
  component: CreateDistroEvent,
  parameters: {},
} as Meta<typeof CreateDistroEvent>;

const Template: StoryFn<typeof CreateDistroEvent> = (args) => <CreateDistroEvent {...args} />;

export const Default = Template.bind({});
Default.args = {
  distroSpot: mockedDistroSpot,
  onSubmitNewDistroEvent: action("onSubmitNewDistroEvent"),
};
