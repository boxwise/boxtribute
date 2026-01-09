import { product1, productBasic1 } from "./products";
import { size1, size2 } from "./sizeRanges";
import { location1, generateMockLocationWithBase } from "./locations";
import { tag1, tag2 } from "./tags";
import { history1, history2 } from "./histories";
import { user1 } from "./users";

export const box123 = {
  labelIdentifier: "123",
  state: "InStock",
  product: product1,
  size: size1,
  shipmentDetail: null,
  location: location1,
  numberOfItems: 62,
  tags: [tag1],
  comment: "Test",
  history: null,
  createdOn: "2023-11-09T17:24:29+00:00",
  lastModifiedOn: "2023-11-19T10:24:29+00:00",
  __typename: "Box",
};

export const generateMockBox = ({
  id = "1",
  labelIdentifier = "123",
  state = "InStock",
  numberOfItems = 31,
  location = generateMockLocationWithBase({}),
  comment = "Good Comment",
  product = productBasic1,
  shipmentDetail = null as any,
  size = size2,
  tags = [tag2],
  histories = [history1, history2],
  qrCode = { id: "2", code: "default-qr" },
  deletedOn = null as string | null,
}) => ({
  id,
  labelIdentifier,
  state,
  product,
  size,
  shipmentDetail,
  qrCode,
  location,
  numberOfItems,
  tags,
  comment,
  history: histories,
  createdOn: "2023-11-09T17:24:29+00:00",
  createdBy: user1,
  lastModifiedOn: "2023-11-19T10:24:29+00:00",
  lastModifiedBy: user1,
  distributionEvent: null,
  deletedOn,
  __typename: "Box",
});

export const instockBox1 = {
  __typename: "Box",
  id: "2",
  comment: null,
  history: [],
  labelIdentifier: "1481666",
  location: {
    __typename: "ClassicLocation",
    base: {
      __typename: "Base",
      id: "2",
      name: "Thessaloniki",
    },
    defaultBoxState: "InStock",
    id: "16",
    name: "Stockroom",
  },
  numberOfItems: 23,
  product: {
    __typename: "Product",
    type: "Custom",
    deletedOn: null,
    category: {
      id: "1",
      name: "Bottoms",
      __typename: "ProductCategory",
    },
    gender: "Men",
    id: "267",
    name: "Sweatpants",
  },
  shipmentDetail: null,
  size: {
    __typename: "Size",
    id: "52",
    label: "Mixed",
  },
  state: "InStock",
  tags: [
    {
      __typename: "Tag",
      color: "#d89016",
      description: "",
      id: "11",
      name: "new",
      type: "All",
      deletedOn: null,
    },
  ],
  createdOn: "2021-10-29T15:02:40+00:00",
  createdBy: {
    __typename: "User",
    id: "123",
    name: "Some User",
  },
  lastModifiedBy: {
    __typename: "User",
    id: "1234",
    name: "Another User",
  },
  lastModifiedOn: new Date().toISOString(),
  deletedOn: null,
  qrCode: {
    __typename: "QrCode",
    code: "12345",
  },
};

