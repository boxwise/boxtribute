import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { boxesTableDataMock } from "./boxesTableDataMocks";
import BoxesTable from "../BoxesTable";
import { action } from "@storybook/addon-actions";

export default {
  title: "Boxes/Boxes Table",
  component: BoxesTable,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof BoxesTable>;

const Template: ComponentStory<typeof BoxesTable> = (args) => (
  <BoxesTable {...args} />
);

export const Default = Template.bind({});
Default.args = {
  tableData: boxesTableDataMock,
  onBoxRowClick: action(`boxRowClick for Box`),
};

export const NoData = Template.bind({});
NoData.args = {
  tableData: [],
  onBoxRowClick: action(`boxRowClick for Box`),
};
