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

const qrCodeToResolverResult = (qrValue: string): QrResolvedValue => {
  var qrResolverResults: Map<string, QrResolvedValue> = new Map([
    ["https://staging.boxwise.co/mobile.php?barcode=387b0f0f5e62cebcafd48383035a92a", {
      kind: "success",
      value: "9123394",
    }],
    ["https://staging.boxwise.co/mobile.php?barcode=cba56d486db6d39209dbbf9e45353c4",{
      kind: "noBoxtributeQr",
    }],
    ["https://staging.boxwise.co/mobile.php?barcode=149ff66629377f6404b5c8d32936855", {
      kind: "notAssignedToBox"
    }],
    ["https://staging.boxwise.co/mobile.php?barcode=91c1def0b674d4e7cb92b61dbe00846", {
      kind: "success",
      value: "9334817",
    }]
  ]);

  const qrResolverResult = qrResolverResults.get(qrValue) || {
    kind: "noBoxtributeQr",
  };

  return qrResolverResult;

  // var hash = hashStr(qrValue);
  // var index = hash % qrResolverResults.length;
  // return qrResolverResults[index];
}

// const hashStr = (str: string) => {
//   var hash = 0;
//   for (var i = 0; i < str.length; i++) {
//     var charCode = str.charCodeAt(i);
//     hash += charCode;
//   }
//   return hash;
// }

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
