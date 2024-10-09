import React from "react";
import { MemoryRouter } from "react-router-dom";

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <MemoryRouter initialEntries={["/"]}>
      <Story />
    </MemoryRouter>
  ),
];

if (typeof global.process === "undefined") {
  // const { worker } = require('../src/mocks/browser')
  // worker.start()
}
export const tags = ["autodocs"];
