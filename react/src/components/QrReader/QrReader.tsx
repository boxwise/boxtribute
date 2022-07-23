import * as React from "react";
import { styles } from "./styles";

import { MutableRefObject, useEffect, useRef } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";

export type QrReaderProps = {
  facingMode?: string;
  zoom?: number;
  onResult?: OnResultFunction;
  ViewFinder?: (props: any) => React.ReactElement<any, any> | null;
  scanPeriod?: number;
};

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
  codeReader?: BrowserQRCodeReader
) => void;

const isMediaDevicesAPIAvailable = () => {
  const isMediaDevicesAPIAvailable =
    typeof navigator !== "undefined" && !!navigator.mediaDevices;

  if (!isMediaDevicesAPIAvailable) {
  }

  return isMediaDevicesAPIAvailable;
};

export const QrReader: React.FC<QrReaderProps> = ({
  zoom,
  facingMode,
  ViewFinder,
  onResult,
}) => {
  const videoRef: MutableRefObject<HTMLVideoElement | null> =
    useRef<HTMLVideoElement>(null);

  const isMountedRef = useRef(true);
  const controlsRef: MutableRefObject<IScannerControls | null> =
    useRef<IScannerControls>(null);
  const browserQRCodeReaderRef: MutableRefObject<BrowserQRCodeReader | null> =
    useRef<BrowserQRCodeReader>(null);

  useEffect(() => {
    if (videoRef.current == null) {
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
      browserQRCodeReaderRef.current = new BrowserQRCodeReader(undefined, {});

      if (!isMediaDevicesAPIAvailable()) {
        const message = `QRReader: This browser doesn't support MediaDevices API."`;
        console.error(message);
        onResult?.(null, new Error(message), browserQRCodeReaderRef.current);
      }

      browserQRCodeReaderRef.current
        .decodeFromConstraints(
          {
            video: constraints,
          },
          videoRef.current,
          (result, error) => {
            browserQRCodeReaderRef.current != null &&
              onResult?.(result, error, browserQRCodeReaderRef.current);
          }
        )
        .then((controls: IScannerControls) => {
          controlsRef.current = controls;
          if (!isMountedRef.current) {
            controlsRef.current.stop();
          }
        })
        .catch((error: Error) => {
          browserQRCodeReaderRef.current != null &&
            onResult?.(null, error, browserQRCodeReaderRef.current);
        });
    }
    return () => {
      browserQRCodeReaderRef.current = null;
    };
  }, [facingMode, onResult, zoom]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <section>
      <div
        style={{
          ...styles.container,
        }}
      >
        {!!ViewFinder && <ViewFinder />}
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
};

QrReader.displayName = "QrReader";
