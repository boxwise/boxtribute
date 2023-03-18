import { MutableRefObject, useEffect, useRef } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { styles } from "./QrReaderScannerStyles";
import { ViewFinder } from "./ViewFinder";

export type OnResultFunction = (
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
  zoom,
  facingMode,
  onResult,
  scanPeriod: delayBetweenScanAttempts,
}: QrReaderScannerProps) {
  const videoRef: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);
  const controlsRef: MutableRefObject<IScannerControls | null> = useRef<IScannerControls>(null);
  const browserQRCodeReaderRef: MutableRefObject<BrowserQRCodeReader | null> =
    useRef<BrowserQRCodeReader>(null);

  useEffect(() => {
    if (videoRef.current == null) {
      // eslint-disable-next-line no-console
      console.error("QR Reader: Video Element not (yet) available");
      return;
    }
    const constraints = {
      facingMode,
      zoom,
    };

    // HINT: Next line is a potential flaw/flakyness cause
    controlsRef.current?.stop();

    if (browserQRCodeReaderRef.current == null) {
      browserQRCodeReaderRef.current = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts,
        delayBetweenScanSuccess: delayBetweenScanAttempts,
      });

      if (!isMediaDevicesAPIAvailable()) {
        const message = "QRReader: This browser doesn't support MediaDevices API.\"";
        // eslint-disable-next-line no-console
        console.error(message);
        onResult(null, new Error(message), browserQRCodeReaderRef.current);
      }

      browserQRCodeReaderRef.current
        .decodeFromConstraints(
          {
            video: constraints,
          },
          videoRef.current,
          (result, error) => {
            if (browserQRCodeReaderRef.current != null) {
              onResult(result, error, browserQRCodeReaderRef.current);
            }
          },
        )
        .then((controls: IScannerControls) => {
          controlsRef.current = controls;
          if (!isMountedRef.current) {
            controlsRef.current.stop();
          }
        })
        .catch((error: Error) => {
          if (browserQRCodeReaderRef.current != null) {
            onResult(null, error, browserQRCodeReaderRef.current);
          }
        });
    }
    // eslint-disable-next-line consistent-return
    return () => {
      browserQRCodeReaderRef.current = null;
    };
  }, [delayBetweenScanAttempts, facingMode, onResult, zoom]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      controlsRef.current?.stop();
    },
    [],
  );

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
          ref={videoRef}
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
