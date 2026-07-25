export interface GuideStep {
  title: string;
  description?: string;
  picture?: string;
  alt?: string;
  markdown?: string;
  note?: string;
  optional?: boolean;
}

export interface GuideReference {
  title: string;
  markdown: string;
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
  reference?: GuideReference;
  featureUnderneathDescription: string;
  featureUnderneathLink: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "roles-and-permissions",
    title: "Set up roles & team permissions",
    subtitle: "Control who can see what in Boxtribute",
    tags: ["Users", "Roles"],
    feature: "Manage Users",
    estimatedMinutes: 5,
    status: "live",
    requirement:
      "We need different people to have different levels of access - only volunteers who have received the protection training should interact with beneficiaries, and managers need oversight of the whole warehouse.",
    steps: [
      {
        title: "Understand what each role can do",
        description:
          "Boxtribute comes with preset roles for the most common jobs in aid response. Take a look at our recommendations for the two most common setups.",
        markdown: `
**General Team:** Most common in an ad-hoc emergency response, this setup usually involves response teams who work across multiple functions with one manager overseeing the work. For this, we recommend:

<ol type="i">
  <li>Assigning <em>General Volunteer</em> for team members;</li>
  <li>Assigning <em>Coordinator</em> for the overseeing manager.</li>
</ol>

**Separate Logistics and Beneficiary-Facing Teams:** For projects with a stricter separation between team members working with beneficiaries and those working in the warehouse, we recommend:

<ol type="i" start="3">
  <li>Assigning <em>Volunteer (Warehouse)</em> for logistics team members;</li>
  <li>Assigning <em>Volunteer (Free Shop)</em> for beneficiary-facing members;</li>
  <li>Assigning <em>Coordinator</em> for overseeing managers of both teams.</li>
</ol>
`,
        note: "Coordinators can see both warehouse and beneficiary activities.",
      },
      {
        title: "Invite your team",
        markdown:
          "Select [+ New User] and enter the name and email of your team member, pick the role that aligns with their job, then select “Save and Close”. The team member will receive an email inviting them to sign into Boxtribute; access begins immediately.",
        note: "Tip: It is good to allocate all staff individual logins, even if it is just for the short term, as this allows you to see activity per role and quickly identify operational issues.",
      },
      {
        title: "Managing multiple teams across the organisation",
        markdown:
          "Boxtribute separates each operational unit by “base”, short for “base of operations”. Usually, bases are separated by physical locations (e.g., Base: Balkans vs. Base: Athens), but “base” can also be used to fully separate project teams or workstreams.  Staff are assigned individually to a base and can only see and work with data in the bases they are assigned to.",
        note: "People assigned to the Head of Operations role can see all data and users across all bases in the organisation.",
      },
      {
        title: "Managing Handover",
        description: "What to do when someone leaves or changes their role",
        picture: "/src/views/Guides/images/manage-handover.png",
        markdown:
          "When someone leaves or transitions into a new role, you can easily assign a new role to their account, or deactivate them. If you are changing coordinators, we recommend using the “Valid from“ and “Valid until” fields to schedule overlapping access between incoming and outgoing coordinators. Deactivated or Expired users with the <em>Volunteer</em> role can always be activated by users with a <em>Coordinator</em> or <em>Head of Operations</em> role. Deactivated or Expired users with a <em>Coordinator</em> role can only be activated by a user with a <em>Head of Operations</em> role.",
        note: "Tip: Never delete a user account. Deactivating keeps the audit trail intact. You can view all deactivated users in the “Deactivated“ tab in Manage Users.",
      },
    ],
    reference: {
      title: "Preset roles — who can do what?",
      markdown: `
<table>
  <thead>
    <tr>
      <th>Capability</th>
      <th>Label Creation</th>
      <th>Warehouse Volunteer</th>
      <th>External Free Shop Checkout</th>
      <th>Free Shop Volunteer</th>
      <th>General Volunteer</th>
      <th>Coordinator</th>
      <th>Head of Operations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Create Labels</td>
      <td>✓</td>
      <td>✓</td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Scan Boxes / See Box Content</td>
      <td></td>
      <td>✓</td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Move Boxes / Manage Inventory</td>
      <td></td>
      <td>✓</td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Free Shop Checkout</td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Register / Edit Beneficiaries</td>
      <td></td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Authorize Sending / Receiving Shipments</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Manage Tags, Products, Locations, Services</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Manage Users</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
    </tr>
  </tbody>
</table>
`,
    },
    featureUnderneathDescription:
      "Set this up once and every team member logs in with the right level of access from day one.",
    featureUnderneathLink: "/?camp=2&action=cms_users",
  },
  {
    slug: "import-stock-beneficiaries",
    title: "Import your existing stock or beneficiaries",
    subtitle: "Bring your existing data into Boxtribute with a CSV upload.",
    tags: ["Data Import", "CSV import"],
    feature: "CSV import",
    estimatedMinutes: 5,
    status: "roadmap",
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
    status: "roadmap",
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
    status: "roadmap",
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
    featureUnderneathDescription:
      "Locations are the backbone of stock visibility. Set them up to match your space and volunteers will always know where to look.",
    featureUnderneathLink: "See how locations work →",
  },
];
