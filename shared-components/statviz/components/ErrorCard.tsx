import { Box } from "@chakra-ui/react";

interface IErrorCardProps {
  error: string;
}

export const predefinedErrors = {
  noData: "Data is undefined but no error returned",
};

export default function ErrorCard({ error }: IErrorCardProps) {
  return (
    <Box>
      <p>An unexpected error happened: {error}</p>
    </Box>
  );
}
