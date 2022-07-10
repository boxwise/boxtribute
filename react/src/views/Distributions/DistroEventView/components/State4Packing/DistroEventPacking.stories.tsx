import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DistributionEventState, ProductGender } from 'types/generated/graphql';
import DistroEventPacking, { DistroEventPackingData } from './DistroEventPacking';
// import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import { action } from '@storybook/addon-actions';

const mockedDistroEventPackingList: DistroEventPackingData = {
   distroEventData: {
       eventDate: new Date("2022/09/22"),
       distroSpotName: "Horgosz River",
       status: DistributionEventState.Planning,
       itemsForPacking: [{
        id: "3",
        numberOfItems: 32,
        size: "M",
        productName: "T-shirt",
        gender: ProductGender.Men
       },
       {
        id: "4",
        numberOfItems: 10,
        size: "S",
        productName: "Jacket",
        gender: ProductGender.Women
       }
   ]
   },
}

export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/Component',
  component: DistroEventPacking,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventPacking>;

const Template: ComponentStory<typeof DistroEventPacking> = (args) => <DistroEventPacking {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEventDetailsData: mockedDistroEventPackingList,
    onCheckboxClick: action('onCheckboxClick'),
}
