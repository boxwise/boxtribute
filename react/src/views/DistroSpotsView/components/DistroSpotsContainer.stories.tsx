import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DistroSpots, { DistroEventState, DistroSpot } from './DistroSpots';
import DistroSpotsContainer from './DistroSpotsContainer';
import { StorybookApolloProvider } from 'utils/test-utils';
import { graphql } from 'msw'
import { worker } from '../../../mocks/browser'
import { gql } from '@apollo/client';
import { DistroSpotsForBaseIdQuery, DistroSpotsForBaseIdQueryVariables } from 'types/generated/graphql';


const DISTRO_SPOTS_FOR_BASE_ID = gql`
query DistroSpotsForBaseId($baseId: ID!) {
  base(id: $baseId) {
    distributions {
      distributionSpots {
        id
        name
        latitude
        longitude
      }
    }
  }
}`;

export default {
  title: "Mobile Distro Events/Distro Spots/Container",
  component: DistroSpots,
  parameters: {},
  decorators: [
    (Story) => {
        // worker.use(
        //   graphql.query<DistroSpotsForBaseIdQuery, DistroSpotsForBaseIdQueryVariables>(
        //     "DistroSpotsForBaseId", (req, res, ctx) => {
        //     // Mock an infinite loading state.
        //     // return res(ctx.delay('infinite'))
        //     return ctx.data()
        //   })
        // )
      return (
        <StorybookApolloProvider>
          <Story />
        </StorybookApolloProvider>
      );
    },
    // Story => <Story />
  ],
} as ComponentMeta<typeof DistroSpotsContainer>;

const Template: ComponentStory<typeof DistroSpotsContainer> = (args) => <DistroSpotsContainer {...args} />;
// const Template: ComponentStory<typeof DistroSpotsContainer> = (args) => <div>Test</div>;

export const Default = Template.bind({});
Default.args = {
}

export const NoData = Template.bind({});
NoData.args = {
  // distroSpots: [],
}
