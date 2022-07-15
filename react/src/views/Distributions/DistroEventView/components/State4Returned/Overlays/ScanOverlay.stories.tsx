import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ScanOverlay from './ScanOverlay';
import { action } from '@storybook/addon-actions';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Returned/ScanOverlay',
  component: ScanOverlay,
  parameters: {
  },
} as ComponentMeta<typeof ScanOverlay>;

const Template: ComponentStory<typeof ScanOverlay> = (args) => <ScanOverlay {...args}/>;

export const Default = Template.bind({});
Default.args = {
    modalProps: {
        isScanOpen: true,
        onScanClose: action("onClose"),
        },
    }