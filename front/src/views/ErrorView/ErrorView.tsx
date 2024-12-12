import { useAuth0 } from "@auth0/auth0-react";
import { Alert, AlertIcon, Button, Container } from "@chakra-ui/react";

interface ErrorViewProps {
  error: string | undefined;
}

function ErrorView({ error }: ErrorViewProps) {
  const { logout } = useAuth0();
  console.error(error);
  return (
    <Container mt={4} maxW="md">
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
      <Button mt={4} onClick={() => logout()}>
        Logout
      </Button>
    </Container>
  );
}

export default ErrorView;
