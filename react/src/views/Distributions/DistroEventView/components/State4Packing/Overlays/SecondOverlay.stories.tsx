import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SecondOverlay from './SecondOverlay';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/Second Overlay',
  component: SecondOverlay,
  parameters: {
  },
} as ComponentMeta<typeof SecondOverlay>;

const Template: ComponentStory<typeof SecondOverlay> = (args) => <SecondOverlay {...args} />;

export const Default = Template.bind({});