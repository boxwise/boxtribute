import { ProductGender } from "types/generated/graphql";

export interface IBoxDetailsData {
    labelIdentifier: string;
    product?: null | {
        id: string;
        name: string;
        gender?: ProductGender | null;
    };
    size: {
        id: string;
        label: string;
    };
    place?: null | {
        id: string;
        name?: string | null;
        // TODO: make this non-nullable again and
        // use proper parsing/validation for all code places where this type is used
        // (mostly when data is fetched from the API and the API result types have nullable fields)
        // OR: consider to improve the typings of the GraphQL API (less nullable types if possible).
        base?: null | {
            id: string;
            name: string;
        }
    }
    numberOfItems: number;
}
