import { ProductGender } from "types/generated/graphql";
import { z } from "zod";

// export const DistributionEventStateSchema = z.enum(["Planning", "Packing", "OnDistro", "Returned", "Completed"]);
// export type DistributionEventState = z.infer<typeof DistributionEventStateSchema>;

export enum DistributionEventState {
  Planning = "Planning",
  // PlanningDone = 'PlanningDone',
  Packing = "Packing",
  // PackingDone = 'PackingDone',
  OnDistro = "OnDistro",
  Returned = "Returned",
  // ReturnsTracked = 'ReturnsTracked',
  Completed = "Completed",
}

export const DistributionEventStateSchema = z.nativeEnum(DistributionEventState);

export const DistributionSpotSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3),
});

// yup.object({
//   id: yup.string().required(),
//   name: yup.string().required(),
// });

// TODO: if we don't end up using yup/zod at all: remove this and instead define a
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
  name: z.string(),
  plannedStartDateTime: z.string().transform(v=> new Date(v)),
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

export interface IPackingListEntry {
  id: string;
  product: {
    id: string;
    name: string;
  };
  size?: {
    id: string;
    label: string;
  };
  gender?: ProductGender;
  numberOfItems: number;
}

export interface BoxData {
  labelIdentifier: string;
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

export const DistroEventForSpotSchema = z.object({
  id: z.string(),
  startDateTime: z.string().transform(v=> new Date(v)),
  state: DistributionEventStateSchema
})

export type DistroEventForSpot = z.infer<typeof DistroEventForSpotSchema>;

// export interface DistroEventForSpot {
//   startDateTime?: Date;
//   state: DistributionEventState;
//   id: string;
// }


// export interface CreateDistroSpotFormData {
//   id: string;
//   name: string;
//   geoData?: {
//     latitude: string;
//     longitude: string;
//   };
//   comment?: string;
// }


// export const LatitudeSchema = z.discriminatedUnion("latitude", [
//   z.number().min(-90).max(90),
//   z.number()
// ])

export const LatitudeSchema = z.number().min(-90).max(90).nullish();
export const LongitudeSchema = z.number().min(-180).max(180).nullish();

// export const LatitudeSchema = z.number().nullable();
// export const LongitudeSchema = z.number().nullish();

export const GeoDataSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

// export interface GeoData {
//   latitude: number;
//   longitude: number;
// }
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

// export interface DistributionSpotEnrichedData {
//   id: string;
//   baseId: string;
//   name: string;
//   geoData?: GeoData;
//   comment?: string;

// }
