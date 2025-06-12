import { base1 } from "./bases";
import { generateMockBox } from "./boxes";
import { location1, generateMockLocationWithBase } from "./locations";
import { product1 } from "./products";
import { generateMockShipment } from "./shipments";
import { size1 } from "./sizeRanges";
import { user1 } from "./users";

export const shipmentDetail1 = () => ({
  __typename: "ShipmentDetail",
  id: "2",
  box: {
    __typename: "Box",
    labelIdentifier: "123",
    location: {
      ...location1,
      base: base1,
    },
    shipmentDetail: {
      __typename: "ShipmentDetail",
      id: "2",
      shipment: {
        id: "1",
      },
    },
    lastModifiedOn: "2023-01-09T17:24:29+00:00",
  },
  sourceProduct: product1,
  targetProduct: null,
  sourceSize: size1,
  targetSize: null,
  sourceLocation: location1,
  sourceQuantity: 10,
  targetQuantity: null,
  createdOn: "2023-01-09T17:24:29+00:00",
  createdBy: user1,
  removedOn: null,
  removedBy: null,
  lostOn: null,
  lostBy: null,
  receivedOn: null,
  receivedBy: null,
  shipment: generateMockShipment({}),
});

export const generateMockShipmentDetail = ({
  id = "1",
  box = generateMockBox({
    labelIdentifier: "123",
    numberOfItems: 10,
    product: product1,
    location: generateMockLocationWithBase({}),
  }),
  sourceProduct = product1,
  targetProduct = null,
  sourceSize = size1,
  sourceQuantity = 10,
  createdOn = "2023-01-09T17:24:29+00:00",
  createdBy = user1,
  removedOn = null,
  removedBy = null,
}) => ({
  id,
  box,
  sourceProduct,
  targetProduct,
  sourceSize,
  targetSize: null,
  sourceLocation: location1,
  sourceQuantity,
  targetQuantity: null,
  createdOn,
  createdBy,
  removedOn,
  removedBy,
  lostOn: null,
  lostBy: null,
  receivedOn: null,
  receivedBy: null,
  autoMatchingTargetProduct: null,
  __typename: "ShipmentDetail",
});
