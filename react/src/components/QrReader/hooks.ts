import { MutableRefObject, useEffect, useRef } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

import { UseQrReaderHook } from './types';

import { isMediaDevicesSupported, isValidType } from './utils';

// TODO: add support for debug logs
export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId,
}) => {
  const controlsRef: MutableRefObject<IScannerControls | null> = useRef<IScannerControls>(null);

  useEffect(() => {
    console.log(`scanner hooks useEffect [delayBetweenScanAttempts, onResult, video, videoId] called`);
    // alert("useQrReader: useEffect");
    // controlsRef?.current?.stop();
    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    if (
      !isMediaDevicesSupported() &&
      isValidType(onResult, 'onResult', 'function')
    ) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';

      // alert("onResult?.(null, new Error(message), codeReader)");
      onResult?.(null, new Error(message), codeReader);
    }

    if (isValidType(video, 'constraints', 'object')) {
      codeReader
        .decodeFromConstraints({ video }, videoId, (result, error) => {
          if (isValidType(onResult, 'onResult', 'function')) {
            // if(!!result) {
              // alert(`onResult?.(result, error, codeReader); - ${result} ${error}`)
            // }
            onResult?.(result, error, codeReader);
          }
        })
        .then((controls: IScannerControls) => (controlsRef.current = controls))
        .catch((error: Error) => {
          if (isValidType(onResult, 'onResult', 'function')) {
            // alert("onResult?.(null, error, codeReader);")
            onResult?.(null, error, codeReader);
          }
        });
    }
    return () => {
      // console.log(`scanner hooks useEffect ([delayBetweenScanAttempts, onResult, video, videoId]) cleanup`);
      controlsRef.current?.stop();
    }
  }, [delayBetweenScanAttempts, onResult, video, videoId]);

  useEffect(() => {
    return () => {
      // alert("useEffect for controlsRef.current?.stop()")
      controlsRef.current?.stop();
    };
  }, []);
};
