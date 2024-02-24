import { Card, CardHeader, Heading } from "@chakra-ui/react";

interface INoDataCardProps {
  header: string;
  message?: string;
}

export default function NoDataCard({ header, message }: INoDataCardProps) {
  return (
    <Card h="200px" w="300px">
      <CardHeader>
        <Heading size="md">{header}</Heading>
      </CardHeader>
      <CardHeader>{message}</CardHeader>
    </Card>
  );
}

NoDataCard.defaultProps = {
  message: "No data for the selected time range or selected filters",
};
