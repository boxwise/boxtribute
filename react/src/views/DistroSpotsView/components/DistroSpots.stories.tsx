import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DistroSpots, { DistroEventState, DistroSpot } from './DistroSpots';



const mockedDistroSpots: DistroSpot[] = [
  {
    id: "1",
    name: "Horgosz",
    distroEvents: []
  },
  {
    id: "2",
    name: "Subotica",
    nextDistroEventDate: new Date("2022/08/22"),
    distroEvents: [
      {
        eventDate: new Date("2022/08/22"),
        status: DistroEventState.PLANNING_DONE,
        id: "1"
      },
      {
        eventDate: new Date("2022/02/13"),
        status: DistroEventState.COMPLETED,
        id: "2"
      },
    ]
  },
  {
    id: "3",
    name: "Bihac",
    nextDistroEventDate: new Date("2022/09/15"),
    comment: "This distro spot is currently having issues regarding accessibility for our 2nd vehicle.",
    distroEvents: [
      {
        eventDate: new Date("2022/09/15"),
        status: DistroEventState.PLANNING,
        id: "3"
      }
    ]
  }
];

export default {
  title: 'Mobile Distro Events/Distro Spots',
  component: DistroSpots,
  parameters: {
  },
} as ComponentMeta<typeof DistroSpots>;

const Template: ComponentStory<typeof DistroSpots> = (args) => <DistroSpots {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroSpots: mockedDistroSpots
}

export const NoData = Template.bind({});
NoData.args = {
  distroSpots: [],
}
