import React from "react";
import { UserObjectType } from "./Types"

const UserContext = React.createContext<UserObjectType>({
  name: "",
  email: "",
  isAdmin: 0,
  language: "english",
  userGroupId: null,
  validFirstDay: "",
  validLastDay: "",
  bases: [],
});

export default UserContext;
