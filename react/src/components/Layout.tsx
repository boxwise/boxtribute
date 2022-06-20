import React from "react";
import { Container } from "@chakra-ui/react";
import HeaderMenuContainer from "components/HeaderMenu/HeaderMenuContainer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Container maxWidth="container.xl">
      <HeaderMenuContainer />
      <Outlet />
    </Container>
  );
};

export default Layout;
