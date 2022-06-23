import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CreateDistroSpot from './CreateDistroSpot';


export default {
  title: 'Mobile Distro Events/Create Distro Spot',
  component: CreateDistroSpot,
  parameters: {
  },
} as ComponentMeta<typeof CreateDistroSpot>;

const Template: ComponentStory<typeof CreateDistroSpot> = (args) => <CreateDistroSpot {...args}/>;

export const Default = Template.bind({});


