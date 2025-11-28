import { Card, Heading } from "@chakra-ui/react";

interface INoDataCardProps {
  header: string;
  message?: string;
}

export default function NoDataCard({
  header,
  message = "No data for the selected time range or selected filters",
}: INoDataCardProps) {
  return (
    <Card.Root h="200px" w="300px">
      <Card.Header>
        <Heading size="md">{header}</Heading>
      </Card.Header>
      <Card.Header>{message}</Card.Header>
    </Card.Root>
  );
}
