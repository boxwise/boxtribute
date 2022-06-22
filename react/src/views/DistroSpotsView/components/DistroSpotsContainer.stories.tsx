import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DistroSpots, { DistroEventState, DistroSpot } from './DistroSpots';
import DistroSpotsContainer from './DistroSpotsContainer';
import { StorybookApolloProvider } from 'utils/test-utils';


export default {
  title: 'Mobile Distro Events/Distro Spots/Container',
  component: DistroSpots,
  parameters: {
  },
  decorators: [
    Story => <StorybookApolloProvider><Story /></StorybookApolloProvider>
    // Story => <Story />
  ]
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
