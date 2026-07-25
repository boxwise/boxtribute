export interface GuideStep {
  title: string;
  description?: string;
  picture?: string;
  html?: string;
  note?: string;
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
        html: "<p><strong>Coordinator Admin · Users</strong></p><p>Lists all team members and their current roles.</p><ul><li><b>Name:</b> Anna M.</li><li><b>Role:</b> Warehouse Volunteer</li><li><b>Base:</b> Lesvos</li></ul>",
        note: "Each person can have one role per base they are assigned to.",
      },
      {
        title: "Add or edit a user",
        description: "Click 'Add User' or select an existing user to change their role.",
        html: "<p><strong>Edit User · Anna M.</strong></p><p>Assign a role that matches the person's responsibilities.</p><ul><li><b>Email:</b> anna@example.org</li><li><b>Role:</b> <mark>Coordinator</mark></li></ul>",
        note: "Roles are predefined. A Coordinator can manage stock, users and settings.",
      },
      {
        title: "Assign to a base",
        description: "Select which base(s) the user should have access to.",
        html: "<p><strong>Edit User · Anna M.</strong></p><p>A user can belong to multiple bases with the same or different roles.</p><ul><li><b>Base:</b> Lesvos</li><li><b>Base 2:</b> Samos</li></ul>",
        note: "Access is always scoped to a specific base — no cross-base leakage.",
      },
      {
        title: "Save and confirm",
        description:
          "Hit Save. The user will receive an email invitation and can log in immediately.",
        html: "<p><strong>User Saved</strong></p><p>Changes take effect immediately. The user gets an email notification.</p><ul><li><b>Status:</b> <mark>Active</mark></li></ul>",
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
        html: "<p><strong>CSV Import · Download Template</strong></p><p>Use the template to ensure the column headers match what Boxtribute expects.</p><ul><li><b>Required columns:</b> Name, Category, Size, Quantity</li><li><b>Optional:</b> Comment, Tags</li></ul>",
        note: "UTF-8 encoding and comma delimiters are required.",
      },
      {
        title: "Upload the file",
        description: "Go to Admin → Import and drag your completed CSV onto the upload area.",
        html: "<p><strong>CSV Import · Upload</strong></p><p>Files up to 10 MB are supported. Rows with errors are flagged before import.</p><ul><li><b>File:</b> <mark>stock_2024.csv</mark></li></ul>",
        note: "You'll get a preview of the first 20 rows before committing the import.",
      },
      {
        title: "Review and confirm",
        description: "Check the preview for any mapping errors, then click Import.",
        html: "<p><strong>CSV Import · Preview</strong></p><p>Any rows that can't be parsed are shown in red. Fix them or skip them.</p><ul><li><b>Valid rows:</b> 1 204</li><li><b>Errors:</b> <mark>3</mark></li></ul>",
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
        html: "<p><strong>Manage Tags · Beneficiary tags</strong></p><p>Create reusable tags that describe vulnerability situations.</p><ul><li><b>New beneficiary tag:</b> Medical attention needed</li></ul><p>Example tags: Medical attention needed, Unaccompanied minor, Supporting disabled member, Pregnant / lactating</p>",
        note: "These tags become each person's protection status. No custom 'vulnerability field' to build — one tag set, reused on every beneficiary you register.",
      },
      {
        title: "Flag people as you register them",
        description: "Apply the tag on the Add a Beneficiary form — everyone carries their status.",
        html: "<p><strong>Add Beneficiary · Tags</strong></p><p>Tags are applied during registration and travel with the person.</p><ul><li><b>Beneficiary:</b> Amara N.</li><li><b>Vulnerability tag:</b> <mark>Medical attention needed</mark></li></ul>",
        note: "The tag travels with the person so staff at any station can see the status at a glance.",
      },
      {
        title: "Filter to the priority list",
        description: "Pull everyone who needs protection first, in one click.",
        html: "<p><strong>Beneficiaries · Filter by Tag</strong></p><p>Filter the beneficiary list to a specific vulnerability tag instantly.</p><ul><li><b>Filter by tag:</b> <mark>Medical attention needed</mark></li><li><b>Results:</b> 14 people</li></ul>",
        note: "You can combine multiple tags to see e.g. everyone who is both pregnant and unaccompanied.",
      },
      {
        title: "Match them to aid & services",
        description: "Assign a service, or give priority at Free Shop checkout.",
        html: "<p><strong>Beneficiaries · Assign to Service</strong></p><p>Link a vulnerability tag to a specific service for automatic matching.</p><ul><li><b>Beneficiary:</b> <mark>Amara N. · Medical attention needed</mark></li><li><b>Service:</b> Medical referral — Clinic partner</li></ul>",
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
        html: "<p><strong>Coordinator Admin · Locations</strong></p><p>Lists every location currently configured in your base.</p><ul><li><b>Location:</b> Main Hall</li><li><b>Location:</b> Cold Storage</li></ul>",
        note: "Locations are per-base. Each location maps to a physical area in your warehouse.",
      },
      {
        title: "Add a new location",
        description: "Click 'Add location' and give it a name that matches your physical signage.",
        html: "<p><strong>Add Location</strong></p><p>Name it exactly as labelled in the warehouse so volunteers recognise it instantly.</p><ul><li><b>Name:</b> <mark>Rack A3 — Clothing</mark></li><li><b>Type:</b> Stocking</li></ul>",
        note: "Avoid generic names like 'Room 1'. The name appears on every box label.",
      },
      {
        title: "Assign boxes to the location",
        description: "When receiving or moving stock, assign each box to the correct location.",
        html: "<p><strong>Box · Edit Location</strong></p><p>You can update a box's location at any time — it takes effect immediately.</p><ul><li><b>Box:</b> #00145</li><li><b>Location:</b> <mark>Rack A3 — Clothing</mark></li></ul>",
        note: "Scanning the box QR code and tapping 'Move' is the fastest way to update location in bulk.",
      },
    ],
    featureUnderneathTags: ["Locations"],
    featureUnderneathDescription:
      "Locations are the backbone of stock visibility. Set them up to match your space and volunteers will always know where to look.",
    featureUnderneathLink: "See how locations work →",
  },
];
