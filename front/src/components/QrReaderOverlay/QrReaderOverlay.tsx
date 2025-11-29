import { Button, Dialog, Portal } from "@chakra-ui/react";
import QrReaderContainer from "components/QrReader/QrReaderContainer";

export interface IQrReaderOverlayProps {
  open: boolean;
  onClose: () => void;
}

function QrReaderOverlay({ open, onClose }: IQrReaderOverlayProps) {
  return (
    <Dialog.Root
      open={open}
      closeOnInteractOutside={false}
      closeOnEscape
      onOpenChange={(e) => !e.open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header display="flex" justifyContent="space-between" alignItems="center">
              Boxtribute QR Scanner
              <Dialog.CloseTrigger position="static" />
            </Dialog.Header>
            <Dialog.Body>
              <QrReaderContainer onSuccess={onClose} />
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose}>Close QR Scanner</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default QrReaderOverlay;
