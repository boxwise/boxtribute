import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DistroSpots, { DistroSpot } from './DistroSpots';



const mockedDistroSpots: DistroSpot[] = [
  {
    id: "1",
    name: "Horgosz"
  },
  {
    id: "2",
    name: "Subotica",
    nextDistroEventDate: new Date("2022/08/22")
  },
  {
    id: "3",
    name: "Bihac",
    nextDistroEventDate: new Date("2022/09/15"), 
    comment: "This distro spot is currently having issues regarding accessibility for our 2nd vehicle."
  }
];

export default {
  title: 'Mobile Distro Events/Distro Spots',
  component: DistroSpots,
  parameters: {
  },
} as ComponentMeta<typeof DistroSpots>;

const Template: ComponentStory<typeof DistroSpots> = (args) => <DistroSpots {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroSpots: mockedDistroSpots
}

export const NoData = Template.bind({});
NoData.args = {
  distroSpots: [],
}