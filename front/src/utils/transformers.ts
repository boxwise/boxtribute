import { IDropdownOption } from "components/Form/SelectField";
import { BoxState } from "types/generated/graphql";

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
