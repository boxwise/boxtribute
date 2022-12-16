import React from "react";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import HeaderMenuContainer from "./HeaderMenu/HeaderMenuContainer";
import { useReactiveVar } from "@apollo/client";
import NotificationMessage, { INotificationMessageProps } from "./NotificationMessage";
import { notificationVar } from "../components/NotificationMessage";

const Layout = () => {
  const notification = useReactiveVar(notificationVar);

  return (
    <Container maxWidth="container.xl">
      <HeaderMenuContainer />
      {notification.message != "" && <NotificationMessage {...notification} />}
      <Outlet />
    </Container>
  );
};

export default Layout;
