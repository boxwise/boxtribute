import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";

interface INoDataCardProps {
  header: string;
  message?: string;
}

export default function NoDataCard({
  header,
  message = "No data available (adjust selected filters).",
}: INoDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{header}</Heading>
      </CardHeader>
      <CardBody>{message}</CardBody>
    </Card>
  );
}
