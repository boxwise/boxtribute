import { WalkthroughPath } from "./types";

const path3: WalkthroughPath = {
  id: "path3",
  title: "How to coordinate the whole operation",
  description:
    "Get an overview of how to manage stock, products, users, locations, and other coordination features!",
  icon: "📊",
  steps: [
    {
      target: "#nav-coordinator-admin",
      title: "Coordinator Admin",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The Coordinator Admin section gives you full control over your base configuration.",
      expandMenuGroup: "Coordinator Admin",
    },
    {
      target: "#nav-manage-products",
      title: "Manage Products",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Define and organise the product catalogue used across your warehouse.",
      expandMenuGroup: "Coordinator Admin",
    },
    {
      target: "#nav-manage-users",
      title: "Manage Users",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Add, remove, and assign roles to volunteers and coordinators in your base.",
      expandMenuGroup: "Coordinator Admin",
    },
  ],
};

export default path3;
