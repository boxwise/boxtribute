import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { checkOptionsInSelectField } from "tests/helpers";
import { box123 } from "mocks/boxes";
import { products } from "mocks/products";
import { locations } from "mocks/locations";
import { tags } from "mocks/tags";
import BoxEditView, {
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY,
} from "./BoxEditView";

const mocks = [
  {
    request: {
      query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY,
      variables: {
        baseId: "1",
        labelIdentifier: "123",
      },
    },
    result: {
      data: {
        box: box123,
        base: {
          products,
          locations,
          tags,
        },
      },
    },
  },
];

// Test case 3.2.1
it("3.2.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BoxEditView />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
    initialUrl: "/bases/1/boxes/123/edit",
    mocks,
    addTypename: true,
  });

  // 3.2.1.1 Title is rendered
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // 3.2.1.2 Product of Box is shown
  expect(screen.getByText(/Long Sleeves.*Women/)).toBeInTheDocument();
  // 3.2.1.2.1 Product Options are shown correctly
  await checkOptionsInSelectField(user, /Product/, [/Winter Jacket.*Men/], title, [
    /Jackets \/ Outerwear/,
    /Tops/,
  ]);

  // 3.2.1.3 Size of Box is shown
  expect(screen.getByText("S")).toBeInTheDocument();
  // 3.2.1.3.1 Size Options are shown correctly
  await checkOptionsInSelectField(user, /Size/, ["M", "L"], title);

  // 3.2.1.4 NumberofItems of Box is shown
  expect(screen.getByDisplayValue(/62/i)).toBeInTheDocument();

  // 3.2.1.5 Location of Box is shown
  expect(screen.getByText("Warehouse")).toBeInTheDocument();
  // 3.2.1.5.1 Location Options are shown correctly
  await checkOptionsInSelectField(user, /Location/, [/Shop.*Donated/], title);

  // 3.2.1.6 Tag of Box is shown
  expect(screen.getByText(/tag1/i)).toBeInTheDocument();
  // 3.2.1.6.1 Tag Options are shown correctly
  await checkOptionsInSelectField(user, /Tags/, [/tag2/i], title);

  // 3.2.1.7 Comments of Box is shown
  expect(screen.getByDisplayValue(/test/i)).toBeInTheDocument();
});

it("3.2.2 - Cancel Button", async () => {
  const user = userEvent.setup();
  render(<BoxEditView />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
    initialUrl: "/bases/1/boxes/123/edit",
    mocks,
    addTypename: true,
    additionalRoute: "/bases/1/boxes/123",
  });
  const cancelButton = await screen.findByRole("button", { name: /cancel/i });
  await user.click(cancelButton);
  expect(screen.getByRole("heading", { name: "/bases/1/boxes/123" })).toBeInTheDocument();
});
