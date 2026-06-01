import { WalkthroughPath } from "./types";

const path2: WalkthroughPath = {
  id: "path2",
  title: "How to register & support beneficiaries",
  description: "Learn where to add beneficiaries, assign services, and tokens!",
  icon: "👥",
  steps: [
    {
      target: "#nav-beneficiaries",
      title: "Beneficiaries",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The Beneficiaries section is where you manage all the people your organisation supports.",
      expandMenuGroup: "Beneficiaries",
    },
    {
      target: "#nav-add-beneficiary",
      title: "Add Beneficiary",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Register new beneficiaries and capture their household details so they can access services.",
      expandMenuGroup: "Beneficiaries",
    },
    {
      target: "#nav-manage-beneficiaries",
      title: "Manage Beneficiaries",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Search, update, and manage the list of all registered beneficiaries in your base.",
      expandMenuGroup: "Beneficiaries",
    },
  ],
};

export default path2;
