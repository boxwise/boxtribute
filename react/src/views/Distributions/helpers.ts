import { DistributionEventState } from "types/generated/graphql";

export const getNextState = (state: DistributionEventState) => {
  switch (state) {
    case DistributionEventState.Planning:
      return DistributionEventState.Packing;
    case DistributionEventState.Packing:
      return DistributionEventState.OnDistro;
    case DistributionEventState.OnDistro:
      return DistributionEventState.ReturnedFromDistribution;
    case DistributionEventState.ReturnedFromDistribution:
      return DistributionEventState.ReturnTrackingInProgress;
    case DistributionEventState.ReturnTrackingInProgress:
      return DistributionEventState.Completed;
    case DistributionEventState.Completed:
      return null;
    default:
      return null;
  }
};
