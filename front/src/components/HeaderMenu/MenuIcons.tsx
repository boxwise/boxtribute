import { BiSolidStore } from "react-icons/bi";
import { BsBox2HeartFill, BsClipboardHeartFill } from "react-icons/bs";
import { FaShieldAlt } from "react-icons/fa";
import { FaTruckPlane } from "react-icons/fa6";
import { RiAccountCircleFill, RiBarChart2Fill, RiQrCodeLine } from "react-icons/ri";

export type Icon =
  | "QRCode"
  | "Statistics"
  | "Aid Inventory"
  | "Aid Transfers"
  | "Beneficiares"
  | "Free Shop"
  | "Admin"
  | "Account";

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
    case "Beneficiares":
      return <BsClipboardHeartFill />;
    case "Free Shop":
      return <BiSolidStore />;
    case "Admin":
      return <FaShieldAlt />;
    case "Account":
      return <RiAccountCircleFill />;
    default:
      return <></>;
  }
}

export default MenuIcons;
