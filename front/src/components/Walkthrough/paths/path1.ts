import { WalkthroughPath } from "./types";

const path1: WalkthroughPath = {
  id: "path1",
  title: "How to manage stock & boxes",
  description:
    "Learn where to start with Boxtribute, setup boxes, track your warehouse inventory, and more!",
  icon: "📦",
  steps: [
    {
      target: "#nav-dashboard",
      title: "Dashboard",
      content:
        "Your home base. See a live snapshot of how many boxes and items are in stock across all your locations. You'll always start here, as this tells you the health of your warehouse at a glance.",
      expandMenuGroup: "Statistics",
    },
    {
      target: "#nav-print-box-labels",
      title: "Print Box Labels",
      content:
        "Generate and print QR labels to physically tag boxes in your warehouse. Scan them to pull up contents instantly.",
      contentNote:
        "Note: this feature is build/adapted specifically for mobile, so try rescaling your browser or opening up on your phone to test it.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-manage-boxes",
      title: "Manage Boxes",
      content:
        "This is where boxes live. Each box holds items of one category and has a label, location, and status. Think of this as your physical shelf, but actually digital and searchable.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-stock-planning",
      title: "Stock Planning",
      content:
        "See what's running low and plan ahead. This section helps you prioritize where you have surplus and shortages.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-manage-network",
      title: "Manage Network",
      content:
        "See the other organisations your base collaborates with for sending and receiving stock.",
      expandMenuGroup: "Aid Transfers",
    },
    {
      target: "#nav-manage-shipments",
      title: "Manage Shipments",
      content:
        "Need to send boxes to another base? Create a shipment here and track it until it's received.",
      expandMenuGroup: "Aid Transfers",
    },
  ],
};

export default path1;
