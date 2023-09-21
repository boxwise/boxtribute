import { ApolloError, useQuery, gql } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import BarChartVertical from "../../components/graphs/BarChartVertical";
import _ from "lodash";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../../types/generated/graphql";

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

export default function BoxView() {
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: 1 } });

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const createdBoxes = data.createdBoxes;

  const groupByDay = (dataCube: CreatedBoxesData) => {
    const result = [];
    let acc: CreatedBoxesResult;

    dataCube.facts.forEach((fact, index) => {
      if (index === 0) {
        acc = fact;
        return;
      }
      if (fact?.createdOn === acc.createdOn) {
        acc.boxesCount += fact.boxesCount;
        return;
      }
      result.push(acc);
      acc = fact;
    });

    return {
      ...dataCube,
      facts: result,
    };
  };

  const groupedBoxes = groupByDay(createdBoxes);

  console.log(createdBoxes);
  console.log(groupedBoxes);

  const chartData = groupedBoxes.facts.map((fact) => ({
    x: fact?.createdOn,
    y: fact?.boxesCount,
  }));

  const fields = {
    width: 800,
    height: 600,
    colorBar: "#31cab5",
    background: "#ffffff",
    labelX: "Day",
    labelY: "Number of Boxes",
    data: chartData,
    settings: {
      yEndMargin: 2,
    },
  };

  return (
    <div>
      <Heading>Box View</Heading>
      <BarChartVertical fields={fields} />
    </div>
  );
}
