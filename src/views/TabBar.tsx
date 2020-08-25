import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPeopleCarry,
  faCogs,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons"
// import "../App.scss"

export default function TabBar() {
  const history = useHistory()
  const [route, setRoute] = React.useState<string>()

  useEffect(() => {
    if (route) history.push(`/${route}`)
  }, [history, route])

  const handleChange = (event, newValue: string) => {
    setRoute(newValue)
  }

  return (
    <BottomNavigation
      value={route}
      onChange={handleChange}
      className="bottomNavBar"
    >
      <BottomNavigationAction
        label="Scan"
        value="scan"
        icon={<FontAwesomeIcon style={{ fontSize: "1.5em" }} icon={faQrcode} />}
      />
      <BottomNavigationAction
        label="Warehouse"
        value="warehouse"
        icon={
          <FontAwesomeIcon style={{ fontSize: "1.5em" }} icon={faPeopleCarry} />
        }
      />
      <BottomNavigationAction
        label="Settings"
        value="settings"
        icon={<FontAwesomeIcon style={{ fontSize: "1.5em" }} icon={faCogs} />}
      />
    </BottomNavigation>
  )
}
