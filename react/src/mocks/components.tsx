import { Result } from "@zxing/library";

export function mockImplementationOfQrReader(mockedQrReader: jest.MockedFunctionDeep<any>, hash: string) {
  mockedQrReader.mockImplementation((props) => (
    <button
      type="button"
      data-testid="ReturnScannedQr"
      onClick={() => props.onResult(new Result("barcode="+hash, new Uint8Array([0]), 0, [], 11))}
    />
  ));
}
