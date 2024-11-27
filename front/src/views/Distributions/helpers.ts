import { DistributionEventState } from "../../../../graphql/types";

export const getNextState = (state: DistributionEventState) => {
  switch (state) {
    case "Planning":
      return "Packing";
    case "Packing":
      return "OnDistro";
    case "OnDistro":
      return "ReturnedFromDistribution";
    case "ReturnedFromDistribution":
      return "ReturnTrackingInProgress";
    case "ReturnTrackingInProgress":
      return "Completed";
    case "Completed":
      return null;
    default:
      return null;
  }
};
