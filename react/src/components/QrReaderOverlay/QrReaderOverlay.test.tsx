import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "utils/test-utils";
import userEvent from "@testing-library/user-event";
import QrReaderOverlay from "./QrReaderOverlay";

describe("QrReaderOverlay ", () => {
  const mocks = [];

  const waitTillLoadingIsDone = async () => {
    await waitFor(() => {
      const loadingInfo = screen.queryByText("Loading...");
      expect(loadingInfo).toBeNull();
    });
  };

  beforeEach(() => {
    render(
      <QrReaderOverlay
        isBulkModeSupported={false}
        isBulkModeActive={false}
        setIsBulkModeActive={{
          on: jest.fn(),
          off: jest.fn(),
          toggle: jest.fn(),
        }}
        boxesByLabelSearchWrappers={[]}
        onScanningResult={jest.fn()}
        scannedQrValueWrappers={[]}
        onFindBoxByLabel={jest.fn()}
        onBulkScanningDoneButtonClick={jest.fn()}
        handleClose={jest.fn()}
        isOpen={false}
      />,
      {
        routePath: "/bases/:baseId",
        initialUrl: "/bases/1",
        mocks,
      },
    );

    // Change the viewport to 360px - mobile view test
    global.innerWidth = 360;

    // Trigger the window resize event.
    global.dispatchEvent(new Event("resize"));
  });

  it("renders Scan QR Code menu", async () => {
    //   await waitFor(waitTillLoadingIsDone);
    //   const qrbutton = screen.getByRole("button", { name: "Scan QR Code" });
    //   expect(qrbutton).toBeInTheDocument();
  });
});
