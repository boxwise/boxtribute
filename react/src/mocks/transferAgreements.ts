import { TransferAgreementState, TransferAgreementType } from "types/generated/graphql";
import { base1, base2 } from "./bases";
import { organisation1, organisation2 } from "./organisations";

export const generateMockTransferAgreement = ({
  type = TransferAgreementType.Bidirectional,
  state = TransferAgreementState.UnderReview,
  comment = "Good Comment",
  isInitiator = true,
}) => ({
  id: "1",
  type,
  state,
  comment,
  validFrom: "01-01-2023",
  validUntil: "01-01-2024",
  sourceOrganisation: isInitiator ? organisation1 : organisation2,
  sourceBases: isInitiator ? [base1] : [base2],
  targetOrganisation: isInitiator ? organisation2 : organisation1,
  targetBases: isInitiator ? [base2] : [base1],
  shipments: [
    {
      sourceBase: isInitiator ? base1 : base2,
      targetBase: isInitiator ? base2 : base1,
    },
  ],
  __typename: "TransferAgreement",
});
