import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import DistroEventReturned from './DistroEventReturned';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Returned/DistroEventReturned',
  component: DistroEventReturned,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventReturned>;

const Template: ComponentStory<typeof DistroEventReturned> = () => <DistroEventReturned  />;

export const Default = Template.bind({});