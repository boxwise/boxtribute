import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DistroSpots from './DistroSpots';


export default {
  title: 'Mobile Distro Events/Distro Spots',
  component: DistroSpots,
  parameters: {
  },
} as ComponentMeta<typeof DistroSpots>;

const Template: ComponentStory<typeof DistroSpots> = (args) => <DistroSpots />;

export const Default = Template.bind({});
Default.args = {
    distroSpots: []
}

export const NoData = Template.bind({});
NoData.args = {
  distroSpots: [],
}