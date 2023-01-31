import { Result } from "@zxing/library";

export function mockImplementationOfQrReader(mockedQrReader: jest.MockedFunctionDeep<any>, hash: string, isBoxtributeQr:boolean = true) {
  mockedQrReader.mockImplementation((props) => (
    <button
      type="button"
      data-testid="ReturnScannedQr"
      onClick={() => props.onResult(new Result((isBoxtributeQr ? "barcode="+hash : "nonBoxtributeQr"), new Uint8Array([0]), 0, [], 11))}
    />
  ));
}
