import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import {ProductData} from './../../AddItemToPackingView/components/AddItemToPacking'
import AddItemToPacking from './AddItemToPacking';


const mockedAddItemToPacking: ProductData[] = [
    {
        id: "1",
        name: "Jacket",
        sizes: ["S", "M", "XL"],
    },
    {
        id: "2",
        name: "T-shirt",
        sizes: ["S", "M", "L"],
    },
    {
        id: "2",
        name: "Skirt",
        sizes: ["S", "M"],
    }
]

export default {
  title: 'Mobile Distro Events/Add Items to Packing',
  component: AddItemToPacking,
  parameters: {
  },
} as ComponentMeta<typeof AddItemToPacking>;

const Template: ComponentStory<typeof AddItemToPacking> = (args) => <AddItemToPacking {...args} />;

export const Default = Template.bind({});
Default.args = {
    productsData: mockedAddItemToPacking
}