export const instockBox2 = {
  __typename: "Box",
  id: "3",
  comment: null,
  history: [
    {
      __typename: "HistoryEntry",
      changeDate: "2023-10-29T15:02:58+00:00",
      changes: "changed box state from Scrap to InStock",
      id: "30946",
      user: {
        __typename: "User",
        id: "17",
        name: "Dev Coordinator",
      },
    },
    {
      __typename: "HistoryEntry",
      changeDate: "2023-10-29T15:02:51+00:00",
      changes: "changed box state from InStock to Scrap",
      id: "30945",
      user: {
        __typename: "User",
        id: "17",
        name: "Dev Coordinator",
      },
    },
    {
      __typename: "HistoryEntry",
      changeDate: "2023-10-29T15:02:40+00:00",
      changes: "changed box state from Scrap to InStock",
      id: "30944",
      user: {
        __typename: "User",
        id: "17",
        name: "Dev Coordinator",
      },
    },
    {
      __typename: "HistoryEntry",
      changeDate: "2023-10-29T15:02:40+00:00",
      changes: "changed box location from SCRAP to WH2",
      id: "30943",
      user: {
        __typename: "User",
        id: "17",
        name: "Dev Coordinator",
      },
    },
  ],
  labelIdentifier: "8650860",
  location: {
    __typename: "ClassicLocation",
    base: {
      __typename: "Base",
      id: "2",
      name: "Thessaloniki",
    },
    defaultBoxState: "InStock",
    id: "18",
    name: "WH1",
  },
  numberOfItems: 33,
  product: {
    __typename: "Product",
    deletedOn: null,
    type: "Custom",
    category: {
      id: "1",
      name: "Bottoms",
      __typename: "ProductCategory",
    },
    gender: "UnisexKid",
    id: "350",
    name: "Robes",
  },
  shipmentDetail: null,
  size: {
    __typename: "Size",
    id: "52",
    label: "Mixed",
  },
  state: "InStock",
  tags: [
    {
      __typename: "Tag",
      color: "#f37167",
      description: "Donation from company x",
      id: "10",
      name: "company X",
      type: "Box",
      deletedOn: null,
    },
    {
      __typename: "Tag",
      color: "#d89016",
      description: "",
      id: "11",
      name: "new",
      type: "All",
      deletedOn: null,
    },
    {
      __typename: "Tag",
      color: "#0097ff",
      description: "Hold back for emergencies",
      id: "12",
      name: "emergency",
      type: "Box",
      deletedOn: null,
    },
  ],
  createdOn: "2021-10-29T15:02:40+00:00",
  createdBy: {
    __typename: "User",
    id: "123",
    name: "Some User",
  },
  lastModifiedBy: {
    __typename: "User",
    id: "1234",
    name: "Another User",
  },
  lastModifiedOn: new Date().toISOString(),
  deletedOn: null,
  qrCode: null,
};

export const scrapBox = {
  id: "1",
  __typename: "Box",
  comment: null,
  history: [],
  labelIdentifier: "4495955",
  location: {
    __typename: "ClassicLocation",
    base: {
      __typename: "Base",
      id: "2",
      name: "Thessaloniki",
    },
    defaultBoxState: "Scrap",
    id: "15",
    name: "SCRAP",
  },
  numberOfItems: 99,
  product: {
    __typename: "Product",
    type: "Custom",
    deletedOn: null,
    category: {
      id: "1",
      name: "Bottoms",
      __typename: "ProductCategory",
    },
    gender: "none",
    id: "233",
    name: "Toothbrush",
  },
  shipmentDetail: null,
  size: {
    __typename: "Size",
    id: "68",
    label: "One size",
  },
  state: "Scrap",
  tags: [],
  createdOn: "2021-10-29T15:02:40+00:00",
  createdBy: {
    __typename: "User",
    id: "123",
    name: "Some User",
  },
  lastModifiedBy: {
    __typename: "User",
    id: "1234",
    name: "Another User",
  },
  lastModifiedOn: new Date().toISOString(),
  deletedOn: null,
  qrCode: {
    __typename: "QrCode",
    code: "67890",
  },
};

const unauthorizedForBaseErrorBox = {
  __typename: "UnauthorizedForBaseError",
  baseName: "Base Foo",
  organisationName: "BoxAid",
};

const insufficientPermissionErrorBox = {
  __typename: "InsufficientPermissionError",
  name: "Base Bar",
};

/**
 * Generate box data based on ownership: Organization, Base and Permissions.
 *
 * Check `GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE` query for reference.
 */
export const handleBoxGeneration = ({
  labelIdentifier = "123",
  state = "InStock",
  isBoxAssociated = true,
  isBoxSameBase = true,
  isBoxSameOrg = true,
}) => {
  if (isBoxAssociated && isBoxSameOrg && isBoxSameBase)
    return generateMockBox({ labelIdentifier, state });

  if (isBoxAssociated && !isBoxSameOrg) return unauthorizedForBaseErrorBox;

  if (isBoxAssociated && !isBoxSameBase) return insufficientPermissionErrorBox;

  // Box not associated with the QR code or no permission and authorization will end up here.
  return null;
};
