import { MobileSlide } from "./types";
import Slide01Image from "../../assets/images/walkthrough/01-scanner.png"
import Slide02Image from "../../assets/images/walkthrough/02-dashboard.png"
import Slide03Image from "../../assets/images/walkthrough/03-manageboxes.png"
import Slide04Image from "../../assets/images/walkthrough/04-manageshipments.png"
import Slide05Image from "../../assets/images/walkthrough/05-addbeneficiary.png"

const slides: MobileSlide[] = [
  {
    title: "Scan any box, instantly",
    text: (
      <>
        Point your camera at any box label to see its{" "}
        <strong>contents, location, and status</strong> in seconds, or update it on the
        spot. You can close the scanner and navigate freely, and access it again anytime
        from the navigation.
      </>
    ),
    imageSrc: Slide01Image,
  },
  {
    title: "Know your stock at a glance",
    text: (
      <>
        Get a live snapshot of how many boxes, items, and locations your base is running through the <strong>Dashboard</strong> feature and review your <strong>Sales Reports</strong> under <strong>Statistics</strong>.
      </>
    ),
    imageSrc: Slide02Image,
  },
  {
    title: "Manage and track your boxes",
    text: (
      <>
      Create, update, and organize boxes by category, location, and status. <strong>Print QR labels</strong> to physically tag them in the warehouse, <strong>Manage Boxes</strong>, and <strong>Plan Stocks</strong> - find all these features under <strong>Aid Inventory</strong>.
      </>
    ),
    imageSrc: Slide03Image,
  },
  {
    title: "Move stock between bases",
    text: (
      <>
      Create shipments and track boxes in transit to partner organizations. Find <strong>Manage Shipments</strong> and <strong>Network</strong> under <strong>Aid Transfers</strong> in your main navigation.
      </>
    ),
    imageSrc: Slide04Image,
  },
  {
    title: "Register & support beneficiaries",
    text: (
      <>
      Add new people, view their profile and service history. Update details on the go, assign <strong>Tokens</strong>, manage <strong>Services</strong> - all from the <strong>Beneficiaries</strong> section.
      </>
    ),
    imageSrc: Slide05Image,
  },
];

export default slides;
