/* eslint-disable */
import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";

import { generateMockBox } from "mocks/boxes";

import CreateTransferAgreementView, {
  ALL_ORGS_AND_BASES_QUERY,
} from "./CreateTransferAgreementView";

const initialQuery = {
  request: {
    query: ALL_ORGS_AND_BASES_QUERY,
    variables: {},
  },
  result: {
    data: {
      organisations: [
        {
          bases: [
            {
              id: "1",
              name: "Lesvos",
            },
          ],
          id: "1",
          name: "BoxAid",
        },
        {
          bases: [
            {
              id: "2",
              name: "Thessaloniki",
            },
            {
              id: "3",
              name: "Samos",
            },
            {
              id: "4",
              name: "Athens",
            },
          ],
          id: "2",
          name: "BoxCare",
        },
        {
          bases: [
            {
              id: "100000000",
              name: "TestBase",
            },
          ],
          id: "100000000",
          name: "TestOrganisation",
        },
        {
          bases: [
            {
              id: "100000001",
              name: "DummyTestBaseWithBoxes",
            },
          ],
          id: "100000001",
          name: "DummyTestOrgWithBoxes",
        },
      ],
    },
  },
};

// Test case 4.1.1
it("4.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/transfers/agreements/create",
    initialUrl: "/transfers/agreements/create",
    mocks: [initialQuery],
    addTypename: true,
  });
});
