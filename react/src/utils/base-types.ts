import { ProductGender } from "types/generated/graphql";

export interface IBoxDetailsData {
    labelIdentifier: string;
    product: {
        id: string;
        name: string;
        gender?: ProductGender | null;
    };
    size: {
        id: string;
        label: string;
    };
    numberOfItems: number;
}
