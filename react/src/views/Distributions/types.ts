import { DistributionEventState, ProductGender } from "types/generated/graphql";
import { z } from "zod";

// export const DistributionEventStateSchema = z.enum(["Planning", "Packing", "OnDistro", "Returned", "Completed"]);
// export type DistributionEventState = z.infer<typeof DistributionEventStateSchema>;

// Consider to remove this and instead directly use the enum from the generated graphql schema

export const DistributionEventStateSchema = z.nativeEnum(DistributionEventState);

export const DistributionSpotSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3),
});

// TODO: if we don't end up using zod at all: remove this and instead define a
// equivalent type in pure TS
// export interface DistributionEventDetails {
//     id: string;
//     name?: string;
//     startDate: Date;
//     state: DistributionEventState;
//     distributionSpot: {
//         id: string;
//         name?: string;
//     }
// }
export const DistributionEventDetailsSchema = z.object({
  id: z.string().min(1),
  name: z.string().nullish(),
  plannedStartDateTime: z.string().transform(v=> new Date(v)),
  plannedEndDateTime: z.string().transform(v=> new Date(v)),
  state: DistributionEventStateSchema,
  distributionSpot: DistributionSpotSchema,
});

export type DistributionEventDetails = z.infer<
  typeof DistributionEventDetailsSchema
>;

// export type DistributionEventDetails = {
//     id: string;
//     name: string
//     distributionSpot: {
//       id: string;
//       name: string;
//     }
//     state: DistributionEventState;
//     plannedStartDateTime: Date;
// }

// export interface MatchingPackedItemsCollection {
//   __typename: "Box" | "UnboxedItemsCollection"
//   numberOfItems: number;
// }

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  gender?: ProductGender | null;
  category?: ProductCategory;
  // gender?: {
  //   id: string;
  //   label: string
  // }
}

export interface Size {
  id: string;
  label: string;
};

export interface IPackingListEntry {
  id: string;
  numberOfItems: number;
  product: Product;
  size?: Size;
}

export interface IPackingListEntryForPackingState extends IPackingListEntry {
  matchingPackedItemsCollections: (UnboxedItemsCollectionData | BoxData)[]
}

export interface ItemsCollection {
  product?: {
    id: string;
    name: string;
  } | null;
  size?: {
    id: string;
    label: string;
  };
  numberOfItems: number;
}

export interface BoxData extends ItemsCollection {
  __typename: "Box";
  labelIdentifier: string;
}

export interface UnboxedItemsCollectionData extends ItemsCollection  {
  __typename: "UnboxedItemsCollection";
}

export const DistroEventForSpotSchema = z.object({
  id: z.string(),
  startDateTime: z.string().transform(v=> new Date(v)),
  state: DistributionEventStateSchema
})

export type DistroEventForSpot = z.infer<typeof DistroEventForSpotSchema>;

// export const LatitudeSchema = z.discriminatedUnion("latitude", [
//   z.number().min(-90).max(90),
//   z.number()
// ])

export const LatitudeSchema = z.number().min(-90).max(90).nullish();
export const LongitudeSchema = z.number().min(-180).max(180).nullish();

export const GeoDataSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

export type GeoData = z.infer<typeof GeoDataSchema>;

export const DistributionSpotCoreDataSchema = z.object({
  name: z.string().min(2),
  geoData: GeoDataSchema.nullish(),
  comment: z.string().nullish()
});

export type DistributionSpotCoreData = z.infer<typeof DistributionSpotCoreDataSchema>;

export const DistributionSpotEnrichedDataSchema = DistributionSpotCoreDataSchema.extend({
  id: z.string().min(1),
  baseId: z.string().min(1),
  nextDistroEventDate: z.date().nullish(),
  distroEvents: z.array(DistroEventForSpotSchema)
});

export type DistributionSpotEnrichedData = z.infer<typeof DistributionSpotEnrichedDataSchema>;
