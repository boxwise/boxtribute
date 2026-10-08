# Beneficiary Management - Specification

This is an overview of the current functionality in dropapp.

## Manage Beneficiaries

### Data display

- two tabs for active/inactive
- tabular form
    - active tab: family members nested under family head
    - inactive tab: sorted alphabetically. Icon to warn that family head must be reactivated before family member
- columns (all visible by default): surname, firstname, gender, age, refugee ID, tokens, tags, comments. If enabled for base: email/phone/custom fields
- text search

The next are only implemented in the active tab:
- total count
- quick filters:
    - new today/this week/this month
    - inactive
    - no signature
    - not registered
    - volunteer (if base supports it)
- tag filter
- icon for indicating that beneficiary has not yet signed data processing agreement

### Actions

#### Active tab

- export selected/export all
- deactivate beneficiaries
- assign tags to beneficiaries
- remove tag from beneficiaries
- sign beneficiaries up for service
- give tokens
    - forward to give.php (form with families, Give tokens, Give tokens peradult/child
- "touch" beneficiaries (bump their last-modified date to prevent auto-deactivation; used 2x since Jan 2025)
- merge individuals/family heads into new family
- split family members off of family
- create new beneficiary

#### Inactive tab

- activate beneficiaries
- fully delete beneficiaries (with confirmation)

## Create beneficiary

Three tabs. Actions: "Save and close", "Save and new", "Cancel"

### Personal tab

Form with several fields (all optional except firstname and refugee ID)
- family head
- firstname
- surname
- refugee ID
- gender
- date of birth
- tags
- languages
- comments
If enabled for base:
- phone number
- email
- custom fields

Checkboxes:
- not officially registered (yes/no)
- volunteer (yes/no)

### Used services tab

Empty.

### Privacy declaration tab

- in 5 languages (English, French, Arabic, Farsi, Somali); depending on org
- in production, custom for IHA, Darbazar
- signature field storing strokes as JSON (see custom.js: The signature is drawn client-side on an HTML5 canvas, serialized as JSON strokes by a jQuery plugin into a hidden textarea field, submitted as a normal form field, and persisted as raw JSON text in the people.signaturefield column alongside a boolean approvalsigned flag and a date_of_signature timestamp — no image file or separate signature table is used.)
- cms_form_signature

### Unclear

- bicycle
- workshop
- laundry

Not used by any active org.

## Beneficiary details

Four tabs: Personal, Used Services, Privacy declaration, and Transactions.

Side bar with family members (name, age, gender, comment), token info, "Give tokens" action, last purchase info, creation info, last signature info.

### Transactions tab

- Purchases list
    - new purchase: forward to /check_out.php
- Transactions list
    - give tokens: forward to /give.php
