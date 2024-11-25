import { IDropdownOption } from "components/Form/SelectField";
import { Locations, Shipments } from "types/query-types";

export function locationToDropdownOptionTransformer(
  locations: Locations,
): IDropdownOption[] {
  return (
    locations
      ?.filter(
        (location) =>
          location?.defaultBoxState !== "Lost" &&
          location?.defaultBoxState !== "Scrap",
      )
      ?.sort((a, b) => Number(a?.seq) - Number(b?.seq))
      ?.map((location) => ({
        label: `${location.name}${location.defaultBoxState !== "InStock"
          ? ` - Boxes are ${location.defaultBoxState}`
          : ""
          }`,
        value: location.id,
      })) ?? []
  );
}

export function shipmentToDropdownOptionTransformer(
  shipments: Shipments,
  baseId: string,
): IDropdownOption[] {
  return (
    shipments
      ?.filter(
        (shipment) =>
          shipment.state === "Preparing" && shipment.sourceBase.id === baseId,
      )
      ?.map((shipment) => ({
        __typename: "Shipment", // Add this line to ensure __typename is set to "Shipment"
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        subTitle: shipment.labelIdentifier,
        value: shipment.id,
      })) || []
  );
}
