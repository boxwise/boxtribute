import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroSpots, { DistroEventState, DistroSpot } from "./DistroSpots";
import DistroSpotsContainer from "./DistroSpotsContainer";
import { StorybookApolloProvider } from "utils/test-utils";
// import { graphql } from 'msw'
// import { worker } from '../../../mocks/browser'
import { gql } from "@apollo/client";
import {
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import { graphql } from "msw";
import { worker } from "mocks/browser";

// const DISTRO_SPOTS_FOR_BASE_ID = gql`
// query DistroSpotsForBaseId($baseId: ID!) {
//   base(id: $baseId) {
//     distributions {
//       distributionSpots {
//         id
//         name
//         latitude
//         longitude
//       }
//     }
//   }
// }`;

export default {
  title: "Mobile Distro Events/Distro Spots/Container",
  component: DistroSpots,
  parameters: {},
  decorators: [
    (Story) => {
      worker.use(
        //   graphql.query<DistroSpotsForBaseIdQuery, DistroSpotsForBaseIdQueryVariables>(
        //     "DistroSpotsForBaseId", (req, res, ctx) => {
        //     // Mock an infinite loading state.
        //     // return res(ctx.delay('infinite'))
        //     return ctx.data()
        //   })

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
                        id: "1",
                        name: "Warm Clothes and Tea",
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
    // Story => <Story />
  ],
} as ComponentMeta<typeof DistroSpotsContainer>;

const Template: ComponentStory<typeof DistroSpotsContainer> = (args) => (
  <DistroSpotsContainer {...args} />
);
// const Template: ComponentStory<typeof DistroSpotsContainer> = (args) => <div>Test</div>;

export const Default = Template.bind({});
Default.args = {};

// export const NoData = Template.bind({});
// NoData.args = {
//   // distroSpots: [],
// }
