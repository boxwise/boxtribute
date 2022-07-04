import { DistributionEventState } from "./types";

export const distroEventStateHumanReadableLabels = new Map<string, string>([
    [DistributionEventState.Planning, "Planning"],
    [DistributionEventState.PlanningDone, "Planning Done"],
    [DistributionEventState.Packing, "Packing"],
    [DistributionEventState.PackingDone, "Packing Done"],
    [DistributionEventState.OnDistro, "On Distribution"],
    [DistributionEventState.Returned, "Distribution Done"],
    [DistributionEventState.ReturnsTracked, "Returned Items Tracked"],
    [DistributionEventState.Completed, "Completed"],
  ]);


  export const distroEventStateOrder = [
    DistributionEventState.Planning,
    DistributionEventState.PlanningDone,
    DistributionEventState.Packing,
    DistributionEventState.PackingDone,
    DistributionEventState.OnDistro,
    DistributionEventState.Returned,
    DistributionEventState.ReturnsTracked,
    DistributionEventState.Completed
  ];
