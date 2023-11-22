import { base1 } from "./bases";
import { generateMockBox } from "./boxes";
import { location1, generateMockLocationWithBase } from "./locations";
import { product1 } from "./products";
import { basicShipment } from "./shipments";
import { size1 } from "./sizeRanges";
import { user1 } from "./users";

export const shipmentDetail1 = {
  __typename: "ShipmentDetail",
  id: "1",
  box: {
    labelIdentifier: "123",
    location: {
      ...location1,
      base: base1,
    },
  },
  sourceQuantity: 10,
  sourceProduct: product1,
  sourceSize: size1,
  sourceLocation: location1,
  createdOn: "2023-01-09T17:24:29+00:00",
  createdBy: user1,
  removedOn: null,
  removedBy: null,
  shipment: {
    ...basicShipment,
    details: [
      {
        __typename: "ShipmentDetail",
        id: "1",
        box: {
          labelIdentifier: "123",
          location: {
            ...location1,
            base: base1,
          },
        },
        sourceQuantity: 10,
        sourceProduct: product1,
        sourceSize: size1,
        sourceLocation: location1,
        createdOn: "2023-01-09T17:24:29+00:00",
        createdBy: user1,
        removedOn: null,
        removedBy: null,
      },
    ],
  },
};

export const generateMockShipmentDetail = ({
  id = "1",
  box = generateMockBox({
    labelIdentifier: "123",
    numberOfItems: 10,
    product: product1,
    location: generateMockLocationWithBase({}),
  }),
  sourceQuantity = 10,
  sourceSize = size1,
  sourceProduct = product1,
  targetProduct = null,
  createdOn = "2023-01-09T17:24:29+00:00",
  createdBy = user1,
  removedOn = null,
  removedBy = null,
}) => ({
  id,
  box,
  sourceSize,
  sourceQuantity,
  sourceProduct,
  targetProduct,
  createdOn,
  createdBy,
  removedOn,
  removedBy,
  __typename: "ShipmentDetail",
});
