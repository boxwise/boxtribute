import React from "react";
import { Link } from "react-router-dom";
import { PrimaryButton } from "boxwise-components";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, ListItem, UnorderedList } from "@chakra-ui/react";

const MenuItem = ({ to, text }: { to: string; text: string }) => (
  <ListItem
    style={{
      display: "inline",
    }}
  >
    <Link to={to}>
      <PrimaryButton>{text}</PrimaryButton>
    </Link>
  </ListItem>
);

const HeaderMenu = () => {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();
  return (
    <UnorderedList
      style={{
        listStyleType: "none",
      }}
    >
      <ListItem
        style={{
          display: "inline",
        }}
      >
        {isAuthenticated && logout != null && <Button onClick={() => logout()}>Logout</Button>}
        {!isAuthenticated && <Button onClick={() => loginWithRedirect()}>Login</Button>}
      </ListItem>
      <MenuItem to="/" text="Home" />
      <MenuItem to="/locations" text="Locations" />
      <MenuItem to="/boxes" text="Boxes" />
      <MenuItem to="/query-playground" text="Query Playground" />
    </UnorderedList>
  );
};

export default HeaderMenu;
