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
        "Get a bird's-eye view of your warehouse. The Dashboard shows key statistics about your stock, shipments, and beneficiary distributions — all in one place.",
      expandMenuGroup: "Statistics",
    },
    {
      target: "#nav-print-box-labels",
      title: "Print Box Labels",
      content:
        "Generate and print QR labels to physically tag boxes in your warehouse. Scan them to pull up contents instantly. Note: this feature is build/adapted specifically for mobile, so try rescaling your browser or opening up on your phone to test it.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-manage-boxes",
      title: "Manage Boxes",
      content:
        "Here you can view, filter, and bulk-edit all boxes in your warehouse. Update their location, state, and product contents directly from this list.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-stock-planning",
      title: "Stock Planning",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Use Stock Planning to get an overview of available items per category and plan your next distribution.",
      expandMenuGroup: "Aid Inventory",
    },
    {
      target: "#nav-aid-transfers",
      title: "Aid Transfers",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Manage shipments and transfer agreements with partner organisations across the Boxtribute network.",
      expandMenuGroup: "Aid Transfers",
    },
    {
      target: "#nav-manage-shipments",
      title: "Manage Shipments",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Track the status of outgoing and incoming shipments, and coordinate with receiving bases.",
      expandMenuGroup: "Aid Transfers",
    },
  ],
};

export default path1;
