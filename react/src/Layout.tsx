import { Container } from "@chakra-ui/react";
import Header from "components/HeaderMenu";
import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Container maxWidth="container.xl">
      <Header />
      <Outlet />
    </Container>
  );
};

export default Layout;
