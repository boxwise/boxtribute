import { base1, base2 } from "./bases";
import { generateMockBox } from "./boxes";
import { location1 } from "./locations";
import { product1, product3 } from "./products";
import { size1, size2 } from "./sizeRanges";
import { user1 } from "./users";
import { generateMockShipmentDetail } from "./shipmentDetail";

export const basicShipment = {
  __typename: "Shipment",
  id: "1",
  labelIdentifier: "S001-231111-LExTH",
  state: "Preparing",
  sourceBase: {
    __typename: "Base",
    id: "1",
    name: "Lesvos",
    organisation: {
      __typename: "Organisation",
      id: "1",
      name: "BoxAid",
    },
  },
  targetBase: {
    __typename: "Base",
    id: "2",
    name: "Thessaloniki",
    organisation: {
      __typename: "Organisation",
      id: "2",
      name: "BoxCare",
    },
  },
};

export const shipment1 = {
  ...basicShipment,
  details: [
    {
      sourceProduct: product1,
      box: generateMockBox({
        labelIdentifier: "123",
        numberOfItems: 10,
        product: product1,
      }),
    },
    {
      sourceProduct: product3,
      box: generateMockBox({
        labelIdentifier: "124",
        numberOfItems: 12,
        product: product3,
      }),
    },
  ],
  sentBy: null,
  transferAgreement: {
    id: "1",
    type: "Bidirectional",
    comment: "",
  },
};

export const shipment2 = {
  ...basicShipment,
  details: [],
  sentBy: null,
  transferAgreement: {
    id: "1",
    type: "Bidirectional",
    comment: "",
  },
};

export const shipments = [shipment1];

export const generateMockShipment = ({
  state = "Preparing",
  iAmSource = true,
  hasBoxes = true,
}) => ({
  id: "1",
  labelIdentifier: "S001-231111-LExTH",
  state,
  details: hasBoxes
    ? [
        {
          id: "1",
          box: {
            __typename: "Box",
            labelIdentifier: "123",
            state: "MarkedForShipment",
            comment: null,
            location: {
              ...location1,
              base: {
                ...base1,
              },
            },
            shipmentDetail: {
              __typename: "ShipmentDetail",
              id: "2",
              shipment: {
                id: "1",
              },
            },
            lastModifiedOn: new Date().toISOString(),
          },
          sourceProduct: product1,
          targetProduct: null,
          sourceSize: size1,
          sourceLocation: location1,
          targetSize: null,
          sourceQuantity: 10,
          targetQuantity: null,
          autoMatchingTargetProduct: null,
          createdOn: "2023-01-09T17:24:29+00:00",
          createdBy: user1,
          removedOn: "2023-01-10T17:24:29+00:00",
          removedBy: user1,
          lostOn: null,
          lostBy: null,
          receivedOn: null,
          receivedBy: null,
          __typename: "ShipmentDetail",
        },
        {
          id: "2",
          box: {
            __typename: "Box",
            labelIdentifier: "123",
            state: "MarkedForShipment",
            comment: null,
            location: {
              ...location1,
              base: {
                ...base1,
              },
            },
            shipmentDetail: {
              __typename: "ShipmentDetail",
              id: "2",
              shipment: {
                id: "1",
              },
            },
            lastModifiedOn: new Date().toISOString(),
          },
          sourceProduct: product1,
          targetProduct: null,
          sourceSize: size1,
          targetSize: null,
          sourceLocation: location1,
          sourceQuantity: 10,
          targetQuantity: null,
          autoMatchingTargetProduct: null,
          createdOn: "2023-01-11T17:24:29+00:00",
          createdBy: user1,
          receivedOn: state === "Completed" ? "2023-01-14T17:24:29+00:00" : null,
          receivedBy: state === "Completed" ? user1 : null,
          removedOn: null,
          removedBy: null,
          lostOn: null,
          lostBy: null,
          __typename: "ShipmentDetail",
        },
        {
          id: "3",
          box: generateMockBox({
            labelIdentifier: "124",
            numberOfItems: 12,
            product: product3,
            state:
              state === "Receiving"
                ? "Receiving"
                : state === "Sent"
                  ? "InTransit"
                  : "MarkedForShipment",
            shipmentDetail: {
              __typename: "ShipmentDetail",
              id: "3",
              shipment: {
                id: "1",
              },
            },
          }),
          sourceProduct: product3,
          targetProduct: null,
          sourceSize: size2,
          targetSize: null,
          sourceLocation: location1,
          sourceQuantity: 12,
          targetQuantity: null,
          autoMatchingTargetProduct: null,
          createdOn: "2023-02-01T17:24:29+00:00",
          createdBy: user1,
          receivedOn: state === "Completed" ? "2023-01-14T17:24:29+00:00" : null,
          receivedBy: state === "Completed" ? user1 : null,
          lostOn: null,
          lostBy: null,
          removedOn: null,
          removedBy: null,
          __typename: "ShipmentDetail",
        },
      ]
    : [],
  sourceBase: iAmSource ? base1 : base2,
  targetBase: iAmSource ? base2 : base1,
  transferAgreement: {
    id: "1",
    comment: "",
    type: "Bidirectional",
    __typename: "TransferAgreement",
  },
  startedOn: "2023-01-08T17:24:29+00:00",
  startedBy: user1,
  sentOn: null,
  sentBy: null,
  receivingStartedOn: null,
  receivingStartedBy: null,
  completedOn: null,
  completedBy: null,
  canceledOn: null,
  canceledBy: null,
  __typename: "Shipment",
});

export const generateMockShipmentMinimal = ({ state = "Preparing", iAmSource = true }) => {
  const shipment = {
    id: "1",
    state,
    labelIdentifier: iAmSource
      ? `001-123123-${base1.name.substring(0, 2).toUpperCase()}x${base2.name
          .substring(0, 2)
          .toUpperCase()}`
      : `001-123123-${base2.name.substring(0, 2).toUpperCase()}x${base1.name
          .substring(0, 2)
          .toUpperCase()}`,
    sourceBase: iAmSource ? base1 : base2,
    targetBase: iAmSource ? base2 : base1,
  };

  return shipment;
};

export const generateMockShipmentWithCustomDetails = ({
  state = "Preparing",
  iAmSource = true,
  details = [generateMockShipmentDetail({})],
}) => ({
  id: "1",
  labelIdentifier: iAmSource
    ? `001-123123-${base1.name.substring(0, 2).toUpperCase()}x${base2.name
        .substring(0, 2)
        .toUpperCase()}`
    : `001-123123-${base2.name.substring(0, 2).toUpperCase()}x${base1.name
        .substring(0, 2)
        .toUpperCase()}`,
  state,
  details,
  sourceBase: iAmSource ? base1 : base2,
  targetBase: iAmSource ? base2 : base1,
  transferAgreement: {
    id: "1",
    comment: "",
    type: "Bidirectional",
    __typename: "TransferAgreement",
  },
  startedOn: "2023-01-08T17:24:29+00:00",
  startedBy: user1,
  sentOn: null,
  sentBy: null,
  receivingStartedOn: null,
  receivingStartedBy: null,
  completedOn: null,
  completedBy: null,
  canceledOn: null,
  canceledBy: null,
  __typename: "Shipment",
});
