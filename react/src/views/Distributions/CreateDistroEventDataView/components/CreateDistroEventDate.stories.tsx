import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CreateDistroEventDate, {DistroEvent} from './CreateDistroEventDate'



const mockedCreateDistroEvent: DistroEvent = {
    distroSpot: "Horgosz River"
}

export default {
  title: 'Mobile Distro Events/Distro Events/Create Distro Event Date/Component',
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
