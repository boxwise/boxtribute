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
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof QrScanner>;

const Template: ComponentStory<typeof QrScanner> = (args) => <QrScanner {...args} />;

export const Default = Template.bind({});
Default.args = {
  bulkModeSupported: true,
  scannedQrValues: ["Box 204214", "Box 048810", "Box 983255"], 
  onBulkScanningDone: action(`bulk scanning done`),
  // bulkModeActive: false,
  // onToggleBulkMode: action(`bulk mode toggled`),
  onResult: action(`received result`)
}
