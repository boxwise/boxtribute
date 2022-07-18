import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CreateDistributionSpot from './CreateDistributionSpot';


export default {
  title: 'Mobile Distro Events/Distro Spots/Create Distro Spot',
  component: CreateDistributionSpot,
  parameters: {
  },
} as ComponentMeta<typeof CreateDistributionSpot>;

const Template: ComponentStory<typeof CreateDistributionSpot> = (args) => <CreateDistributionSpot {...args}/>;

export const Default = Template.bind({});
