import React from "react"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPeopleCarry,
  faUserCog,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons"
import "../App.css"

export default function TabBar() {
  const [value, setValue] = React.useState("recents")

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      className="bottomNavBar"
    >
      <BottomNavigationAction
        label="Scan"
        value="scan"
        icon={
          <FontAwesomeIcon
            style={{ fontSize: "1.5em" }}
            icon={faQrcode}
            data-tip="Confirm changes"
          />
        }
      />
      <BottomNavigationAction
        label="Warehouse"
        value="warehouse"
        icon={
          <FontAwesomeIcon
            style={{ fontSize: "1.5em" }}
            icon={faPeopleCarry}
            data-tip="Confirm changes"
          />
        }
      />
      <BottomNavigationAction
        label="Settings"
        value="settings"
        icon={
          <FontAwesomeIcon
            style={{ fontSize: "1.5em" }}
            icon={faUserCog}
            data-tip="Confirm changes"
          />
        }
      />
    </BottomNavigation>
  )
}
