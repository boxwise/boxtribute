export type ShipmentFilterId = "sourceBaseOrg" | "targetBaseOrg" | "state";

export type ShipmentColumnFilter = {
  id: ShipmentFilterId;
  value: string | string[];
};
