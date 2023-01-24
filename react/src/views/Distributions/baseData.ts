import { DistributionEventState } from "types/generated/graphql";

export const distroEventStateHumanReadableLabels = new Map<string, string>([
    [DistributionEventState.Planning, "Planning"],
    // [DistributionEventState.PlanningDone, "Planning Done"],
    [DistributionEventState.Packing, "Packing"],
    // [DistributionEventState.PackingDone, "Packing Done"],
    [DistributionEventState.OnDistro, "On Distribution"],
    [DistributionEventState.ReturnedFromDistribution, "Returned From Distribution"],
    [DistributionEventState.ReturnTrackingInProgress, "Return Tracking In Progress"],
    // [DistributionEventState.ReturnsTracked, "Returned Items Tracked"],
    [DistributionEventState.Completed, "Completed"],
  ]);


  export const distroEventStateOrder = [
    DistributionEventState.Planning,
    // DistributionEventState.PlanningDone,
    DistributionEventState.Packing,
    // DistributionEventState.PackingDone,
    DistributionEventState.OnDistro,
    DistributionEventState.ReturnedFromDistribution,
    DistributionEventState.ReturnTrackingInProgress,
    // DistributionEventState.ReturnsTracked,
    DistributionEventState.Completed
  ];
