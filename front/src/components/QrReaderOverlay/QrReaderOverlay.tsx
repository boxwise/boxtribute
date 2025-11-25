import {
  Button,
  DialogRoot,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogBackdrop,
} from "@chakra-ui/react";
import QrReaderContainer from "components/QrReader/QrReaderContainer";

export interface IQrReaderOverlayProps {
  open: boolean;
  onClose: () => void;
}

function QrReaderOverlay({ open, onClose }: IQrReaderOverlayProps) {
  return (
    <DialogRoot
      open={open}
      closeOnInteractOutside={false}
      closeOnEscape
      onOpenChange={(e) => !e.open && onClose()}
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader display="flex" justifyContent="space-between" alignItems="center">
          Boxtribute QR Scanner
          <DialogCloseTrigger position="static" />
        </DialogHeader>
        <DialogBody>
          <QrReaderContainer onSuccess={onClose} />
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose}>Close QR Scanner</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default QrReaderOverlay;
