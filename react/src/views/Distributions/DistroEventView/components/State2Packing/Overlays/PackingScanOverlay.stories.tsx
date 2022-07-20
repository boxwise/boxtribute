import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import PackingScanOverlay from './PackingBoxDetailsOverlay';



export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/First Overlay',
  component: PackingScanOverlay,
  parameters: {
  },
} as ComponentMeta<typeof PackingScanOverlay>;

const Template: ComponentStory<typeof PackingScanOverlay> = (args) => <PackingScanOverlay {...args} />;

export const Default = Template.bind({});