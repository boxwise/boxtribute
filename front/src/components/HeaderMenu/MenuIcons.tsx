import { BiSolidStore } from "react-icons/bi";
import { BsBox2HeartFill, BsClipboardHeartFill } from "react-icons/bs";
import { FaTruckPlane } from "react-icons/fa6";
import {
  RiAccountCircleFill,
  RiBarChart2Fill,
  RiKeyFill,
  RiQrCodeLine,
  RiLockStarFill,
} from "react-icons/ri";

export type Icon =
  | "QRCode"
  | "Statistics"
  | "Aid Inventory"
  | "Aid Transfers"
  | "Beneficiaries"
  | "Free Shop"
  | "Coordinator Admin"
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
    case "Account":
      return <RiAccountCircleFill />;
    case "Logout":
      return <RiKeyFill />;
    default:
      return <></>;
  }
}

export default MenuIcons;
