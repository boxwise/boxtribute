import { AuthObjectType } from "./Types";

export const emptyAuthObject: AuthObjectType = {
  accessToken: "",
  idToken: "",
  idTokenPayload: {
    at_hash: "",
    aud: "",
    email: "",
    email_verified: false,
    exp: null,
    iat: null,
    iss: "",
    name: "",
    nickname: "",
    nonce: "",
    picture: "",
    sub: "",
    updated_at: "",
  },
  appState: null,
  refreshToken: null,
  state: "",
  expiresIn: null,
  //   this won't change
  tokenType: "Bearer",
  scope: "",
};
