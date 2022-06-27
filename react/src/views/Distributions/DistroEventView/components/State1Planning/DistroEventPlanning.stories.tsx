import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DistributionEventState, ProductGender } from 'types/generated/graphql';
import DistroEventDetails, { DistroEventDetailsData } from './DistroEventPlanning';
import { action } from '@storybook/addon-actions';

const mockedDistroEventPackingList: DistroEventDetailsData = {
   distroEventData: {
       eventDate: new Date("2022/09/22"),
       distroSpot: "Horgosz River",
       status: DistributionEventState.Planning,
       itemsForPacking: [{
        id: "3",
        items: 32,
        size: "M",
        productName: "T-shirt",
        gender: ProductGender.Men
       },
       {
        id: "4",
        items: 10,
        size: "S",
        productName: "T-shirt",
        gender: ProductGender.Women
       }
   ]
   },
}

export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 1 - Planning/Component',
  component: DistroEventDetails,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventDetails>;

const Template: ComponentStory<typeof DistroEventDetails> = (args) => <DistroEventDetails {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEventDetailsData: mockedDistroEventPackingList,
    onAddItemsClick: action('onAddItemsClick'),
    onCopyPackingListFromPreviousEventsClick: action('onCopyPackingListFromPreviousEventsClick'),
    onEditItemOnPackingListClick: action('onEditItemOnPackingListClick'),
    onRemoveItemFromPackingListClick: action('onRemoveItemFromPackingListClick')
}
