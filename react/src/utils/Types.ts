export interface AuthObjectType {
  accessToken: "";
  idToken: "";
  idTokenPayload: {
    at_hash: "";
    aud: "";
    email: "";
    email_verified: false;
    exp: null;
    iat: null;
    iss: "";
    name: "";
    nickname: "";
    nonce: "";
    picture: "";
    sub: "";
    updated_at: "";
  };
  appState: null;
  refreshToken: null;
  state: "";
  expiresIn: null;
  //   this won't change
  tokenType: "Bearer";
  scope: "";
}

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
