import BoxCreateView from "./BoxCreateView"
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { render } from "utils/test-utils";

describe ("Box Create View", () => {
    describe("without a qr code in the url", () => {
        const mocks = [];
        beforeEach(() => {
            render(<BoxCreateView />, {
                routePath: "/bases/:baseId/boxes/new",
                initialUrl: "bases/1/boxes/new", 
                mocks
            });
        });
        it("the view should render", () => {
            const createNewBoxHeader = screen.getByRole("heading", {
                level: 2
            })
            expect(createNewBoxHeader).toBeInTheDocument()
            // expect(createNewBoxHeader.textContent)
        });

    });
    describe("with a qr code in the url", () => {});
});

