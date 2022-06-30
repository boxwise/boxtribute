import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CreateDistroEvent, {DistroEvent} from './CreateDistroEvent'
import { action } from '@storybook/addon-actions';

const mockedDistroSpot = {
  name: "Horgosz River"
}

export default {
  title: 'Mobile Distro Events/Distro Events/Create Distro Event Date/Component',
  component: CreateDistroEvent,
  parameters: {
  },
} as ComponentMeta<typeof CreateDistroEvent>;

const Template: ComponentStory<typeof CreateDistroEvent> = (args) => <CreateDistroEvent {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroSpot: mockedDistroSpot,
    onSubmitNewDistroEvent: action("onSubmitNewDistroEvent")
}

// export const NoData = Template.bind({});
// NoData.args = {
//     distroEvent: null,
// }
