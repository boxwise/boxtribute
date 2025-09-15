import { BoxState, ProductGender } from "queries/types";

export const JWT_ROLE = "https://www.boxtribute.com/roles";
export const JWT_ABP = "https://www.boxtribute.com/actions";
export const JWT_BETA = "https://www.boxtribute.com/beta_user";
export const JWT_AVAILABLE_BASES = "https://www.boxtribute.com/base_ids";

// The IDs must match the ones of the database
export const boxStateIds: { [key in BoxState]?: string } = {
  InStock: "1",
  Lost: "2",
  MarkedForShipment: "3",
  Receiving: "4",
  Donated: "5",
  Scrap: "6",
  InTransit: "7",
  NotDelivered: "8",
};

export const genderIds: { [key in ProductGender]: string } = {
  Women: "1",
  Men: "2",
  UnisexAdult: "3",
  Girl: "4",
  Boy: "5",
  UnisexKid: "6",
  BabyGirl: "7",
  BabyBoy: "8",
  UnisexBaby: "9",
  none: "10",
  TeenGirl: "12",
  TeenBoy: "13",
};
