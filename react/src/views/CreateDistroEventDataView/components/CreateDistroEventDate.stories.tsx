import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import CreateDistroEventDate, {DistroEvent} from './CreateDistroEventDate'



const mockedCreateDistroEvent: DistroEvent = {
    distroSpot: "Horgosz River"
}

export default {
  title: 'Mobile Distro Events/Create Distro Event Date',
  component: CreateDistroEventDate,
  parameters: {
  },
} as ComponentMeta<typeof CreateDistroEventDate>;

const Template: ComponentStory<typeof CreateDistroEventDate> = (args) => <CreateDistroEventDate {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEvent: mockedCreateDistroEvent
}

// export const NoData = Template.bind({});
// NoData.args = {
//     distroEvent: null,
// }