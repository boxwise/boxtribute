import { Result } from "@zxing/library";

export function mockImplementationOfQrReader(mockedQrReader: jest.MockedFunctionDeep<any>) {
  mockedQrReader.mockImplementation((props) => (
    <button
      type="button"
      data-testid="ReturnScannedQr"
      onClick={() => props.onResult(new Result("barcode=testhash", new Uint8Array([0]), 0, [], 11))}
    />
  ));
}
