import { Heading } from "@chakra-ui/react";
import Header from "components/HeaderMenu";
import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
