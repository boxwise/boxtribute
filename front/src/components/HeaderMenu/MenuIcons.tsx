import { BiSolidStore } from "react-icons/bi";
import { BsBox2HeartFill, BsClipboardHeartFill } from "react-icons/bs";
import { FaTruckPlane } from "react-icons/fa6";
import {
  RiAccountCircleFill,
  RiBarChart2Fill,
  RiKeyFill,
  RiQrCodeLine,
  RiLockStarFill,
  RiBaseStationFill,
} from "react-icons/ri";

export type Icon =
  | "QRCode"
  | "Statistics"
  | "Aid Inventory"
  | "Aid Transfers"
  | "Beneficiaries"
  | "Free Shop"
  | "Coordinator Admin"
  | "Base"
  | "Account"
  | "Logout";

function MenuIcons({ icon }: { icon: Icon }) {
  switch (icon) {
    case "QRCode":
      return <RiQrCodeLine />;
    case "Statistics":
      return <RiBarChart2Fill />;
    case "Aid Inventory":
      return <BsBox2HeartFill />;
    case "Aid Transfers":
      return <FaTruckPlane />;
    case "Beneficiaries":
      return <BsClipboardHeartFill />;
    case "Free Shop":
      return <BiSolidStore />;
    case "Coordinator Admin":
      return <RiLockStarFill />;
    case "Base":
      return <RiBaseStationFill />;
    case "Account":
      return <RiAccountCircleFill />;
    case "Logout":
      return <RiKeyFill style={{ rotate: "90deg" }} />;
    default:
      return <></>;
  }
}

export default MenuIcons;
