export const history1 = {
  __typename: "HistoryEntry",
  changeDate: "2023-01-12T08:39:44+00:00",

  changes: "created record",
  id: "1",
  user: {
    __typename: "User",
    id: "8",
    name: "Dev Coordinator",
  },
};

export const history2 = {
  __typename: "HistoryEntry",
  changeDate: "2023-01-14T08:07:13+00:00",
  changes: "changed box location from WH Men to WH Women",
  id: "2",
  user: {
    __typename: "User",
    id: "8",
    name: "Dev Coordinator",
  },
};

export const histories = [history1, history2];
