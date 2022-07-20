import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import PackingBoxDetailsOverlay from './PackingBoxDetailsOverlay';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/Second Overlay',
  component: PackingBoxDetailsOverlay,
  parameters: {
  },
} as ComponentMeta<typeof PackingBoxDetailsOverlay>;

const Template: ComponentStory<typeof PackingBoxDetailsOverlay> = (args) => <PackingBoxDetailsOverlay {...args} />;

export const Default = Template.bind({});