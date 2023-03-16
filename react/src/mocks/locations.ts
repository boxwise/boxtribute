import { BoxState } from "types/generated/graphql";

export const location1 = {
  id: "1",
  seq: "1",
  name: "Warehouse",
  defaultBoxState: "InStock",
  __typename: "ClassicLocation",
};

const location2 = {
  id: "2",
  seq: "2",
  name: "Shop",
  defaultBoxState: "Donated",
  __typename: "ClassicLocation",
};

export const generateMockLocationWithBase = ({
  defaultBoxState = BoxState.InStock,
  defaultLocationName = "WH Men",
  defaultLocationId = 7,
}) => ({
  defaultBoxState,
  __typename: "ClassicLocation",
  base: {
    __typename: "Base",
    id: "1",
    name: "Lesvos",
    distributionEventsBeforeReturnedFromDistributionState: [],
    locations: [
      {
        __typename: "ClassicLocation",
        defaultBoxState: "Donated",
        id: "1",
        seq: "1",
        name: "Shop",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "4",
        seq: "4",
        name: "Stockroom",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "5",
        seq: "5",
        name: "WH",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "6",
        seq: "6",
        name: "WH Women",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "7",
        seq: "7",
        name: "WH Men",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "8",
        seq: "8",
        name: "WH Children",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "9",
        seq: "9",
        name: "WH Babies",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "10",
        seq: "10",
        name: "WH Shoes",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "11",
        seq: "11",
        name: "WH New arrivals",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "12",
        seq: "12",
        name: "WH Hygiene",
      },
      {
        __typename: "ClassicLocation",
        defaultBoxState: "InStock",
        id: "13",
        seq: "12",
        name: "WH Seasonal",
      },
    ],
  },
  id: defaultLocationId,
  name: defaultLocationName,
});

export const locations = [location1, location2];
