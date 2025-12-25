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
) => Promise<void>;

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
  // let timeoutId: NodeJS.Timeout;

  // const unpauseAfterDelay = () => {
  //   setPaused(true);
  //   clearTimeout(timeoutId);
  //   timeoutId = setTimeout(() => {
  //     setPaused(false);
  //   }, scanPeriod);
  // };

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    // Only call onResult when QR codes are detected
    if (detectedCodes && detectedCodes.length > 0) {
      await onResult(multiScan, detectedCodes, null);
      // unpauseAfterDelay();
    }
  };

  const handleError = async (error: Error) => {
    await onResult(multiScan, null, error);
    // unpauseAfterDelay();
  };

  // const [paused, setPaused] = useState(false);

  return (
    <section>
      <div style={styles.container}>
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode,
            height: { ideal: 720 },
          }}
          scanDelay={scanPeriod}
          // paused={paused}
          styles={{
            video: styles.video,
          }}
          components={{
            // Disable the default viewfinder since we're using our custom ViewFinder
            finder: false,
          }}
          sound={false}
          formats={["qr_code"]}
          // Allow continuous scanning based on multiScan prop
          allowMultiple={multiScan}
        >
          <ViewFinder />
        </Scanner>
      </div>
    </section>
  );
}
