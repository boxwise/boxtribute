import { WalkthroughPath } from "./types";

const path3: WalkthroughPath = {
  id: "path3",
  title: "How to coordinate the whole operation",
  description:
    "Get an overview of how to manage stock, products, users, locations, and other coordination features!",
  icon: "📊",
  steps: [
    {
      target: "#nav-dashboard",
      title: "Dashboard",
      content:
        "Your command center. Stock levels, movement history, and beneficiary numbers across all bases in one view.",
      expandMenuGroup: "Statistics",
    },
    {
      target: "#nav-sales-reports",
      title: "Sales Report",
      content:
        "Generate reports on what's been distributed. Useful for donor reporting and internal performance reviews.",
      expandMenuGroup: "Statistics",
    },
    {
      target: "#nav-manage-products",
      title: "Manage Products",
      content:
        "Define your product catalogue: products, categories, and more. This underpins every box and distribution in the system.",
      expandMenuGroup: "Coordinator Admin",
    },
    {
      target: "#nav-manage-tags",
      title: "Manage Tags",
      content:
        "Create tags to label boxes and beneficiaries with custom attributes. A flexible way to filter and segment your data.",
      expandMenuGroup: "Coordinator Admin",
    },
    {
      target: "#nav-edit-warehouses",
      title: "Edit Warehouses",
      content:
        "Set up the physical spots in your warehouse where boxes are stored. Locations make it easy to find and move stock quickly.",
      expandMenuGroup: "Coordinator Admin",
    },
    {
      target: "#nav-manage-users",
      title: "Manage Users",
      content:
        "Add team members, assign roles, and control who has access to what across your base.",
      expandMenuGroup: "Coordinator Admin",
    },
  ],
};

export default path3;
