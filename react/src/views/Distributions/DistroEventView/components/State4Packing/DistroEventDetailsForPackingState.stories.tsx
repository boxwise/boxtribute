import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ProductGender } from 'types/generated/graphql';
import DistroEventDetailsForPackingState from './DistroEventDetailsForPackingState';
// import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import { action } from '@storybook/addon-actions';
import { PackingListEntry } from 'views/Distributions/types';


const mockedDistroEventPackingList: PackingListEntry[] =
  [
    {
      id: "3",
      numberOfItems: 32,
      size: {
        id: "123",
        label: "M",
      },
      productName: "T-shirt",
      gender: ProductGender.Men,
    },
    {
      id: "4",
      numberOfItems: 10,
      size: {
        id: "234",
        label: "S",
      },
      productName: "T-shirt",
      gender: ProductGender.Women,
    },
  ];

export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Packing/Component',
  component: DistroEventDetailsForPackingState,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventDetailsForPackingState>;

const Template: ComponentStory<typeof DistroEventDetailsForPackingState> = (args) => <DistroEventDetailsForPackingState {...args} />;

export const Default = Template.bind({});
Default.args = {
  packingListEntries: mockedDistroEventPackingList,
    onCheckboxClick: action('onCheckboxClick'),
}
