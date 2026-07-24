export interface GuideStep {
  title: string;
  description: string;
  optional?: boolean;
  screenTitle: string;
  screenDescription: string;
  screenFields?: { label: string; value?: string; highlight?: boolean }[];
  screenNote?: string;
  tags?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  feature: string;
  estimatedMinutes: number;
  status: "live" | "roadmap";
  requirement: string;
  steps: GuideStep[];
  featureUnderneathTags: string[];
  featureUnderneathDescription: string;
  featureUnderneathLink: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "roles-and-permissions",
    title: "Set up roles & team permissions",
    subtitle: "Control who can see and do what in Boxtribute.",
    category: "Team Setup",
    tags: ["Users", "Roles"],
    feature: "Users + roles",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We need different people to have different levels of access — volunteers shouldn't be able to delete beneficiaries, and managers need oversight of the whole warehouse.",
    steps: [
      {
        title: "Go to Admin → Users",
        description: "Navigate to the Coordinator Admin panel and open the Users section.",
        screenTitle: "Coordinator Admin · Users",
        screenDescription: "Lists all team members and their current roles.",
        screenFields: [
          { label: "Name", value: "Anna M." },
          { label: "Role", value: "Warehouse Volunteer" },
          { label: "Base", value: "Lesvos" },
        ],
        screenNote: "Each person can have one role per base they are assigned to.",
      },
      {
        title: "Add or edit a user",
        description: "Click 'Add User' or select an existing user to change their role.",
        screenTitle: "Edit User · Anna M.",
        screenDescription: "Assign a role that matches the person's responsibilities.",
        screenFields: [
          { label: "Email", value: "anna@example.org" },
          { label: "Role", value: "Coordinator", highlight: true },
        ],
        screenNote: "Roles are predefined. A Coordinator can manage stock, users and settings.",
      },
      {
        title: "Assign to a base",
        description: "Select which base(s) the user should have access to.",
        screenTitle: "Edit User · Anna M.",
        screenDescription: "A user can belong to multiple bases with the same or different roles.",
        screenFields: [
          { label: "Base", value: "Lesvos" },
          { label: "Base 2", value: "Samos" },
        ],
        screenNote: "Access is always scoped to a specific base — no cross-base leakage.",
      },
      {
        title: "Save and confirm",
        description:
          "Hit Save. The user will receive an email invitation and can log in immediately.",
        screenTitle: "User Saved",
        screenDescription: "Changes take effect immediately. The user gets an email notification.",
        screenFields: [{ label: "Status", value: "Active", highlight: true }],
        screenNote: "You can deactivate a user at any time without deleting their history.",
        optional: false,
      },
    ],
    featureUnderneathTags: ["Users + roles"],
    featureUnderneathDescription:
      "Set this up once and every team member logs in with the right level of access from day one.",
    featureUnderneathLink: "See how roles work →",
  },
  {
    slug: "import-stock-beneficiaries",
    title: "Import your existing stock or beneficiaries",
    subtitle: "Bring your existing data into Boxtribute with a CSV upload.",
    category: "Data Import",
    tags: ["CSV import"],
    feature: "CSV import",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We already track our stock and beneficiaries in spreadsheets and need to migrate that data into Boxtribute without re-entering everything by hand.",
    steps: [
      {
        title: "Prepare your CSV file",
        description:
          "Download the Boxtribute template and map your existing columns to the required fields.",
        screenTitle: "CSV Import · Download Template",
        screenDescription:
          "Use the template to ensure the column headers match what Boxtribute expects.",
        screenFields: [
          { label: "Required columns", value: "Name, Category, Size, Quantity" },
          { label: "Optional", value: "Comment, Tags" },
        ],
        screenNote: "UTF-8 encoding and comma delimiters are required.",
      },
      {
        title: "Upload the file",
        description: "Go to Admin → Import and drag your completed CSV onto the upload area.",
        screenTitle: "CSV Import · Upload",
        screenDescription:
          "Files up to 10 MB are supported. Rows with errors are flagged before import.",
        screenFields: [{ label: "File", value: "stock_2024.csv", highlight: true }],
        screenNote: "You'll get a preview of the first 20 rows before committing the import.",
      },
      {
        title: "Review and confirm",
        description: "Check the preview for any mapping errors, then click Import.",
        screenTitle: "CSV Import · Preview",
        screenDescription: "Any rows that can't be parsed are shown in red. Fix them or skip them.",
        screenFields: [
          { label: "Valid rows", value: "1 204" },
          { label: "Errors", value: "3", highlight: true },
        ],
        screenNote: "Skipped rows are not lost — you can re-import them separately.",
      },
    ],
    featureUnderneathTags: ["CSV import"],
    featureUnderneathDescription:
      "CSV import works for both stock items and beneficiary records. Run it as many times as you need.",
    featureUnderneathLink: "See how CSV import works →",
  },
  {
    slug: "identify-most-vulnerable",
    title: "Identify & prioritise the most vulnerable",
    subtitle: "Use beneficiary tags to flag and fast-track the people who need help most.",
    category: "Protection & targeting",
    tags: ["Beneficiary Tags"],
    feature: "Beneficiary tags",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We need to flag people with specific vulnerabilities — medical needs, unaccompanied minors, pregnant women — and make sure they are served first at every touchpoint, not just when a staff member happens to remember.",
    steps: [
      {
        title: "Create your vulnerability tags",
        description: "Add beneficiary tags once for the situations you need to flag.",
        screenTitle: "Manage Tags · Beneficiary tags",
        screenDescription: "Create reusable tags that describe vulnerability situations.",
        screenFields: [{ label: "New beneficiary tag", value: "Medical attention needed" }],
        screenNote:
          "These tags become each person's protection status. No custom 'vulnerability field' to build one tag set, reused on every beneficiary you register.",
        tags: [
          "Medical attention needed",
          "Unaccompanied minor",
          "Supporting disabled member",
          "Pregnant / lactating",
        ],
      },
      {
        title: "Flag people as you register them",
        description: "Apply the tag on the Add a Beneficiary form — everyone carries their status.",
        screenTitle: "Add Beneficiary · Tags",
        screenDescription: "Tags are applied during registration and travel with the person.",
        screenFields: [
          { label: "Beneficiary", value: "Amara N." },
          { label: "Vulnerability tag", value: "Medical attention needed", highlight: true },
        ],
        screenNote:
          "The tag travels with the person so staff at any station can see the status at a glance.",
      },
      {
        title: "Filter to the priority list",
        description: "Pull everyone who needs protection first, in one click.",
        screenTitle: "Beneficiaries · Filter by Tag",
        screenDescription: "Filter the beneficiary list to a specific vulnerability tag instantly.",
        screenFields: [
          { label: "Filter by tag", value: "Medical attention needed", highlight: true },
          { label: "Results", value: "14 people" },
        ],
        screenNote:
          "You can combine multiple tags to see e.g. everyone who is both pregnant and unaccompanied.",
      },
      {
        title: "Match them to aid & services",
        description: "Assign a service, or give priority at Free Shop checkout.",
        optional: true,
        screenTitle: "Beneficiaries · Assign to Service",
        screenDescription: "Link a vulnerability tag to a specific service for automatic matching.",
        screenFields: [
          { label: "Beneficiary", value: "Amara N. · Medical attention needed", highlight: true },
          { label: "Service", value: "Medical referral — Clinic partner" },
        ],
        screenNote:
          "The tag travels with the person into services and checkout, so the most at-risk are matched first — by default, not by luck.",
      },
    ],
    featureUnderneathTags: ["Beneficiary tags", "Manage Services"],
    featureUnderneathDescription:
      "Learn these two building blocks once and most 'can you add a field for...?' requests answer themselves.",
    featureUnderneathLink: "See how tags & services work →",
  },
  {
    slug: "organise-warehouse-space",
    title: "Organise your warehouse space",
    subtitle: "Map your physical warehouse into Boxtribute so boxes are always findable.",
    category: "Warehouse Setup",
    tags: ["Locations"],
    feature: "Locations",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "Our warehouse has multiple rooms and sections but Boxtribute doesn't reflect the physical layout. Volunteers spend time searching for boxes because the system doesn't tell them where things actually are.",
    steps: [
      {
        title: "Open Locations in Admin",
        description: "Go to Coordinator Admin → Locations to see your current warehouse layout.",
        screenTitle: "Coordinator Admin · Locations",
        screenDescription: "Lists every location currently configured in your base.",
        screenFields: [
          { label: "Location", value: "Main Hall" },
          { label: "Location", value: "Cold Storage" },
        ],
        screenNote:
          "Locations are per-base. Each location maps to a physical area in your warehouse.",
      },
      {
        title: "Add a new location",
        description: "Click 'Add location' and give it a name that matches your physical signage.",
        screenTitle: "Add Location",
        screenDescription:
          "Name it exactly as labelled in the warehouse so volunteers recognise it instantly.",
        screenFields: [
          { label: "Name", value: "Rack A3 — Clothing", highlight: true },
          { label: "Type", value: "Stocking" },
        ],
        screenNote: "Avoid generic names like 'Room 1'. The name appears on every box label.",
      },
      {
        title: "Assign boxes to the location",
        description: "When receiving or moving stock, assign each box to the correct location.",
        screenTitle: "Box · Edit Location",
        screenDescription:
          "You can update a box's location at any time — it takes effect immediately.",
        screenFields: [
          { label: "Box", value: "#00145" },
          { label: "Location", value: "Rack A3 — Clothing", highlight: true },
        ],
        screenNote:
          "Scanning the box QR code and tapping 'Move' is the fastest way to update location in bulk.",
      },
    ],
    featureUnderneathTags: ["Locations"],
    featureUnderneathDescription:
      "Locations are the backbone of stock visibility. Set them up to match your space and volunteers will always know where to look.",
    featureUnderneathLink: "See how locations work →",
  },
];
