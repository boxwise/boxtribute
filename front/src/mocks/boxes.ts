import { product1, productBasic1 } from "./products";
import { size1, size2 } from "./sizeRanges";
import { location1, generateMockLocationWithBase } from "./locations";
import { tag1, tag2 } from "./tags";
import { history1, history2 } from "./histories";

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
}) => ({
  labelIdentifier,
  state,
  product,
  size,
  shipmentDetail,
  location,
  numberOfItems,
  tags,
  comment,
  history: histories,
  createdOn: "2023-11-09T17:24:29+00:00",
  lastModifiedOn: "2023-11-19T10:24:29+00:00",
  distributionEvent: null,
  deletedOn: null,
  __typename: "Box",
});

const unauthorizedForBaseErrorBox = {
  __typename: "UnauthorizedForBaseError",
  name: "Base Foo",
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
  isBoxSameOrg = true
}) => {
  if (isBoxAssociated && isBoxSameOrg && isBoxSameBase)
    return generateMockBox({ labelIdentifier, state });

  if (isBoxAssociated && !isBoxSameOrg)
    return unauthorizedForBaseErrorBox;

  if (isBoxAssociated && !isBoxSameBase)
    return insufficientPermissionErrorBox;

  // Box not associated with the QR code or no permission and authorization will end up here.
  return null;
}
