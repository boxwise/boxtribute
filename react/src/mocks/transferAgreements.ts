export const acceptedTransferAgreement = {
  __typename: "TransferAgreement",
  comment: "",
  id: "1",
  requestedBy: {
    __typename: "User",
    id: "1",
    name: "some admin",
  },
  shipments: [],
  targetBases: [
    {
      __typename: "Base",
      id: "2",
      name: "Thessaloniki",
    },
    {
      __typename: "Base",
      id: "3",
      name: "Samos",
    },
    {
      __typename: "Base",
      id: "4",
      name: "Athens",
    },
  ],
  targetOrganisation: {
    __typename: "Organisation",
    id: "2",
    name: "BoxCare",
  },
  state: "Accepted",
  sourceBases: [
    {
      __typename: "Base",
      id: "1",
      name: "Lesvos",
    },
  ],
  sourceOrganisation: {
    __typename: "Organisation",
    id: "1",
    name: "BoxAid",
  },
  type: "SendingTo",
  validFrom: "2023-01-26T00:00:00+00:00",
  validUntil: null,
};
