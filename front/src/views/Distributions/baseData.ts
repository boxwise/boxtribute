export const distroEventStateHumanReadableLabels = new Map<string, string>([
  ["Planning", "Planning"],
  // [DistributionEventState.PlanningDone, "Planning Done"],
  ["Packing", "Packing"],
  // [DistributionEventState.PackingDone, "Packing Done"],
  ["OnDistro", "On Distribution"],
  ["ReturnedFromDistribution", "Returned From Distribution"],
  ["ReturnTrackingInProgress", "Return Tracking In Progress"],
  // [DistributionEventState.ReturnsTracked, "Returned Items Tracked"],
  ["Completed", "Completed"],
]);

export const distroEventStateOrder = [
  "Planning",
  // DistributionEventState.PlanningDone,
  "Packing",
  // DistributionEventState.PackingDone,
  "OnDistro",
  "ReturnedFromDistribution",
  "ReturnTrackingInProgress",
  // DistributionEventState.ReturnsTracked,
  "Completed",
];
