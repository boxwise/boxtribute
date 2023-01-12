export const history1 = {
  changeDate: "2023-01-11T10:30:39+00:00",
  changes: "changed the number of items from 8 to 9",
  id: "30944",
  user: {
    id: "8",
    name: "Dev Coordinator",
    __typename: "User",
  },
  __typename: "HistoryEntry",
};

export const history2 = {
  __typename: "HistoryEntry",
  changeDate: "2023-01-11T10:30:22+00:00",
  changes: 'changed comments from "None" to "";',
  id: "30943",
  user: {
    __typename: "User",
    id: "8",
    name: "Dev Coordinator",
  },
};

export const histories = [history1, history2];
