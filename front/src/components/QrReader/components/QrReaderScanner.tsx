import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { styles } from "./QrReaderScannerStyles";
import { ViewFinder } from "./ViewFinder";

export type OnResultFunction = (
  /**
   * Should the component keep on scanning?
   */
  multiScan: boolean,
  /**
   * The QR values extracted by the scanner
   */
  result?: IDetectedBarcode[] | undefined | null,
  /**
   * The name of the exceptions thrown while reading the QR
   */
  error?: Error | undefined | null,
) => void;

export type QrReaderScannerProps = {
  multiScan: boolean;
  facingMode?: string;
  onResult: OnResultFunction;
  scanPeriod?: number;
};

export function QrReaderScanner({
  multiScan,
  facingMode = "environment",
  onResult,
  scanPeriod = 500,
}: QrReaderScannerProps) {
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    // Only call onResult when QR codes are detected
    if (detectedCodes && detectedCodes.length > 0) {
      onResult(multiScan, detectedCodes, null);
    }
  };

  const handleError = (error: Error) => {
    onResult(multiScan, null, error);
  };

  return (
    <section>
      <div style={styles.container}>
        <ViewFinder />
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode,
            height: { ideal: 720 },
          }}
          scanDelay={scanPeriod}
          styles={{
            container: {
              ...styles.video,
              transform: facingMode === "user" ? "scaleX(-1)" : undefined,
            },
          }}
          components={{
            // Disable the default viewfinder since we're using our custom ViewFinder
            finder: false,
          }}
          sound={false}
          formats={["qr_code"]}
          // Allow continuous scanning based on multiScan prop
          allowMultiple={multiScan}
        />
      </div>
    </section>
  );
}
