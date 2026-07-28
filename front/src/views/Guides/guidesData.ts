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

const moveIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="1em" height="1em" fill="currentColor" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M208 320h384c8.8 0 16-7.2 16-16V48c0-8.8-7.2-16-16-16H448v128l-48-32-48 32V32H208c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16zm416 64H128V16c0-8.8-7.2-16-16-16H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h48v368c0 8.8 7.2 16 16 16h82.9c-1.8 5-2.9 10.4-2.9 16 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1.2-11-2.9-16H451c-1.8 5-2.9 10.4-2.9 16 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1.2-11-2.9-16H624c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"/></svg>`;

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
        picture: "/guides/example-response-team-set-up.png",
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
        picture: "/guides/invite-your-team.png",
        markdown:
          "Select [+ New User] and enter the name and email of your team member, pick the role that aligns with their job, then select “Save and Close”. The team member will receive an email inviting them to sign into Boxtribute; access begins immediately.",
        note: "Tip: It is good to allocate all staff individual logins, even if it is just for the short term, as this allows you to see activity per role and quickly identify operational issues.",
      },
      {
        title: "Managing multiple teams across the organisation",
        picture: "/guides/org-chart.png",
        markdown:
          "Boxtribute separates each operational unit by “base”, short for “base of operations”. Usually, bases are separated by physical locations (e.g., Base: Balkans vs. Base: Athens), but “base” can also be used to fully separate project teams or workstreams.  Staff are assigned individually to a base and can only see and work with data in the bases they are assigned to.",
        note: "People assigned to the Head of Operations role can see all data and users across all bases in the organisation.",
      },
      {
        title: "Managing Handover",
        description: "What to do when someone leaves or changes their role",
        picture: "/guides/manage-handover.png",
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
    subtitle: "Find, filter, and sort stock easily using Locations and Tags",
    tags: ["Warehouse Setup", "Locations"],
    feature: "Locations",
    estimatedMinutes: 10,
    status: "roadmap",
    requirement:
      "Our warehouse has multiple rooms and sections, and it takes Staff a lot of time to look through and search for the boxes we need. How do we set up Boxtribute so that the system can quickly find and tell us where things actually are?",
    steps: [
      {
        title: "Identify the key areas in your warehouse(s)",
        description:
          "Whether it's a makeshift storage hub in a garage or a professional warehouse space, having clear zones and storage areas helps the logistics of inbound and outbound aid delivery flow smoothly.",
        picture: "/guides/warehouse-floor-plan.png",
        markdown:
          "  Consider how stock is coming into and leaving the warehouse. Try to organize the warehouse so stock flows smoothly as it comes into and goes out of the warehouse. Try to minimize the need to carry things back and forth, especially by hand.  The team should sit together and identify zones in the warehouse and allocate these in Boxtribute - You will most likely need at least the following activity areas:\n\n1. Incoming\n1. Sort / Label / Register\n1. Storage\n1. Outgoing stock\n\nClear signage will help the warehouse team do their best. Even in makeshift storage hubs, you can use color masking tape and cardboard signs to clearly identify different warehouse areas.",
        note: "When picking storage areas for different types of items, consider any special storage requirements for stock (e.g. heavy items, temperature control, protection from sunlight/water, keeping it away from walls to prevent vermin), as well as staff safety. Make sure you secure storage areas to prevent accidents and injuries.",
      },
      {
        title: "Set up Locations",
        description:
          "Set up Locations so that they match warehouse storage areas will help you easily find where items are in your available spaces.",
        picture: "/guides/warehouse-locations.png",
        markdown:
          "Create a location for each warehouse and zone. Choosing clear names will help you to find stock quickly and easily. Keep names short and consistent to allow for easy allocation and sorting.\n1. Go to Coordinator Admin → Edit Warehouses\n1. Select [+Add Location] and enter the location label, pick the default status of Boxes, then select ‘Save and Close’.\n1. Example location naming:\n\t- WH 1, Refrigeration\n\t- WH 1, Aisle 1: Hygiene & Health\n\t- WH 1, Aisle 1: Medical Supplies\n\t- WH1, Aisle 2: Baby and Children\n\t- WH1, Aisle 2: Womens’ Clothing\n\t- WH2, Loft\n\t- WH2, Floor Left\n\t- WH2, Floor Right (Scrap)\n\t- WH2, Outbound Area 1",
        note: "If the needs served by the warehouse change, you can add, edit, or archive locations at any time.",
      },
      {
        title: "Use Tags",
        description:
          "Tags allow you to categorize and sort your stock and/or beneficiary data to allow for easy filtering, planning and reporting.",
        picture: "/guides/tags.png",
        markdown:
          "It is recommended to add tags based on your distribution planning needs, or data that you may need to pull for your programming and reporting needs. Commonly created tags may relate to project cycle, vulnerability or expiry date.\n1. Go to Coordinator Admin → Manage Tags\n1. Select [+ Create Tag] and enter the tag category, what it should apply to (beneficiaries, boxes or both) a color for easy sorting and the description, then select ‘Save Tag’.\n1. Examples frequently include:\n\t- **By recipient**: 'PLW (pregnant and lactating woman)', 'NA (new arrivals)' 'FHH (female head of Household)'\n\t- **By project or donor**: 'Project cycle 1234', 'Winter Kit', 'ECHO', 'UNICEF'\n\t- **By partner category**: 'NGO X, Greece', 'NGO Y, Syria'",
        note: "You can filter your entire stock view in both Manage Boxes and in the Dashboard by tag - useful before a distribution or when preparing a report.",
      },
      {
        title: "Move boxes into the right location",
        description: "How to move your boxes into different locations",
        picture: "/guides/move-a-box.png",
        markdown: `When stock arrives or moves, update the location in Boxtribute immediately. This keeps your live stock view accurate. To move boxes into a location:
<table>
  <thead>
    <tr>
      <th>On Mobile / inside the warehouse</th>
      <th>On Desktop</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <ol>
          <li>Select “Scan QR Label” from the mobile menu, and make sure the “SOLO BOX” option is selected</li>
          <li>Once the camera viewer shows, point it at any box QR code label to pull up its information</li>
          <li>Select the location you want it to move to under the “${moveIconSvg} Move” section</li>
        </ol>
      </td>
      <td>
        <ol>
          <li>Go to Aid Inventory ->  Manage Boxes</li>
          <li>Search or filter for the box you want, then select its row on the table</li>
          <li>Select the location you want it to move to under the “${moveIconSvg} Move” section</li>
        </ol>
      </td>
    </tr>
  </tbody>
</table>`,
        note: "You can also move boxes in bulk on mobile by selecting the “MULTI BOX” scan option; on desktop, you can select multiple boxes from the Manage Boxes screen, then move them using the move button at the top of the table.",
      },
      {
        title: "Use filters to find what you need",
        description:
          "Plan for your distribution, search by vulnerability - how to use tags to search through your data to help with your planning.",
        picture: "/guides/move-a-box.png",
        markdown:
          "Combine location and tag filters to drill down quickly and pull the data you are needing. For example; you can export a report showing a tag ‘winterization kits’ and the ‘project cycle’ which will show how many winterization kits you have donated from that donor and at which location so you can plan for your upcoming distribution.",
      },
    ],
    reference: {
      title: "Locations vs Tags in Boxtribute - what's the difference?",
      markdown: `Boxtribute gives you tools to organise your stock: **Locations** and **Tags**. It’s helpful to use them to know exactly where stock is and who it is for. It can also support with donor reporting as you can tag to the donor, project and budget cycle. Understand what thresholds you have - where stock is in your warehouse, freeshop, or various bases.
<br/>
<img src="/guides/tags.png" alt="loc-tags-difference"></img>
<br/>
<table>
  <thead>
    <tr>
      <th></th>
      <th>Locations</th>
      <th>Tags</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>What it is</b></td>
      <td>A physical area in your warehouse</td>
      <td>A tag you add in the boxtribute app that allows you to filter and sort</td>
    </tr>
    <tr>
      <td><b>Use it for</b></td>
      <td>Where stock is stored</td>
      <td>Grouping boxes by purpose, recipient, donor, beneficiary vulnerability etc.</td>
    </tr>
    <tr>
      <td><b>Example</b></td>
      <td>"Shelf A", "Incoming Area", "Clothing Zone"</td>
      <td>"PLW", "Project cycle 1234", "Donor: UNHCR"</td>
    </tr>
  </tbody>
</table>
<br/>
<b>Tip</b>: Tags can work alongside locations. A box can have multiple tags at the same time, but only one location.`,
    },
    featureUnderneathDescription:
      "Locations are the backbone of stock visibility. Set them up to match your space and volunteers will always know where to look.",
    featureUnderneathLink: "See how locations work →",
  },
];
