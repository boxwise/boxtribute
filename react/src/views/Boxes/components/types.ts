export type BoxRow = {
    id: string;
    labelIdentifier: string;
    name?: string;
    gender?: string | null;
    items: number;
    size?: string | null;
    location?: string | null;
    state: string;
  };