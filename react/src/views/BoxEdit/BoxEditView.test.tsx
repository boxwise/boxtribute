import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";
import { box123 } from "mocks/boxes";
import { products } from "mocks/products";
import { locations } from "mocks/locations";
import { tags } from "mocks/tags";
import BoxEditView, {
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY,
  UPDATE_CONTENT_OF_BOX_MUTATION,
} from "./BoxEditView";

const initialQuery = {
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
};

const succesfulMutation = {
  request: {
    query: UPDATE_CONTENT_OF_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      productId: 1,
      sizeId: 2,
      numberOfItems: 62,
      locationId: 1,
      tagIds: [1],
      comment: "Test",
    },
  },
  result: {
    data: {
      updateBox: {
        labelIdentifier: 123,
      },
    },
  },
};

// Test case 3.2.1
it("3.2.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BoxEditView />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
    initialUrl: "/bases/1/boxes/123/edit",
    mocks: [initialQuery],
    addTypename: true,
  });

  // 3.2.1.1 Title is rendered
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // 3.2.1.2 Product of Box is shown
  expect(screen.getByText(/Long Sleeves.*Women/)).toBeInTheDocument();
  // 3.2.1.2.1 Product Options are shown correctly
  await assertOptionsInSelectField(user, /Product/, [/Winter Jacket.*Men/], title, [
    /Jackets \/ Outerwear/,
    /Tops/,
  ]);

  // 3.2.1.3 Size of Box is shown
  expect(screen.getByText("S")).toBeInTheDocument();
  // 3.2.1.3.1 Size Options are shown correctly
  await assertOptionsInSelectField(user, /Size/, ["M", "L"], title);

  // 3.2.1.4 NumberofItems of Box is shown
  expect(screen.getByDisplayValue(/62/i)).toBeInTheDocument();

  // 3.2.1.5 Location of Box is shown
  expect(screen.getByText("Warehouse")).toBeInTheDocument();
  // 3.2.1.5.1 Location Options are shown correctly
  await assertOptionsInSelectField(user, /Location/, [/Shop.*Donated/], title);

  // 3.2.1.6 Tag of Box is shown
  expect(screen.getByText(/tag1/i)).toBeInTheDocument();
  // 3.2.1.6.1 Tag Options are shown correctly
  await assertOptionsInSelectField(user, /Tags/, [/tag2/i], title);

  // 3.2.1.7 Comments of Box is shown
  expect(screen.getByDisplayValue(/test/i)).toBeInTheDocument();
});

it("3.2.2 - Cancel Button", async () => {
  const user = userEvent.setup();
  render(<BoxEditView />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
    initialUrl: "/bases/1/boxes/123/edit",
    mocks: [initialQuery],
    addTypename: true,
    additionalRoute: "/bases/1/boxes/123",
  });
  const cancelButton = await screen.findByRole("button", { name: /cancel/i });
  await user.click(cancelButton);
  expect(screen.getByRole("heading", { name: "/bases/1/boxes/123" })).toBeInTheDocument();
});

it("3.2.3 - Change Product", async () => {
  const user = userEvent.setup();
  render(<BoxEditView />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
    initialUrl: "/bases/1/boxes/123/edit",
    mocks: [initialQuery, succesfulMutation],
    addTypename: true,
    additionalRoute: "/bases/1/boxes/123",
  });

  const submitButton = await screen.findByRole("button", { name: /update box/i });

  // 3.2.3.2 Select Product with one  --> Size is selected automatically
  await selectOptionInSelectField(user, /Product/, /Winter Jacket.*Men/);
  expect(await screen.findByText("Mixed")).toBeInTheDocument();

  // 3.2.3.1 Select Product multiple sizes  -->  SizeField is empty
  await selectOptionInSelectField(user, /Product/, /Long Sleeves.*Women/);
  expect(await screen.findByText(/select a size/i)).toBeInTheDocument();

  // 3.2.3.1.1 Prohibit submission of empty submit field
  await user.click(submitButton);
  expect(screen.getAllByText(/select a size/i)).toHaveLength(2);
  expect(screen.queryByRole("heading", { name: "/bases/1/boxes/123" })).not.toBeInTheDocument();

  // 3.2.3.2 Succesful submission
  await selectOptionInSelectField(user, /Size/, "M");
  expect(await screen.findByText("M")).toBeInTheDocument();
  await user.click(submitButton);
  expect(await screen.findByRole("heading", { name: "/bases/1/boxes/123" })).toBeInTheDocument();
});
