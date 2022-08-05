import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProductGender } from "types/generated/graphql";
// import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import { action } from "@storybook/addon-actions";
import {
  BoxData,
  IPackingListEntry,
  IPackingListEntryForPackingState,
} from "views/Distributions/types";
import BoxCreate, { BoxCreateProps, ProductWithSizeRangeData, SizeRangeData } from "./BoxCreate";

const mockedEuTshirtsSizeRange: SizeRangeData = {
  label: "EU T-Shirt Sizes (XS-XXL)",
  sizes: [
    {
      id: "1",
      label: "XS",
    },
    {
      id: "2",
      label: "S",
    },
  ]
}
const mockedEuJacketsSizeRange: SizeRangeData = {
  label: "EU Jacket Sizes (XS-XXL)",
  sizes: [
    {
      id: "1",
      label: "38",
    },
    {
      id: "2",
      label: "42",
    },
  ]
}


const mockedLocations: BoxCreateProps["allLocations"] = [
  {
    id: "1",
    name: "Warehouse 1"
  },
  {
    id: "2",
    name: "Warehouse 2"
  },
  {
    id: "3",
    name: "Sorting Area"
  }
];

const mockedProducts: ProductWithSizeRangeData[] = [
  {
    id: "1",
    name: "Jacket Male",
    category: {
      name: "Jackets"
    },
    sizeRange: mockedEuTshirtsSizeRange
  },
  {
    id: "3",
    name: "Jacket Woman",
    category: {
      name: "Jackets"
    },
    sizeRange: mockedEuJacketsSizeRange
  },
  {
    id: "2",
    name: "T-shirt",
    gender: ProductGender.Women,
    category: {
      name: "T-Shirts"
    },
    sizeRange: mockedEuTshirtsSizeRange
  },
  // size: {
  //   id: "1",
  //   label: "M"
  // },

  // size: {
  //   id: "2",
  //   label: "S"
  // },
  // size: {
  //   id: "1",
  //   label: "M"
  // },

  // size: {
  //   id: "123",
  //   label: "M",
  // },
  // {
  //   id: "1",
  //   name: "T-shirt",
  //   gender: ProductGender.Men,
  //   sizeRange: {
  //     label: "EU Jacket Sizes (XS-XXL)"
  //   }
  // },
  // {
  //   size: {
  //     id: "234",
  //     label: "S",
  //   },
];

// const mockedPackingActionListProps: PackingActionListProps = {
//   onDeleteBoxFromDistribution: action("onDeleteBoxFromDistribution"),
// }

export default {
  title: "Boxes/Create/Component",
  component: BoxCreate,
  parameters: {},
} as ComponentMeta<typeof BoxCreate>;

const Template: ComponentStory<typeof BoxCreate> = (args) => (
  <BoxCreate {...args} />
);

const mockedProps: BoxCreateProps = {
  productAndSizesData: mockedProducts,
  allLocations: mockedLocations,
  onCreateBox: action("onSubmitBoxCreateForm"),
  qrCode: undefined,
};

export const Default = Template.bind({});
Default.args = {
  ...mockedProps,
  // packingListEntries: mockedDistroEventPackingList,
  // boxData: mockedBoxData,
  // boxesData: mockedBoxesData,
  // onShowListClick: action('onShowListClick'),
  // packingActionProps: mockedPackingActionProps,
  // packingActionListProps: mockedPackingActionListProps,
  //   onCheckboxClick: action('onCheckboxClick'),
};
