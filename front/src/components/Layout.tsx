import React from "react";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import HeaderMenuContainer from "./HeaderMenu/HeaderMenuContainer";

function Layout() {
  return (
    <Container maxWidth="container.xl">
      <HeaderMenuContainer />
      <Outlet />
    </Container>
  );
}

export default Layout;
