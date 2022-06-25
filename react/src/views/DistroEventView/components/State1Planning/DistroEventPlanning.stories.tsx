import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ProductGender } from 'types/generated/graphql';
import DistroEventDetails, { DistroEventDetailsData } from './DistroEventPlanning';
import { action } from '@storybook/addon-actions';

const mockedDistroEventPackingList: DistroEventDetailsData = {
   distroEventDateAndLoc: {
       eventDate: new Date("2022/09/22"),
       distroSpot: "Horgosz River"
   },
   itemsForPacking: [
       {
        id: "3",
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
        gender: ProductGender.Women
       }
   ]
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
