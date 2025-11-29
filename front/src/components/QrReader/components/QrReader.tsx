import { useCallback, useState } from "react";
import { Result } from "@zxing/library";
import { Field, Group, IconButton, Input, Tabs } from "@chakra-ui/react";
import { IoSearch } from "react-icons/io5";
import { useHasPermission } from "hooks/hooks";
import { QrReaderScanner } from "./QrReaderScanner";
import QrReaderMultiBoxContainer from "./QrReaderMultiBoxContainer";
import * as Sentry from "@sentry/react";

export interface IQrReaderProps {
  isMultiBox: boolean;
  findBoxByLabelIsLoading: boolean;
  onTabSwitch: (index: number) => void;
  onScan: (result: string, multiScan: boolean) => void;
  onFindBoxByLabel: (label: string) => void;
}

function QrReader({
  isMultiBox,
  findBoxByLabelIsLoading,
  onTabSwitch,
  onScan,
  onFindBoxByLabel,
}: IQrReaderProps) {
  const hasManageInventoryPermission = useHasPermission("manage_inventory");

  // Did the QrReaderScanner catch a QrCode? --> call onScan with text value
  const onResult = useCallback(
    (
      multiScan: boolean,
      qrReaderResult: Result | undefined | null,
      error?: Error | undefined | null,
    ) => {
      if (error) {
        // Log the error if its unexpected but don't interrupt the scanning process
        if (error.name !== "NotFoundException2") {
          //register error with Sentry
          Sentry.captureException(error);
          console.error("QR Reader error:", error.name);
        }

        return;
      }
      if (qrReaderResult) {
        onScan(qrReaderResult.getText(), multiScan);
      }
    },
    [onScan],
  );

  // Input Validation for Find Box By Label Field
  const [boxLabelInputValue, setBoxLabelInputValue] = useState("");
  const [boxLabelInputError, setBoxLabelInputError] = useState("");

  const onBoxLabelInputChange = useCallback(
    (value: string) => {
      if (!value) {
        // remove error for empty form field
        setBoxLabelInputError("");
      } else if (value.length < 6) {
        setBoxLabelInputError("Please enter at least 6 digits.");
      } else if (!/^\d+$/.test(value)) {
        setBoxLabelInputError("Please only enter digits.");
      } else {
        setBoxLabelInputError("");
      }
      setBoxLabelInputValue(value);
    },
    [setBoxLabelInputValue, setBoxLabelInputError],
  );

  return (
    <>
      <QrReaderScanner
        key="qrReaderScanner"
        multiScan={isMultiBox && hasManageInventoryPermission}
        facingMode="environment"
        scanPeriod={1000}
        onResult={onResult}
      />
      <Tabs.Root
        value={isMultiBox && hasManageInventoryPermission ? "multi" : "solo"}
        onValueChange={(e) => onTabSwitch(e.value === "multi" ? 1 : 0)}
      >
        <Tabs.List justifyContent="center">
          <Tabs.Trigger value="solo">SOLO BOX</Tabs.Trigger>
          <Tabs.Trigger value="multi" disabled={!hasManageInventoryPermission}>
            MULTI BOX
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="solo">
          <Field.Root invalid={!!boxLabelInputError}>
            <Field.Label>Find Box</Field.Label>
            <Group attached borderRadius={0} width="full">
              <Input
                type="string"
                onChange={(e) => onBoxLabelInputChange(e.currentTarget.value)}
                disabled={findBoxByLabelIsLoading}
                value={boxLabelInputValue}
                placeholder="12345678"
                borderRadius={0}
              />
              <IconButton
                aria-label="Find box By label"
                disabled={!!boxLabelInputError || findBoxByLabelIsLoading}
                loading={findBoxByLabelIsLoading}
                onClick={() => {
                  if (boxLabelInputValue) {
                    onFindBoxByLabel(boxLabelInputValue);
                    setBoxLabelInputValue("");
                  } else {
                    setBoxLabelInputError("Please enter a label id.");
                  }
                }}
              >
                <IoSearch />
              </IconButton>
            </Group>
            <Field.ErrorText>{boxLabelInputError}</Field.ErrorText>
          </Field.Root>
        </Tabs.Content>
        <Tabs.Content value="multi" px={0}>
          {hasManageInventoryPermission && <QrReaderMultiBoxContainer />}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default QrReader;
