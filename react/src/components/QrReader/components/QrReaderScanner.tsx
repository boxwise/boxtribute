import { MutableRefObject, useEffect, useRef } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { styles } from "./QrReaderScannerStyles";
import { ViewFinder } from "./ViewFinder";

export type OnResultFunction = (
  /**
   * Should the component keep on scanning?
   */
  multiScan: boolean,
  /**
   * The QR values extracted by Zxing
   */
  result?: Result | undefined | null,
  /**
   * The name of the exceptions thrown while reading the QR
   */
  error?: Error | undefined | null,
  /**
   * The instance of the QR browser reader
   */
  codeReader?: BrowserQRCodeReader,
) => void;

export type QrReaderScannerProps = {
  multiScan: boolean;
  facingMode?: string;
  zoom?: number;
  onResult: OnResultFunction;
  scanPeriod?: number;
};

const isMediaDevicesAPIAvailable = () => {
  // eslint-disable-next-line no-shadow
  const isMediaDevicesAPIAvailable = typeof navigator !== "undefined" && !!navigator.mediaDevices;

  return isMediaDevicesAPIAvailable;
};

export function QrReaderScanner({
  multiScan,
  zoom,
  facingMode,
  onResult,
  scanPeriod: delayBetweenScanAttempts,
}: QrReaderScannerProps) {
  // this ref is needed to pass/preview the video stream coming from BrowserQrCodeReader to the the user
  const previewVideoRef: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
  // this ref is to store the controls for the BrowerQRCodeReader. We only need it to tell it to stop scanning at certain points.
  const controlsRef: MutableRefObject<IScannerControls | null> = useRef<IScannerControls>(null);
  // this ref is to store the BrowerQRCodeReader. We need a reference with useRef to ensure that multiple scanning processes are started by the different renders.
  const browserQRCodeReaderRef: MutableRefObject<BrowserQRCodeReader | null> =
    useRef<BrowserQRCodeReader>(null);

  useEffect(() => {
    const constraints = {
      facingMode,
      zoom,
    };

    if (previewVideoRef.current == null) {
      // eslint-disable-next-line no-console
      console.error("QR Reader: Video Element not (yet) available");
      return;
    }

    // This if clause ensure that it only starts one BrowserQRCodeReader
    // browserQRCodeReaderRef.current can only be null when the component is mounted or
    // when after the stop function of controlsRef is executed
    if (browserQRCodeReaderRef.current == null) {
      browserQRCodeReaderRef.current = new BrowserQRCodeReader(undefined, {
        // These settings force that the scanning attempts are reduced (to 1 attempt per 500ms)
        delayBetweenScanAttempts,
        delayBetweenScanSuccess: delayBetweenScanAttempts,
      });

      // check if video is available
      if (!isMediaDevicesAPIAvailable()) {
        const message = "QRReader: This browser doesn't support MediaDevices API.\"";
        // eslint-disable-next-line no-console
        console.error(message);
        onResult(multiScan, null, new Error(message), browserQRCodeReaderRef.current);
      }

      // decodeFromConstraints starts the scanning process.
      // It runs as long as the stop function of the IScannerControls is called
      // We get access to the IScannerControls in .then.
      browserQRCodeReaderRef.current
        .decodeFromConstraints(
          {
            video: constraints,
          },
          previewVideoRef.current,
          (result, error) => {
            if (browserQRCodeReaderRef.current != null) {
              onResult(multiScan, result, error, browserQRCodeReaderRef.current);
            }
          },
        )
        .then((controls: IScannerControls) => {
          controlsRef.current = controls;
        })
        .catch((error: Error) => {
          if (browserQRCodeReaderRef.current != null) {
            onResult(multiScan, null, error, browserQRCodeReaderRef.current);
          }
        });
    }
  }, [delayBetweenScanAttempts, onResult, facingMode, zoom, previewVideoRef, multiScan]);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    // This is the clean up function stopping the scanning.
    // It is triggered when the component unmounts or when multiScan changes.
    // multiScan identifies if which mode the Boxtribute QrReader is running in.
    return () => {
      browserQRCodeReaderRef.current = null;
      controlsRef.current?.stop();
    };
  }, [multiScan]);

  return (
    <section>
      <div
        style={{
          ...styles.container,
        }}
      >
        <ViewFinder />
        <video
          muted
          ref={previewVideoRef}
          style={{
            ...styles.video,
            transform: facingMode === "user" && "scaleX(-1)",
          }}
        />
      </div>
    </section>
  );
}

QrReaderScanner.displayName = "QrReader";
QrReaderScanner.defaultProps = {
  facingMode: "environment",
  zoom: 1,
  scanPeriod: 500,
};
