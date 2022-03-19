import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Home from "views/Home";
import Boxes from "views/boxes/Boxes";
import Locations from "views/locations/Locations";
import BTLocation from "views/locations/BTLocation";
import Layout from "Layout";

const AuthenticationProtected = ({ element, ...props }) =>
  withAuthenticationRequired(element, {
    onRedirecting: () => <p>Loading ...</p>,
  })(props);

export default function App() {
  const { isLoading: auth0Loading } = useAuth0();

  if (auth0Loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path="boxes" element={<AuthenticationProtected element={Boxes} />} />
          <Route path="locations">
            <Route index element={<AuthenticationProtected element={Locations} />} />
            <Route path=":locationId" element={<AuthenticationProtected element={BTLocation} />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
