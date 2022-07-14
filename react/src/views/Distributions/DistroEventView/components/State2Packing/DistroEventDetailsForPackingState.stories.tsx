import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ProductGender } from 'types/generated/graphql';
import DistroEventDetailsForPackingState from './DistroEventDetailsForPackingState';
// import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import { action } from '@storybook/addon-actions';
import { PackingListEntry } from 'views/Distributions/types';
import { BoxData, PackingActionProps } from './Overlays/PackingBoxDetailsOverlay';
import { PackingActionListProps } from './Overlays/PackedListOverlay';


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



const mockedBoxesData: BoxData[] = [{
  id: "1",
  labelIdentifier: "23982",
  productName: "Jacket Male",
  size: "M",
  numberOfItems: 42,
},
{
  id: "2",
  labelIdentifier: "23942",
  productName: "Jacket Male",
  size: "S",
  numberOfItems: 23,
}]

const mockedBoxData: BoxData ={
  id: "3",
  labelIdentifier: "23942",
  productName: "Jacket Woman",
  size: "M",
  numberOfItems: 23,
}

const mockedPackingActionProps: PackingActionProps = {
  onBoxToDistribution: action("onBoxToDistribution"),
  onMoveItemsToDistribution: action("onMoveItemsToDistribution")
}

const mockedPackingActionListProps: PackingActionListProps = {
  onDeleteBoxFromDistribution: action("onDeleteBoxFromDistribution"),
}

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
  // boxData: mockedBoxData,
  // boxesData: mockedBoxesData,
  // onShowListClick: action('onShowListClick'),
  // packingActionProps: mockedPackingActionProps,
  // packingActionListProps: mockedPackingActionListProps,
  //   onCheckboxClick: action('onCheckboxClick'),
}
