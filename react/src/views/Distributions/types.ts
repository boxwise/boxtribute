import { ProductGender } from "types/generated/graphql";

export enum DistributionEventState {
    Planning = 'Planning',
    // PlanningDone = 'PlanningDone',
    Packing = 'Packing',
    // PackingDone = 'PackingDone',
    OnDistro = 'OnDistro',
    Returned = 'Returned',
    // ReturnsTracked = 'ReturnsTracked',
    Completed = 'Completed'
  }
export type DistributionEventDetails = {
    id: string;
    distributionSpot: {
      id: string;
      name: string;
    }
    state: DistributionEventState;
    plannedStartDateTime: Date;
}

export interface PackingListEntry {
  id: string;
  productName: string;
  size?: {
    id: string;
    label: string;
  }
  gender?: ProductGender;
  numberOfItems: number;
}
