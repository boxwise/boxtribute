import { Container } from "@chakra-ui/react";
import QrReaderContainer from "components/QrReader/QrReaderContainer";

function QrReaderView() {
  return (
    <Container maxW="md">
      <QrReaderContainer onSuccess={() => {}} />
    </Container>
  );
}

export default QrReaderView;
