import { TagType } from "types/generated/graphql";

export const tag1 = {
  color: "#20963f",
  label: "tag1",
  value: "1",
  type: TagType.All,
  description: "tag1",
  __typename: "Tag",
};

export const tag2 = {
  color: "#90d4a2",
  id: "17",
  name: "test tag",
  type: TagType.All,
  description: "tag17",
  __typename: "Tag",
};

export const tags = [
  tag1,
  {
    color: "#20969f",
    label: "tag2",
    value: "2",
    __typename: "Tag",
  },
];

export const tagsArray = [
  {
    color: "#20963f",
    name: "tag1",
    id: "1",
    type: TagType.All,
    description: "tag1",
    __typename: "Tag",
  },
  {
    color: "#20969f",
    name: "tag2",
    id: "2",
    type: TagType.Box,
    description: "tag2",
    __typename: "Tag",
  },
];
