import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import DistroEventDetails, {DistroEventDetailsData} from './../../DistroEventDetailsView/components/DistroEventDetails'
import { ProductGender } from 'types/generated/graphql';



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
  title: 'Mobile Distro Events/Distro Event Details',
  component: DistroEventDetails,
  parameters: {
  },
} as ComponentMeta<typeof DistroEventDetails>;

const Template: ComponentStory<typeof DistroEventDetails> = (args) => <DistroEventDetails {...args} />;

export const Default = Template.bind({});
Default.args = {
    distroEventDetailsData: mockedDistroEventPackingList
}

