import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DistributionEventState} from 'types/generated/graphql';
import DistroEventPacking, { DistroEventPackingData } from './DistroEventPacking';
import { action } from '@storybook/addon-actions';
import { BoxData, PackingActionProps } from './Overlays/SecondOverlay';

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

const mockedBoxData: BoxData = {
    labelIdentifier: "23982",
    productName: "Jacket Male",
    size: "M",
    numberOfItems: 42,
}

const mockedPackingActionProps: PackingActionProps = {
    onBoxToDistribution: action("onBoxToDistribution"),
    onMoveItemsToDistribution: action("onMoveItemsToDistribution")
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
    onShowListClick: action('onShowListClick'),
    packingActionProps: mockedPackingActionProps
}

