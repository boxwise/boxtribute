import { StoryFn, Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import DistroSpotsContainer from "./DistroSpotsContainer";
import { StorybookApolloProvider } from "tests/test-utils";

export default {
  title: "Mobile Distro Events/Distro Spots/List View/Container",
  component: DistroSpotsContainer,
  parameters: {},
  decorators: [
    (Story) => {
      // worker.use(
      //   graphql.query<DistroSpotsForBaseIdQuery, DistroSpotsForBaseIdQueryVariables>(
      //     "DistroSpotsForBaseId",
      //     (req, res, ctx) => {
      //       const mockedDistroSpotsForBaseIdData = {
      //         base: {
      //           __typename: "Base",
      //           distributionSpots: [
      //             {
      //               __typename: "DistributionSpot",
      //               id: "1",
      //               name: "Horgos (River)",
      //               latitude: 132.142,
      //               longitude: 132.142,
      //               distributionEvents: [
      //                 {
      //                   __typename: "DistributionEvent",
      //                   id: "3",
      //                   name: "Warm Clothes and Tea",
      //                   // startDateTime: "2022-06-01T14:48:25+00:00",
      //                   plannedStartDateTime: "2022-06-01T14:48:25+00:00",
      //                   state: DistributionEventState.Planning,
      //                 },
      //               ],
      //             },
      //           ],
      //         },
      //       } as DistroSpotsForBaseIdQuery;
      //       return res(ctx.data(mockedDistroSpotsForBaseIdData));
      //     },
      //   ),
      // );
      return (
        <StorybookApolloProvider>
          <Story />
        </StorybookApolloProvider>
      );
    },
  ],
} as Meta<typeof DistroSpotsContainer>;

const Template: StoryFn<typeof DistroSpotsContainer> = (args) => <DistroSpotsContainer {...args} />;

export const Default = Template.bind({});
Default.args = {
  onGoToDistroEventView: action("onGoToDistroEventView for id"),
};
