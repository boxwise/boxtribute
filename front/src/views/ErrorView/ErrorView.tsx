import { Alert, AlertIcon, Button, Container } from "@chakra-ui/react";
import { useHandleLogout } from "hooks/hooks";

interface ErrorViewProps {
  error: string | undefined;
}

function ErrorView({ error }: ErrorViewProps) {
  const { handleLogout } = useHandleLogout();
  console.error(error);
  return (
    <Container mt={4} maxW="md">
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
      <Button mt={4} onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
}

export default ErrorView;
