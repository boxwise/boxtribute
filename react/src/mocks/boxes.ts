import { product1, productBasic1 } from "./products";
import { size1, size2 } from "./sizeRanges";
import { location1, generateMockLocationWithBase } from "./locations";
import { tag1, tag2 } from "./tags";
import { BoxState } from "types/generated/graphql";
import { histories } from "./histories";

export const box123 = {
  labelIdentifier: "123",
  product: product1,
  size: size1,
  numberOfItems: 62,
  location: location1,
  tags: [tag1],
  comment: "Test",
  __typename: "Box",
};

export const generateMockBox = ({
  labelIdentifier = "123",
  state = BoxState.InStock,
  numberOfItems = 31,
  location = generateMockLocationWithBase({}),
  comment = "",
  product = productBasic1,
  size = size2,
  tags = [tag2],
}) => {
  return {
    distributionEvent: null,
    labelIdentifier: labelIdentifier,
    location: location,
    numberOfItems: numberOfItems,
    comment: comment,
    product: product,
    size: size,
    state: state,
    tags: tags,
    history: histories,
    __typename: "Box",
  };
};
