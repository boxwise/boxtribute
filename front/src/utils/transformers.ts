import { IDropdownOption } from "components/Form/SelectField";
import { BoxState, ShipmentState } from "types/generated/graphql";

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
  shipments: {
    __typename?: "Shipment" | undefined;
    id: string;
    state?: ShipmentState | null | undefined;
    labelIdentifier?: string | null | undefined;
    sourceBase: {
      __typename?: "Base" | undefined;
      id: string;
      name: string;
      organisation: {
        __typename?: "Organisation" | undefined;
        id: string;
        name: string;
      };
    };
    targetBase: {
      __typename?: "Base" | undefined;
      id: string;
      name: string;
      organisation: {
        __typename?: "Organisation" | undefined;
        id: string;
        name: string;
      };
    };
  }[],
): IDropdownOption[] {
  return (
    shipments
      ?.filter((shipment) => shipment?.state === ShipmentState.Preparing)
      ?.map((shipment) => ({
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        subTitle: shipment.labelIdentifier,
        value: shipment.id,
      })) ?? []
  );
}
