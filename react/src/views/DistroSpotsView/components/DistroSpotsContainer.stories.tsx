import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroSpots, { DistributionEventState, DistroSpot } from "./DistroSpots";
import DistroSpotsContainer from "./DistroSpotsContainer";
import { StorybookApolloProvider } from "utils/test-utils";
import {
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import { graphql } from "msw";
import { worker } from "mocks/browser";

export default {
  title: "Mobile Distro Events/Distro Spots/List View/Container",
  component: DistroSpots,
  parameters: {},
  decorators: [
    (Story) => {
      worker.use(
        graphql.query<
          DistroSpotsForBaseIdQuery,
          DistroSpotsForBaseIdQueryVariables
        >("DistroSpotsForBaseId", (req, res, ctx) => {
          const mockedDistroSpotsForBaseIdData = {
            base: {
              __typename: "Base",
              distributions: {
                __typename: "Distributions",
                distributionSpots: [
                  {
                    __typename: "DistributionSpot",
                    id: "1",
                    name: "Horgos (River)",
                    latitude: 132.142,
                    longitude: 132.142,
                    distributionEvents: [
                      {
                        __typename: "DistributionEvent",
                        id: "3",
                        name: "Warm Clothes and Tea",
                        dateTime: "2022-06-01T14:48:25+00:00",
                        state: DistributionEventState.Planning,
                      }
                    ],
                  },
                ],
              },
            },
          } as DistroSpotsForBaseIdQuery;
          return res(
            ctx.data(mockedDistroSpotsForBaseIdData)
          );
        })
      );
      return (
        <StorybookApolloProvider>
          <Story />
        </StorybookApolloProvider>
      );
    },
  ],
} as ComponentMeta<typeof DistroSpotsContainer>;

const Template: ComponentStory<typeof DistroSpotsContainer> = (args) => (
  <DistroSpotsContainer {...args} />
);

export const Default = Template.bind({});
Default.args = {
  onGoToDistroEventView: action("onGoToDistroEventView for id"),
};
