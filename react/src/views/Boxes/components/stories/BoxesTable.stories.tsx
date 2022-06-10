import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { boxesTableDataMock } from './boxesTableDataMocks';
import BoxesTable from '../BoxesTable';
import { action } from '@storybook/addon-actions';


export default {
  title: 'Boxes/Boxes Table',
  component: BoxesTable,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof BoxesTable>;

const Template: ComponentStory<typeof BoxesTable> = (args) => <BoxesTable {...args} />;

// export const LoggedOut = Template.bind({});

// export const LoggedIn = Template.bind({});

// // More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// LoggedIn.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement);
//   const loginButton = await canvas.getByRole('button', { name: /Log in/i });
//   await userEvent.click(loginButton);
// };

export const Default = Template.bind({});
Default.args = {
  tableData: boxesTableDataMock,
  onBoxRowClick: action(`boxRowClick for Box`),
}