export interface GuideStep {
  title: string;
  description?: string;
  picture?: string;
  alt?: string;
  markdown?: string;
  note?: string;
  optional?: boolean;
}

export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
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
    tags: ["Team Setup", "Users", "Roles"],
    feature: "Users + roles",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We need different people to have different levels of access — volunteers shouldn't be able to delete beneficiaries, and managers need oversight of the whole warehouse.",
    steps: [
      {
        title: "Go to Admin → Users",
        description: "Navigate to the Coordinator Admin panel and open the Users section.",
        markdown:
          "**Coordinator Admin · Users**\n\nLists all team members and their current roles.\n\n- **Name:** Anna M.\n- **Role:** Warehouse Volunteer\n- **Base:** Lesvos",
        note: "Each person can have one role per base they are assigned to.",
      },
      {
        title: "Add or edit a user",
        description: "Click 'Add User' or select an existing user to change their role.",
        markdown:
          "**Edit User · Anna M.**\n\nAssign a role that matches the person's responsibilities.\n\n- **Email:** anna@example.org\n- **Role:** <mark>Coordinator</mark>",
        note: "Roles are predefined. A Coordinator can manage stock, users and settings.",
      },
      {
        title: "Assign to a base",
        description: "Select which base(s) the user should have access to.",
        markdown:
          "**Edit User · Anna M.**\n\nA user can belong to multiple bases with the same or different roles.\n\n- **Base:** Lesvos\n- **Base 2:** Samos",
        note: "Access is always scoped to a specific base — no cross-base leakage.",
      },
      {
        title: "Save and confirm",
        description:
          "Hit Save. The user will receive an email invitation and can log in immediately.",
        markdown:
          "**User Saved**\n\nChanges take effect immediately. The user gets an email notification.\n\n- **Status:** <mark>Active</mark>",
        note: "You can deactivate a user at any time without deleting their history.",
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
    tags: ["Data Import", "CSV import"],
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
        markdown:
          "**CSV Import · Download Template**\n\nUse the template to ensure the column headers match what Boxtribute expects.\n\n- **Required columns:** Name, Category, Size, Quantity\n- **Optional:** Comment, Tags",
        note: "UTF-8 encoding and comma delimiters are required.",
      },
      {
        title: "Upload the file",
        description: "Go to Admin → Import and drag your completed CSV onto the upload area.",
        markdown:
          "**CSV Import · Upload**\n\nFiles up to 10 MB are supported. Rows with errors are flagged before import.\n\n- **File:** <mark>stock_2024.csv</mark>",
        note: "You'll get a preview of the first 20 rows before committing the import.",
      },
      {
        title: "Review and confirm",
        description: "Check the preview for any mapping errors, then click Import.",
        markdown:
          "**CSV Import · Preview**\n\nAny rows that can't be parsed are shown in red. Fix them or skip them.\n\n- **Valid rows:** 1 204\n- **Errors:** <mark>3</mark>",
        note: "Skipped rows are not lost — you can re-import them separately.",
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
    tags: ["Protection & Targeting", "Beneficiary Tags"],
    feature: "Beneficiary tags",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We need to flag people with specific vulnerabilities — medical needs, unaccompanied minors, pregnant women — and make sure they are served first at every touchpoint, not just when a staff member happens to remember.",
    steps: [
      {
        title: "Create your vulnerability tags",
        description: "Add beneficiary tags once for the situations you need to flag.",
        markdown:
          "**Manage Tags · Beneficiary tags**\n\nCreate reusable tags that describe vulnerability situations.\n\n- **New beneficiary tag:** Medical attention needed\n\nExample tags: Medical attention needed, Unaccompanied minor, Supporting disabled member, Pregnant / lactating",
        note: "These tags become each person's protection status. No custom 'vulnerability field' to build — one tag set, reused on every beneficiary you register.",
      },
      {
        title: "Flag people as you register them",
        description: "Apply the tag on the Add a Beneficiary form — everyone carries their status.",
        markdown:
          "**Add Beneficiary · Tags**\n\nTags are applied during registration and travel with the person.\n\n- **Beneficiary:** Amara N.\n- **Vulnerability tag:** <mark>Medical attention needed</mark>",
        note: "The tag travels with the person so staff at any station can see the status at a glance.",
      },
      {
        title: "Filter to the priority list",
        description: "Pull everyone who needs protection first, in one click.",
        markdown:
          "**Beneficiaries · Filter by Tag**\n\nFilter the beneficiary list to a specific vulnerability tag instantly.\n\n- **Filter by tag:** <mark>Medical attention needed</mark>\n- **Results:** 14 people",
        note: "You can combine multiple tags to see e.g. everyone who is both pregnant and unaccompanied.",
      },
      {
        title: "Match them to aid & services",
        description: "Assign a service, or give priority at Free Shop checkout.",
        markdown:
          "**Beneficiaries · Assign to Service**\n\nLink a vulnerability tag to a specific service for automatic matching.\n\n- **Beneficiary:** <mark>Amara N. · Medical attention needed</mark>\n- **Service:** Medical referral — Clinic partner",
        note: "The tag travels with the person into services and checkout, so the most at-risk are matched first — by default, not by luck.",
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
    tags: ["Warehouse Setup", "Locations"],
    feature: "Locations",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "Our warehouse has multiple rooms and sections but Boxtribute doesn't reflect the physical layout. Volunteers spend time searching for boxes because the system doesn't tell them where things actually are.",
    steps: [
      {
        title: "Open Locations in Admin",
        description: "Go to Coordinator Admin → Locations to see your current warehouse layout.",
        markdown:
          "**Coordinator Admin · Locations**\n\nLists every location currently configured in your base.\n\n- **Location:** Main Hall\n- **Location:** Cold Storage",
        note: "Locations are per-base. Each location maps to a physical area in your warehouse.",
      },
      {
        title: "Add a new location",
        description: "Click 'Add location' and give it a name that matches your physical signage.",
        markdown:
          "**Add Location**\n\nName it exactly as labelled in the warehouse so volunteers recognise it instantly.\n\n- **Name:** <mark>Rack A3 — Clothing</mark>\n- **Type:** Stocking",
        note: "Avoid generic names like 'Room 1'. The name appears on every box label.",
      },
      {
        title: "Assign boxes to the location",
        description: "When receiving or moving stock, assign each box to the correct location.",
        markdown:
          "**Box · Edit Location**\n\nYou can update a box's location at any time — it takes effect immediately.\n\n- **Box:** #00145\n- **Location:** <mark>Rack A3 — Clothing</mark>",
        note: "Scanning the box QR code and tapping 'Move' is the fastest way to update location in bulk.",
      },
    ],
    featureUnderneathTags: ["Locations"],
    featureUnderneathDescription:
      "Locations are the backbone of stock visibility. Set them up to match your space and volunteers will always know where to look.",
    featureUnderneathLink: "See how locations work →",
  },
];
