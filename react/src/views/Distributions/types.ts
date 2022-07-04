export enum DistributionEventState {
    Planning = 'Planning',
    PlanningDone = 'PlanningDone',
    Packing = 'Packing',
    PackingDone = 'PackingDone',
    OnDistro = 'OnDistro',
    Returned = 'Returned',
    ReturnsTracked = 'ReturnsTracked',
    Completed = 'Completed'
  }
export type DistributionEventDetails = {
    id: string;
    distributionSpot: {
      id: string;
      name: string;
    }
    state: DistributionEventState;
    startDate: Date;
}
