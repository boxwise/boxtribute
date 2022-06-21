export type BoxRow = {
    id: string;
    labelIdentifier: string;
    productName: string;
    gender?: string | null;
    items: number;
    size?: string | null;
    location?: string | null;
    state: string;
  };