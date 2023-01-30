export const transferAgreement1 = {
  __typename: "TransferAgreement",
  comment: "",
  id: "1",
  requestedBy: {
    __typename: "User",
    id: "1",
    name: "some admin",
  },
  shipments: [
    {
      __typename: "Shipment",
      id: "1",
      state: "Preparing",
    },
  ],
  sourceBases: [
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
  sourceOrganisation: {
    __typename: "Organisation",
    id: "2",
    name: "BoxCare",
  },
  state: "Accepted",
  targetBases: [
    {
      __typename: "Base",
      id: "1",
      name: "Lesvos",
    },
  ],
  targetOrganisation: {
    __typename: "Organisation",
    id: "1",
    name: "BoxAid",
  },
  type: "SendingTo",
  validFrom: "2023-01-26T00:00:00+00:00",
  validUntil: null,
};
