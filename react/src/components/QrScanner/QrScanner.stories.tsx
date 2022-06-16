import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { action } from '@storybook/addon-actions';
import QrScanner, { QrValueWrapper } from './QrScanner';

export default {
  title: 'QR Scanner',
  component: QrScanner,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'mobile'
  },
} as ComponentMeta<typeof QrScanner>;

const Template: ComponentStory<typeof QrScanner> = (args) => <QrScanner {...args} />;



// const qrValueResolver = (qrValueWrapper: QrValueWrapper) => {

// };

const qrValueResolver = (
  qrValueWrapper: QrValueWrapper
): Promise<QrValueWrapper> => {
  return new Promise<QrValueWrapper>((resolve, reject) => {
    setTimeout(() => {
      qrValueWrapper.isLoading = false;
      qrValueWrapper.finalValue = qrValueWrapper.key;
      const resolvedQrValueWrapper = {
        ...qrValueWrapper,
        isLoading: false,
        finalValue: qrValueWrapper.key,
      } as QrValueWrapper;
      resolve(resolvedQrValueWrapper);
    }, 2000);
  });
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  isBulkModeSupported: true,
  // scannedQrValues: [{key: "1", isLoading: true, interimValue: "Box #1 (loading...)"}, {key: "1", isLoading: true, interimValue: "Box #2 (loading...)"}, {key: "3", isLoading: false, finalValue: "Box 204214"}], 
  onBulkScanningDone: action(`bulk scanning done`),
  qrValueResolver: qrValueResolver,
  // setScannedQrValues: ,
  // bulkModeActive: false,
  // onToggleBulkMode: action(`bulk mode toggled`),
  onResult: action(`received result`),
  // onOpen: action(`open`),
  onClose: action(`close`),
}
