export const size1 = {
  id: "1",
  label: "S",
  __typename: "Size",
};

export const size2 = {
  id: "52",
  label: "Mixed",
  __typename: "Size",
};

export const sizeRange1 = {
  id: "1",
  label: "S,M,L",
  sizes: [
    size1,
    {
      id: "2",
      label: "M",
      __typename: "Size",
    },
    {
      id: "3",
      label: "L",
      __typename: "Size",
    },
  ],
  __typename: "SizeRange",
};

export const sizeRange2 = {
  id: "2",
  label: "Mixed Sizes",
  sizes: [
    {
      id: "4",
      label: "Mixed",
      __typename: "Size",
    },
  ],
  __typename: "SizeRange",
};
