import type { NonNullProductGender } from "../../../graphql/types";

export const PRODUCT_GENDER_COLORS: Record<NonNullProductGender, string> = {
  Men: "#5f91c4",
  Women: "#dc4f51",
  Girl: "#962828",
  Boy: "#82a8c3",
  UnisexKid: "#a0aec0",
  UnisexBaby: "#c5cdd8",
  UnisexAdult: "#697f9b",
  TeenGirl: "#6e1919",
  TeenBoy: "#234d76",
  BabyGirl: "#f58c8c",
  BabyBoy: "#c8d6e4",
  none: "#49596e",
};

export const HUMAN_GENDER_COLORS: Record<string, string> = {
  Male: "#5f91c4",
  Female: "#dc4f51",
  Diverse: "#a0aec0",
  Unknown: "#b0b0b0",
};

export const AGE_GROUP_COLORS: Record<string, string> = {
  "0-7": "#c8d6e4",
  "8-15": "#a0aec0",
  "16-25": "#234d76",
  "26-40": "#5f91c4",
  "41-65": "#f58c8c",
  "66+": "#dc4f51",
  Unknown: "#962828",
};

export const CALENDAR_COLORS: string[] = [
  "#a0aec0",
  "#c8d6e4",
  "#5f91c4",
  "#234d76",
  "#f58c8c",
  "#dc4f51",
];

export const SHIPMENT_PARTNER_COLORS: string[] = [...new Set(Object.values(PRODUCT_GENDER_COLORS))];

export const SHIPMENT_NODE_COLORS: string[] = [
  "#49596e",
  "#a0aec0",
  "#697f9b",
  "#c8d6e4",
  "#82a8c3",
  "#5f91c4",
  "#326395",
  "#234d76",
];
