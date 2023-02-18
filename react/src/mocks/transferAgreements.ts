import {
  ShipmentState,
  TransferAgreementState,
  TransferAgreementType,
} from "types/generated/graphql";
import { base1, base2 } from "./bases";
import { organisation1, organisation2 } from "./organisations";

export const generateMockTransferAgreement = ({
  type = TransferAgreementType.Bidirectional,
  state = TransferAgreementState.UnderReview,
  comment = "Good Comment",
  isInitiator = true,
}) => {
  const iAmSource =
    (isInitiator && type !== TransferAgreementType.ReceivingFrom) ||
    (!isInitiator && type === TransferAgreementType.ReceivingFrom);

  return {
    id: "1",
    type,
    state,
    comment,
    validFrom: "01-01-2023T17:24:29+00:00",
    validUntil: "01-01-2024T17:24:29+00:00",
    sourceOrganisation: iAmSource ? organisation1 : organisation2,
    sourceBases: iAmSource ? [base1] : [base2],
    targetOrganisation: iAmSource ? organisation2 : organisation1,
    targetBases: iAmSource ? [base2] : [base1],
    shipments: [
      {
        id: "1",
        state: ShipmentState.Preparing,
        sourceBase: iAmSource ? base1 : base2,
        targetBase: iAmSource ? base2 : base1,
        __typename: "Shipment",
      },
    ],
    requestedOn: "01-02-2023T17:24:29+00:00",
    requestedBy: {
      id: "1",
      name: "Test User",
      __typename: "User",
    },
    acceptedOn: null,
    acceptedBy: null,
    terminatedOn: null,
    terminatedBy: null,
    __typename: "TransferAgreement",
  };
};

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
