import { Result } from "@zxing/library";

/**
 * Mocking the QrReader component in components/QrReader/QrReader by overriding the implemention of the component with a button.
 * To mock the QrReader component you have to
 * - add a mock of the path for imports by adding `jest.mock("components/QrReader/QrReader")` at the top of your test file.
 * - mock the acctual component by adding `const mockedQrReader = jest.mocked(QrReader);` in your testfile
 * - to override the implementation of the component you need to pass the mockedQrReader above into the function below.
 *
 * If you then call this function, e.g. `mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");` in a test a
 * button is added to the DOM instead of the QrReader component. By clicking this button, you can mock firing the onResult Event
 * of the QrReader.
 * @param mockedQrReader - The mocked QrReader component whose implementation needs to be overwritten.
 * @param hash - md5 hash of Boxtribute boxes
 * @param isBoxtributeQr - to test non Boxtribute qr-code
 * @returns An component including a button that fires the onResult event of the QrReader component when it is clicked.
 */
export function mockImplementationOfQrReader(
  mockedQrReader: jest.MockedFunctionDeep<any>,
  hash: string,
  isBoxtributeQr: boolean = true,
  multiScan: boolean = false,
) {
  mockedQrReader.mockImplementation((props) => (
    <button
      type="button"
      data-testid="ReturnScannedQr"
      onClick={() =>
        props.onResult(
          multiScan,
          new Result(
            isBoxtributeQr ? `barcode=${hash}` : "nonBoxtributeQr",
            new Uint8Array([0]),
            0,
            [],
            11,
          ),
        )
      }
    />
  ));
}
