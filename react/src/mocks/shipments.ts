import { ShipmentState, TransferAgreementType } from "types/generated/graphql";
import { generateMockBox } from "./boxes";
import { product1, product3 } from "./products";


export const shipment1 = {
    details: [
      {
        deletedOn: null,
        box: generateMockBox({
            labelIdentifier: "123",
            numberOfItems: 10,
            product: product1
        })
      },
      {
        deletedOn: null,
        box: generateMockBox({
            labelIdentifier: "124",
            numberOfItems: 12,
            product: product3
        })
      },
    ],
    id: "1",
    state: ShipmentState.Preparing,
    sentBy: null,
    sourceBase: {
      id: "1",
      name: "Lesvos",
      organisation: {
        id: "1",
        name: "BoxAid"
      }
    },
    targetBase: {
      id: 2,
      name: "Thessaloniki",
      organisation: {
        id: "2",
        name: "BoxCare"
      }
    },
    transferAgreement: {
      id: "1",
      type: TransferAgreementType.Bidirectional,
    }
}


export const shipment2 = {
  details: [],
  id: "1",
  state: ShipmentState.Preparing,
  sentBy: null,
  sourceBase: {
    id: "1",
    name: "Lesvos",
    organisation: {
      id: "1",
      name: "BoxAid"
    }
  },
  targetBase: {
    id: "2",
    name: "Thessaloniki",
    organisation: {
      id: "2",
      name: "BoxCare"
    }
  },
  transferAgreement: {
    id: "1",
    type: TransferAgreementType.Bidirectional,
  }
}

export const shipments = [shipment1];
