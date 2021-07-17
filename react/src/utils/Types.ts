export interface UserObjectType {
  user: {
    base_id: [number];
    name: string;
    usergroups_id: number | null;
    __typename: string;
  };
}

export interface NewBoxType {
  box_id: number | null;
  product_id: number | null;
  size_id: number | null;
  items: number | null;
  location_id: number | null;
  comments: string;
  qr_id: number | null;
  box_state_id: number | null;
}

export interface LocationState {
  state: {
    qr: string;
  };
}

export interface OrganisationBaseRouteParams {
  orgId: string;
  baseId: string;
}

export interface Product {
  id: number;
  name: string;
}
