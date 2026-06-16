import { WalkthroughPath } from "./types";

const path2: WalkthroughPath = {
  id: "path2",
  title: "How to register & support beneficiaries",
  description: "Learn where to add beneficiaries, assign services, and tokens!",
  icon: "Beneficiaries",
  steps: [
    {
      target: "#nav-dashboard",
      title: "Dashboard",
      content:
        "Check the beneficiary overview at the bottom of the dashboard - see how many people your base has reached and more.",
      expandMenuGroup: "Statistics",
    },
    {
      target: "#nav-manage-beneficiaries",
      title: "Manage Beneficiaries",
      content:
        "Add, search, and manage the people your organisation supports. Each profile holds personal details and service history.",
      expandMenuGroup: "Beneficiaries",
    },
    {
      target: "#nav-add-beneficiary",
      title: "Add Beneficiary",
      content:
        "Create a profile for every person who comes to you for detailed tracking and analysis.",
      expandMenuGroup: "Beneficiaries",
    },
    {
      target: "#nav-use-service",
      title: "Services",
      content:
        "Configure the types of services that your base provides (e.g. learning). Link them to individual beneficiaries.",
      expandMenuGroup: "Beneficiaries",
    },
    {
      target: "#nav-checkout",
      title: "Checkout",
      content: "Perform checkout for a beneficiary during a distribution. Helps you track usage.",
      expandMenuGroup: "Free Shop",
    },
    {
      target: "#nav-stockroom",
      title: "Stockroom",
      content:
        "The free shop stockroom shows what items are available for beneficiaries to choose from during a distribution session.",
      expandMenuGroup: "Free Shop",
    },
    {
      target: "#nav-stock-planning",
      title: "Stock Planning",
      content:
        "When stock runs low in the free shop, trace it back to boxes here. You'll work closely with the warehouse team.",
      expandMenuGroup: "Aid Inventory",
    },
  ],
};

export default path2;
