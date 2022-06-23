import { addDecorator } from "@storybook/react";
import { MemoryRouter } from "react-router";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <MemoryRouter initialEntries={['/']}><Story /></MemoryRouter>
  ),
];

if (typeof global.process === 'undefined') {
  const { worker } = require('../src/mocks/browser')
  console.log("WORKER STARTED");
  worker.start()
}
