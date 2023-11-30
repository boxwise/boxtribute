import { IDropdownOption } from "components/Form/SelectField";
import {
  BoxesLocationsTagsShipmentsForBaseQuery,
  BoxState,
  ShipmentState,
} from "types/generated/graphql";

export function locationToDropdownOptionTransformer(
  locations: {
    __typename?: "ClassicLocation" | undefined;
    defaultBoxState?: BoxState | null | undefined;
    id: string;
    seq?: number | null | undefined;
    name?: string | null | undefined;
  }[],
): IDropdownOption[] {
  return (
    locations
      ?.filter(
        (location) =>
          location?.defaultBoxState !== BoxState.Lost &&
          location?.defaultBoxState !== BoxState.Scrap,
      )
      ?.sort((a, b) => Number(a?.seq) - Number(b?.seq))
      ?.map((location) => ({
        label: `${location.name}${
          location.defaultBoxState !== BoxState.InStock
            ? ` - Boxes are ${location.defaultBoxState}`
            : ""
        }`,
        value: location.id,
      })) ?? []
  );
}

export function shipmentToDropdownOptionTransformer(
  shipments: BoxesLocationsTagsShipmentsForBaseQuery["shipments"],
  baseId: string,
): IDropdownOption[] {
  return (
    shipments
      ?.filter(
        (shipment) =>
          shipment.state === ShipmentState.Preparing && shipment.sourceBase.id === baseId,
      )
      ?.map((shipment) => ({
        __typename: "Shipment", // Add this line to ensure __typename is set to "Shipment"
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        subTitle: shipment.labelIdentifier,
        value: shipment.id,
      })) || []
  );
}
