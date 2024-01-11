import { Box } from "@chakra-ui/react";

export default function ErrorCard(props: { error: string }) {
  return (
    <Box>
      <p>An unexpected error happened: {props.error}</p>
    </Box>
  );
}
