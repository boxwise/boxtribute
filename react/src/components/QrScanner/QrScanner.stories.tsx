import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { action } from '@storybook/addon-actions';
import QrScanner from './QrScanner';

export default {
  title: 'QR Scanner',
  component: QrScanner,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'mobile'
  },
} as ComponentMeta<typeof QrScanner>;

const Template: ComponentStory<typeof QrScanner> = (args) => <QrScanner {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  isBulkModeSupported: true,
  scannedQrValues: [{key: "1", isLoading: true, interimValue: "Box #1 (loading...)"}, {key: "1", isLoading: true, interimValue: "Box #2 (loading...)"}, {key: "3", isLoading: false, finalValue: "Box 204214"}], 
  onBulkScanningDone: action(`bulk scanning done`),
  // bulkModeActive: false,
  // onToggleBulkMode: action(`bulk mode toggled`),
  onResult: action(`received result`),
  // onOpen: action(`open`),
  onClose: action(`close`),
}
