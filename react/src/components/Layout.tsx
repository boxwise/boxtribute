import React from "react";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useReactiveVar } from "@apollo/client";
import HeaderMenuContainer from "./HeaderMenu/HeaderMenuContainer";
import NotificationMessage, { notificationVar } from "./NotificationMessage";

function Layout() {
  const notification = useReactiveVar(notificationVar);

  return (
    <Container maxWidth="container.xl">
      <HeaderMenuContainer />
      {notification.message !== "" && <NotificationMessage {...notification} />}
      <Outlet />
    </Container>
  );
}

export default Layout;
