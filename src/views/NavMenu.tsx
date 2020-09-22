import React from "react";
import { Icon, Menu, Dropdown } from "semantic-ui-react";
import Logo from "../Assets/images/BoxtributeMainLogo-03.png";

export default function NavMenu() {
  const options = [
    {
      key: "Nea Kavala",
      text: "Nea Kavala",
      value: "Nea Kavala",
      content: "Nea Kavala",
    },
    {
      key: "Elsfina",
      text: "Elsfina",
      value: "Elsfina",
      content: "Elsfina",
    },
    {
      key: "this month",
      text: "this month",
      value: "this month",
      content: "This Month",
    },
  ];

  return (
    <Menu borderless>
      <Menu.Item position="left">
        <img src={Logo} alt="Logo" />
      </Menu.Item>
      <Menu.Item width={12}>
        <Dropdown
          inline
          header="Switch Base to:"
          options={options}
          defaultValue={options[0].value}
        />
      </Menu.Item>
      <Menu.Item position="right">
        <Icon name="laptop" size="big" />
      </Menu.Item>
    </Menu>
  );
}
