import { Heading } from "@chakra-ui/react";
import HeaderMenu from "components/HeaderMenu";
import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <HeaderMenu />
      <Outlet />
    </div>
  );
};

export default Layout;
