import { DistributionEventState } from "./types";

export const getNextState = (state: DistributionEventState) => {
  switch (state) {
    case DistributionEventState.Planning:
      return DistributionEventState.Packing;
    case DistributionEventState.Packing:
      return DistributionEventState.OnDistro;
    case DistributionEventState.OnDistro:
      return DistributionEventState.Returned;
    case DistributionEventState.Returned:
      return DistributionEventState.Completed;
    case DistributionEventState.Completed:
      return DistributionEventState.Completed;
    default:
      return DistributionEventState.Planning;
  }
};
