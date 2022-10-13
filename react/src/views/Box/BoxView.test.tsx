import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "utils/test-utils";
import BTBox, {
    BOX_BY_LABEL_IDENTIFIER_QUERY,
    UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
} from "./BoxView";
import userEvent from "@testing-library/user-event";
import { gql } from "@apollo/client";

describe("Box view", () => {
    const mocks = [
        {
            request: {
                query: BOX_BY_LABEL_IDENTIFIER_QUERY,
                variables: {
                    labelIdentifier: "189123",
                },
            },
            result: {
                data: {
                    box: {
                        distributionEvent: null,
                        labelIdentifier: "189123",
                        location: {
                            __typename: "ClassicLocation",
                            base: {
                                distributionEventsBeforeReturnedFromDistributionState: [],
                                locations: [
                                    {
                                        id: "14",
                                        name: "LOST",
                                    },
                                    {
                                        id: "15",
                                        name: "SCRAP",
                                    },
                                    {
                                        id: "16",
                                        name: "Stockroom",
                                    },
                                    {
                                        id: "17",
                                        name: "WH1",
                                    },
                                    {
                                        id: "18",
                                        name: "WH2",
                                    },
                                ],
                            },
                            id: 14,
                            name: "LOST",
                        },
                        numberOfItems: 31,
                        product: {
                            gender: "Boy",
                            name: "Snow trousers",
                        },
                        size: {
                            id: "52",
                            label: "Mixed",
                        },
                        state: "Lost",
                        tags: [
                            {
                                color: "#90d4a2",
                                id: "17",
                                name: "test",
                            },
                        ],
                    },
                },
            },
        },
        {
            request: {
                query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
                variables: {
                    boxLabelIdentifier: "189123",
                    numberOfItems: 32,
                },
            },
            result: {
                data: {
                    updateBox: {
                        labelIdentifier: "189123",
                    },
                },
            },
        },
        {
            request: {
                query: BOX_BY_LABEL_IDENTIFIER_QUERY,
                variables: {
                    labelIdentifier: "189123",
                },
            },
            result: {
                data: {
                    box: {
                        distributionEvent: null,
                        labelIdentifier: "189123",
                        location: {
                            __typename: "ClassicLocation",
                            base: {
                                distributionEventsBeforeReturnedFromDistributionState: [],
                                locations: [
                                    {
                                        id: "14",
                                        name: "LOST",
                                    },
                                    {
                                        id: "15",
                                        name: "SCRAP",
                                    },
                                    {
                                        id: "16",
                                        name: "Stockroom",
                                    },
                                    {
                                        id: "17",
                                        name: "WH1",
                                    },
                                    {
                                        id: "18",
                                        name: "WH2",
                                    },
                                ],
                            },
                            id: "14",
                            name: "LOST",
                        },
                        numberOfItems: 32,
                        product: {
                            gender: "Boy",
                            name: "Snow trousers",
                        },
                        size: {
                            id: "52",
                            label: "Mixed",
                        },
                        state: "Scrap",
                        tags: [
                            {
                                color: "#90d4a2",
                                id: "17",
                                name: "test",
                            },
                        ],
                    },
                },
            },
        },
        {
            request: {
                query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
                variables: {
                    boxLabelIdentifier: "189123",
                    numberOfItems: 31,
                },
            },
            result: {
                data: {
                    updateBox: {
                        labelIdentifier: "189123",
                    },
                },
            },
        },
        {
            request: {
                query: BOX_BY_LABEL_IDENTIFIER_QUERY,
                variables: {
                    labelIdentifier: "189123",
                },
            },
            result: {
                data: {
                    box: {
                        distributionEvent: null,
                        labelIdentifier: "189123",
                        location: {
                            __typename: "ClassicLocation",
                            base: {
                                distributionEventsBeforeReturnedFromDistributionState: [],
                                locations: [
                                    {
                                        id: "14",
                                        name: "LOST",
                                    },
                                    {
                                        id: "15",
                                        name: "SCRAP",
                                    },
                                    {
                                        id: "16",
                                        name: "Stockroom",
                                    },
                                    {
                                        id: "17",
                                        name: "WH1",
                                    },
                                    {
                                        id: "18",
                                        name: "WH2",
                                    },
                                ],
                            },
                            id: "14",
                            name: "LOST",
                        },
                        numberOfItems: 31,
                        product: {
                            gender: "Boy",
                            name: "Snow trousers",
                        },
                        size: {
                            id: "52",
                            label: "Mixed",
                        },
                        state: "Scrap",
                        tags: [
                            {
                                color: "#90d4a2",
                                id: "17",
                                name: "test",
                            },
                        ],
                    },
                },
            },
        },
        {
            request: {
                query: gql`
                    mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
                        updateBox(
                            updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }
                        ) {
                            labelIdentifier
                        }
                    }
                `,
                variables: {
                    boxLabelIdentifier: "189123",
                    newState: "Lost",
                },
            },
            result: {
                data: {
                    updateBox: {
                        labelIdentifier: "189123",
                    },
                },
            },
        },
        {
            request: {
                query: gql`
                    mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
                        updateBox(
                            updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }
                        ) {
                            labelIdentifier
                        }
                    }
                `,
                variables: {
                    boxLabelIdentifier: "189123",
                    newState: "Scrap",
                },
            },
            result: {
                data: {
                    updateBox: {
                        labelIdentifier: "189123",
                    },
                },
            },
        },
        {
            request: {
                query: gql`
                    mutation UpdateLocationOfBox(
                        $boxLabelIdentifier: String!
                        $newLocationId: Int!
                    ) {
                        updateBox(
                            updateInput: {
                                labelIdentifier: $boxLabelIdentifier
                                locationId: $newLocationId
                            }
                        ) {
                            labelIdentifier
                            size {
                                id
                                label
                            }
                            state
                            numberOfItems
                            product {
                                name
                                gender
                                id
                                sizeRange {
                                    sizes {
                                        id
                                        label
                                    }
                                }
                            }
                            tags {
                                id
                                name
                            }
                            tags {
                                id
                                name
                            }
                            distributionEvent {
                                id
                                name
                                state
                                distributionSpot {
                                    name
                                }
                                plannedStartDateTime
                                plannedEndDateTime
                                state
                            }
                            location {
                                __typename
                                id
                                name
                                base {
                                    locations {
                                        id
                                        name
                                    }
                                    distributionEventsBeforeReturnedFromDistributionState {
                                        id
                                        state
                                        distributionSpot {
                                            name
                                        }
                                        name
                                        plannedStartDateTime
                                        plannedEndDateTime
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: {
                    boxLabelIdentifier: "189123",
                    newLocationId: 17,
                },
            },
            result: {
                data: {
                    updateBox: {
                        distributionEvent: null,
                        labelIdentifier: "189123",
                        location: {
                            __typename: "ClassicLocation",
                            base: {
                                distributionEventsBeforeReturnedFromDistributionState: [],
                                locations: [
                                    {
                                        id: "14",
                                        name: "LOST",
                                    },
                                    {
                                        id: "15",
                                        name: "SCRAP",
                                    },
                                    {
                                        id: "16",
                                        name: "Stockroom",
                                    },
                                    {
                                        id: "17",
                                        name: "WH1",
                                    },
                                    {
                                        id: "18",
                                        name: "WH2",
                                    },
                                ],
                            },
                            id: "17",
                            name: "WH1",
                        },
                        numberOfItems: 31,
                        product: {
                            gender: "Boy",
                            id: "347",
                            name: "Snow trousers",
                            sizeRange: {
                                sizes: [
                                    {
                                        id: "52",
                                        label: "Mixed",
                                    },
                                ],
                            },
                        },
                        size: {
                            id: "52",
                            label: "Mixed",
                        },
                        state: "InStock",
                        tags: [],
                    },
                },
            },
        },
    ];

    const waitTillLoadingIsDone = async () => {
        await waitFor(() => {
            const loadingInfo = screen.queryByText("Loading...");
            expect(loadingInfo).toBeNull();
        });
    };

    beforeEach(() => {
        render(<BTBox />, {
            routePath: "/bases/:baseId/boxes/:labelIdentifier",
            initialUrl: "/bases/2/boxes/189123",
            mocks,
        });
    });
    // Test case 3.1.1.0
    it("3.1.1.0 - renders with an initial 'Loading...'", async () => {
        await waitFor(waitTillLoadingIsDone);
        const loadingInfo = screen.getByTestId("loading-indicator");
        expect(loadingInfo).toBeInTheDocument();
    });
    // Test case 3.1.1.1
    it("3.1.1.1 - renders Heading with valid box identifier", async () => {
        await waitFor(waitTillLoadingIsDone);
        const boxHeader = screen.getByTestId("box-header");
        expect(boxHeader).toHaveTextContent("Box 189123");
    });
    // Test case 3.1.1.2
    it("3.1.1.2 - renders sub heading with valid state", async () => {
        await waitFor(waitTillLoadingIsDone);
        const boxSubheading = screen.getByTestId("box-subheader");
        expect(boxSubheading).toHaveTextContent("State: Lost");
    });
    // Test case 3.1.1.2.1
    it("3.1.1.2.1 - change box state color respectfully", async () => {
        await waitFor(waitTillLoadingIsDone);
        let color;
        const currentState = mocks[0].result.data.box?.state;
        if (currentState === "Lost" || currentState === "Scrap") {
            color = "#EB404A";
        } else {
            color = "#0CA789";
        }
        expect(screen.getByTestId("box-state")).toHaveStyle(`color: ${color}`);
    });
    // Test case 3.1.1.3
    it("3.1.1.3 - click on + and - to increase or decrease number of items", async () => {
        await waitFor(waitTillLoadingIsDone);
        let numberOfItemWhenIncreased = 32;
        // let numberOfItemWhenDecreased = 31;
        fireEvent.click(screen.getByTestId("increase-items"));
        await waitFor(() => userEvent.type(screen.getByTestId("increase-number-items"), "1"));
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
            expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(
                "# " + numberOfItemWhenIncreased,
            );
        });

        // fireEvent.click(screen.getByTestId("decrease-items"));
        // await waitFor(() => userEvent.type(screen.getByTestId("decrease-number-items"), "1"));

        // await waitFor(() => {
        //     expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
        //     expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(
        //         "# " + numberOfItemWhenDecreased,
        //     );
        // });
    });
    // Test case 3.1.1.4
    it("3.1.1.4 - clicking on Lost / Scrap must change box state respectfully", async () => {
        await waitFor(waitTillLoadingIsDone);

        fireEvent.click(screen.getByTestId("box-lost-btn"));
        await waitFor(() => {
            const boxSubheading = screen.getByTestId("box-subheader");
            expect(boxSubheading).toHaveTextContent(`State: Lost`);
            expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);
        });

        fireEvent.click(screen.getByTestId("box-scrap-btn"));
        await waitFor(() => {
            const boxSubheading = screen.getByTestId("box-subheader");
            expect(boxSubheading).toHaveTextContent(`State: Scrap`);
            expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);
        });
    });
    // Test case 3.1.1.5
    it("3.1.1.5 - click on a location should move box to seleted place", async () => {
        await waitFor(waitTillLoadingIsDone);

        // fireEvent.click(screen.getByTestId("location-wh1-btn"));
        // await waitFor(() => {
        //     const boxLocationLabel = screen.getByTestId("box-location-label");
        //     expect(boxLocationLabel).toHaveTextContent(`Move this box from WH1 to:`);
        // });
    });

    // Test case 3.1.1.6
    it("3.1.1.6 - If Distro Event Not Available it should not shown the ui section for that", async () => {
        await waitFor(waitTillLoadingIsDone);
        const distroEventSection = screen.getByTestId("distro-event-section");
        expect(distroEventSection).toBeInTheDocument();
    });
    // Test case 3.1.1.7
    it("3.1.1.7 - render tags correctly if box assigned tags", async () => {
        await waitFor(waitTillLoadingIsDone);
        const boxTags = screen.getByTestId("box-tags");
        expect(boxTags).toBeInTheDocument();
    });
});
