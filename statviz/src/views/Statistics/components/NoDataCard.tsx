import { Card, CardHeader, Heading } from "@chakra-ui/react";

export default function NoDataCard(props: { header: string }) {
  return (
    <Card h="200px" w="300px">
      <CardHeader>
        <Heading size="md">{props.header}</Heading>
      </CardHeader>
      <CardHeader>No data for the selected time range</CardHeader>
    </Card>
  );
}
