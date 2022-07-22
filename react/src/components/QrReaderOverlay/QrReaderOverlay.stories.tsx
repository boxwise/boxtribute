import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { within, userEvent } from "@storybook/testing-library";
import { action } from "@storybook/addon-actions";
import QrReaderOverlay, { QrResolvedValue, IQrValueWrapper } from "./QrReaderOverlay";

export default {
  title: "QrReaderOverlay",
  component: QrReaderOverlay,
  parameters: {
  },
} as ComponentMeta<typeof QrReaderOverlay>;

const Template: ComponentStory<typeof QrReaderOverlay> = (args) => (
  <QrReaderOverlay {...args} />
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
}

const qrValueResolver = (
  qrValueWrapper: IQrValueWrapper
): Promise<IQrValueWrapper> => {
  return new Promise<IQrValueWrapper>((resolve, reject) => {
    setTimeout(() => {
      qrValueWrapper.isLoading = false;
      const resolvedQrValueWrapper = {
        ...qrValueWrapper,
        isLoading: false,
        finalValue: qrCodeToResolverResult(qrValueWrapper.key),
      } as IQrValueWrapper;
      resolve(resolvedQrValueWrapper);
    }, 5000);
  });
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  isBulkModeSupported: true,
  onBulkScanningDone: action(`bulk scanning done`),
  qrValueResolver: qrValueResolver,
  onSingleScanDone: action(`received result`),
  onClose: action(`close`),
};
