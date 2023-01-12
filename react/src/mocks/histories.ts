export const history1 = {
  __typename: "HistoryEntry",
  changeDate: "2023-01-12T08:39:44+00:00",
  changes: "changed box location from WH Men to WH Women",
  id: "30952",
  user: {
    __typename: "User",
    id: "8",
    name: "Dev Coordinator",
  },
};

export const history2 = {
  changeDate: "2023-01-11T10:30:39+00:00",
  changes: "changed the number of items from 31 to 32",
  id: "30944",
  user: {
    id: "8",
    name: "Dev Coordinator",
    __typename: "User",
  },
  __typename: "HistoryEntry",
};

export const histories = [history1, history2];
