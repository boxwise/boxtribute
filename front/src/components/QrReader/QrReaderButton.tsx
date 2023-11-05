import { IconButton } from "@chakra-ui/react";
import { AiOutlineQrcode } from "react-icons/ai";

export function QrReaderButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      h={20}
      w={20}
      fontSize="50px"
      colorScheme="gray"
      backgroundColor="transparent"
      aria-label="Scan QR Code"
      icon={<AiOutlineQrcode />}
      onClick={onClick}
    />
  );
}
