import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { within, userEvent } from "@storybook/testing-library";
import { action } from "@storybook/addon-actions";
import QrScanner, { QrResolvedValue, QrValueWrapper } from "./QrScanner";

export default {
  title: "QR Scanner",
  component: QrScanner,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    // layout: 'mobile'
  },
} as ComponentMeta<typeof QrScanner>;

const Template: ComponentStory<typeof QrScanner> = (args) => (
  <QrScanner {...args} />
);

function qrCodeToResolverResult(qrValue) {
  var qrResolverResults: QrResolvedValue[] = [
    {
      kind: "success",
      value: "9123394",
    },
    {
      kind: "noBoxtributeQr",
    },
    {
      kind: "notAssignedToBox"
    },
    {
      kind: "success",
      value: "9334817",
    },
    {
      kind: "noBoxtributeQr",
    },
    {
      kind: "notAssignedToBox"
    },
    {
      kind: "success",
      value: "9834911",
    },
    {
      kind: "success",
      value: "1443281",
    },
    {
      kind: "noBoxtributeQr",
    },
    {
      kind: "notAssignedToBox"
    },
    {
      kind: "success",
      value: "9834911",
    },
  ];
  var hash = hashStr(qrValue);
  var index = hash % qrResolverResults.length;
  return qrResolverResults[index];
}

const hashStr = (str: string) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}

const qrValueResolver = (
  qrValueWrapper: QrValueWrapper
): Promise<QrValueWrapper> => {
  return new Promise<QrValueWrapper>((resolve, reject) => {
    setTimeout(() => {
      qrValueWrapper.isLoading = false;
      // qrValueWrapper.finalValue = qrValueWrapper.key;
      const resolvedQrValueWrapper = {
        ...qrValueWrapper,
        isLoading: false,
        finalValue: qrCodeToResolverResult(qrValueWrapper.key),
      } as QrValueWrapper;
      // alert(JSON.stringify(resolvedQrValueWrapper))
      resolve(resolvedQrValueWrapper);
    }, 5000);
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
};
