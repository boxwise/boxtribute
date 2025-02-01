import { FragmentOf, ResultOf } from "gql.tada";

import { IDropdownOption } from "components/Form/SelectField";
import { ACTION_OPTIONS_FOR_BOXESVIEW_QUERY } from "views/Boxes/BoxesView";
import { LOCATION_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";

export function locationToDropdownOptionTransformer(
  locations: FragmentOf<typeof LOCATION_BASIC_FIELDS_FRAGMENT>[],
): IDropdownOption[] {
  return (
    locations
      ?.filter(
        (location) => location?.defaultBoxState !== "Lost" && location?.defaultBoxState !== "Scrap",
      )
      ?.sort((a, b) => Number(a?.seq) - Number(b?.seq))
      ?.map((location) => ({
        label: `${location.name}${
          location.defaultBoxState !== "InStock" ? ` - Boxes are ${location.defaultBoxState}` : ""
        }`,
        value: location.id,
      })) ?? []
  );
}

export function shipmentToDropdownOptionTransformer(
  shipments: ResultOf<typeof ACTION_OPTIONS_FOR_BOXESVIEW_QUERY>["shipments"],
  baseId: string,
): IDropdownOption[] {
  return (
    shipments
      ?.filter((shipment) => shipment.state === "Preparing" && shipment.sourceBase.id === baseId)
      ?.map((shipment) => ({
        __typename: "Shipment", // Add this line to ensure __typename is set to "Shipment"
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        subTitle: shipment.labelIdentifier,
        value: shipment.id,
      })) || []
  );
}

export function tagToDropdownOptionsTransformer(
  tags: FragmentOf<typeof TAG_BASIC_FIELDS_FRAGMENT>[],
): IDropdownOption[] {
  return (
    tags?.map((tag) => ({
      __typename: "Tag",
      label: tag.name,
      value: tag.id,
    })) || []
  );
}
