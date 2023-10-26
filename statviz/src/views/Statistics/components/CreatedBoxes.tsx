import { ApolloError, useQuery, gql } from "@apollo/client";
import {
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Flex,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import _ from "lodash";

import {
  CreatedBoxesData,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import BarChart from "../../../components/nivo-graphs/BarChart";
import { useMemo, useState } from "react";
import useCreatedBoxes from "../../../utils/hooks/useCreatedBoxes";
import { useParams } from "react-router-dom";
import { BoxesOrItemsCount } from "../../Dashboard/Dashboard";
import VisHeader from "./VisHeader";
import { getSelectionBackground } from "../../../utils/theme";

const CREATED_BOXES_QUERY = gql`
  query createdBoxes($baseId: Int!) {
    createdBoxes(baseId: $baseId) {
      facts {
        boxesCount
        productId
        categoryId
        createdOn
        gender
        itemsCount
      }
      dimensions {
        product {
          id
          name
        }
        category {
          id
          name
        }
      }
    }
  }
`;

export default function CreatedBoxes(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: parseInt(baseId) } });
  const createdBoxes = useCreatedBoxes(data);
  const [selected, setSelected] = useState<boolean>(false);

  const getChartData = () => {
    if (data === undefined) return [];

    const createdBoxesPerDay = createdBoxes
      .removeMissingCreatedOn()
      .groupByCreatedOn()
      .fillMissingDays();

    return createdBoxesPerDay.data;
  };

  const createdBoxesPerDay = useMemo(getChartData, [createdBoxes]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }
  if (createdBoxesPerDay.length === 0) {
    return (
      <Card h={params.height} w={params.width}>
        <CardHeader>
          <Heading size="md">Created Boxes</Heading>
        </CardHeader>
        <CardHeader>No data for the selected time range</CardHeader>
      </Card>
    );
  }

  const getHeading = () =>
    params.boxesOrItems === "itemsCount" ? "New Items" : "Created Boxes";

  return (
    <Card backgroundColor={getSelectionBackground(selected)}>
      <VisHeader
        heading={getHeading()}
        visId="cb"
        onSelect={() => setSelected(true)}
        onDeselect={() => setSelected(false)}
      ></VisHeader>
      <CardBody>
        <BarChart
          data={createdBoxesPerDay}
          indexBy="createdOn"
          keys={[params.boxesOrItems]}
          width={params.width}
          height={params.height}
        />
      </CardBody>
    </Card>
  );
}
