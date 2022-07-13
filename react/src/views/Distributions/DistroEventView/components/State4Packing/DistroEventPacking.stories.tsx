import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DistributionEventState} from 'types/generated/graphql';
import DistroEventPacking, { DistroEventPackingData } from './DistroEventPacking';
import { action } from '@storybook/addon-actions';
import { BoxData, PackingActionProps } from './Overlays/PackingBoxDetailsOverlay';
import { PackingActionListProps } from './Overlays/PackedListOverlay';

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
       },
       {
        id: "5",
        numberOfItems: 14,
        size: "L",
        productName: "T-shirt",
       },
       {
        id: "6",
        numberOfItems: 5,
        size: "S",
        productName: "T-shirt",
       },
       {
        id: "4",
        numberOfItems: 10,
        size: "S",
        productName: "Jacket",
       }
   ]
   },
}

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
  component: DistroEventPacking,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventPacking>;

const Template: ComponentStory<typeof DistroEventPacking> = (args) => <DistroEventPacking {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEventDetailsData: mockedDistroEventPackingList,
    boxData: mockedBoxData,
    boxesData: mockedBoxesData,
    onShowListClick: action('onShowListClick'),
    packingActionProps: mockedPackingActionProps,
    packingActionListProps: mockedPackingActionListProps,
}
