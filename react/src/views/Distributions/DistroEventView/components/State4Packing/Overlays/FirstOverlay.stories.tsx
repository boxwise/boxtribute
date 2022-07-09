import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import FirstOverlay from './SecondOverlay';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/First Overlay',
  component: FirstOverlay,
  parameters: {
  },
} as ComponentMeta<typeof FirstOverlay>;

const Template: ComponentStory<typeof FirstOverlay> = (args) => <FirstOverlay {...args} />;

export const Default = Template.bind({});