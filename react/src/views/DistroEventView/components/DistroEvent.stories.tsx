import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import DistroEvent, { DistroEventData } from './DistroEvent';
import { DistroEventState } from 'views/DistroSpotsView/components/DistroSpots';
import { ProductGender } from 'types/generated/graphql';
// import DistroEvent { DistroEventData } from './DitroEvent';



const mockedDistroEvent: DistroEventData = {
    eventDate: new Date("2022/08/22"),
    status: DistroEventState.COMPLETED,
    id: "2",
    outflows: [
        {
            id: "3",
            labelIdentifier: "348293",
            items: 32,
            size: "M",
            name: "T-shirt",
            gender: ProductGender.Men
        },
        {
            id: "4",
            labelIdentifier: "348323",
            items: 10,
            size: "S",
            name: "T-shirt",
            gender: ProductGender.Men
        },
    ],
    returns: [
        {
            id: "3",
            labelIdentifier: "348293",
            items: 32,
            size: "M",
            name: "T-shirt",
            gender: ProductGender.Men
        },
        {
            id: "4",
            labelIdentifier: "348323",
            items: 10,
            size: "S",
            name: "T-shirt",
            gender: ProductGender.Men
        },
    ],
}

export default {
  title: 'Mobile Distro Events/Distro Event',
  component: DistroEvent,
  parameters: {
  },
} as ComponentMeta<typeof DistroEvent>;

const Template: ComponentStory<typeof DistroEvent> = (args) => <DistroEvent {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEventData: mockedDistroEvent
}

export const NoData = Template.bind({});
NoData.args = {
    distroEventData: undefined,
}
