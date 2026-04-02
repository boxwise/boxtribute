# Product Data Structure Investigation

## Executive Summary

Boxtribute's current data model was designed for clothing distribution and encodes several assumptions that limit its use for food, hygiene, and non-apparel humanitarian aid: gender is a first-class attribute of every product (not of the box or a variant), compound packaging (e.g. "40 bags of 25 kg") cannot be expressed, acquisition value and expiration dates are missing, and the gender-coupled product design makes statistical aggregation cumbersome.

Three designs are presented below. **Scenario 1 (Greenfield / ERP-Lite)** rebuilds the model from first principles using ERP-inspired patterns: a `ProductVariant` layer as the individually-priced SKU, a `ProductVariantDefinitions` table enforcing valid gender × size-range combinations per product, and a Box modelled explicitly as a *bundle* of identical variant items. Acquisition value lives per variant with a reference unit; no separate audit-history table is needed. It handles all product types (clothing, shoes, food, packaged goods) cleanly but requires ~320–485 hours and a controlled migration window. **Scenario 2 (Least Expensive Extension)** reaches the same functional goals through additive SQL changes—five new columns spread across two existing tables, two new tables, and no column renames—requiring ~80–130 hours and posing minimal migration risk. **Scenario 3 (Gender-Decoupled Extension)** builds directly on Scenario 2 by moving gender to the box level (~156–221 hours, four independent packages). **The recommendation is Scenario 2 or 3 for the near term**, with Scenario 1's ProductVariant concept identified as the natural evolution target once the additive changes are stable.

---

## Scenario 1: Greenfield / ERP-Lite Approach

### Design Principles

This scenario rebuilds the product model from first principles, drawing on patterns from open-source ERP systems (Odoo, ERPNext). Three ERP concepts map directly onto Boxtribute's needs:

1. **Product Template** (→ `products`): defines *what the item is* — name, category, base. No gender, no size. The product is the natural grouping unit for statistics: "how many kg of Rice do we have?" queries `products`, not `product_variants`.

2. **Product Variant (SKU)** (→ `product_variants`): the smallest independently-priced and stocked configuration. A Shoes product has three variants: Male/38–46, Female/34–42, Kid/17–36. A Rice product has one variant with no gender or discrete size. Every variant has its own `acquisition_value` expressed against a `ref_unit`.

3. **Bundle** (→ `boxes`/`stock`): a physical collection of *N identical items of one product variant* stored together in one warehouse location. The bundle tracks quantity (by count or by mass/volume), packaging structure, expiration, weight, and logistics metadata.

The **standard product concept is out of scope** for this redesign. Acquisition value **history is not tracked in a dedicated table**: the existing `save_update_to_history` decorator on the service layer automatically writes changes to the `history` table, providing an implicit change log at zero schema cost. If a full audit trail with DECIMAL precision or currency annotation is later required, a dedicated table can be added additively.

### Variant Dimension Model

Products declare their valid variant axes in a `product_variant_definitions` table. This table serves two purposes:
- **UI driver**: which selectors (gender, size/pack format) to show when creating a variant or box.
- **Validator**: prevents creating, e.g., a Shoes-Male variant paired with the Female size range.

The two optional orthogonal dimensions are **gender** and **size range / pack format**:

| Product | Gender options | Size range |
|---|---|---|
| T-Shirt | Male, Female, Boy, Girl | S, M, L, XL (shared across genders) |
| Shoes | Male | Shoe sizes Male (38–46) |
| Shoes | Female | Shoe sizes Female (34–42) |
| Shoes | Kid | Shoe sizes Kid (17–36) |
| Second-hand clothing | Male, Female, Unisex | Mass (kg) |
| Water | *(none)* | Water packs: 6×500ml, 10L |
| Peas | *(none)* | Pea packs: 12×300g tin, 1kg bag |
| Toothbrushes | *(none)* | Toothbrush packs: single, pack of 3 |
| Rice | *(none)* | Mass (kg) |

For Shoes, the three rows (Male×ShoesMale, Female×ShoesFemale, Kid×ShoesKid) make the gender-specific size-range constraint explicit and queryable. The UI dynamically loads the correct size options as soon as the coordinator selects a gender — no client-side category ID list required.

### Reference Unit and Acquisition Value

Every product variant optionally carries a `ref_unit_id` pointing to the `units` table. The `acquisition_value` is expressed per one `ref_unit`. Choosing a shared ref_unit across packaging formats (e.g., `kg` for all Peas variants, `liter` for all Water variants) enables cross-format cost comparisons. Choosing a format-native unit (e.g., `pack`) simplifies procurement tracking.

| Variant | ref_unit | acquisition_value | Total bundle value |
|---|---|---|---|
| T-Shirt Male | piece | 1.20 | `number_of_items × 1.20` |
| Shoes Male | pair | 3.50 | `number_of_items × 3.50` |
| Rice | kg | 0.75 | `measure_value × 0.75` |
| Second-hand clothing (Unisex) | kg | 0.50 | `measure_value × 0.50` |
| Water 6×500ml | pack | 2.40 | `number_of_items × 2.40` |
| Water 10L | liter | 0.70 | `measure_value × 0.70` |
| Peas 12×300g tin | kg | 1.80 | `measure_value × 1.80` |
| Peas 1kg bag | kg | 1.80 | `number_of_items × 1.80` |
| Toothbrush single | piece | 0.60 | `number_of_items × 0.60` |
| Toothbrush pack of 3 | pack | 1.50 | `number_of_items × 1.50` |

### Bundle (Box) Abstraction

A box is a **bundle**: N identical items of one product variant co-located. The bundle quantity is expressed in one of three modes:

| Mode | When used | Fields |
|---|---|---|
| **Discrete count** | clothing, shoes, packaged goods | `number_of_items + size_id` |
| **Mass/volume measurement** | rice, bulk clothing, liquid | `measure_value + display_unit_id` |
| **Compound packaging** | pallets of packs, cartons of tins | `package_spec_id + number_of_items` |

`box_weight_kg` is **computed** for mass-measured bundles (`measure_value` in kg ≈ `box_weight_kg` modulo tare). For discrete-count bundles it is manually entered or left NULL.

### ERD Diagram

```mermaid
erDiagram
    ORGANISATIONS ||--o{ BASES : "runs"
    BASES ||--o{ PRODUCTS : "owns"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "classifies"
    PRODUCT_CATEGORIES ||--o{ PRODUCT_CATEGORIES : "parent"
    PRODUCTS ||--o{ PRODUCT_VARIANT_DEFINITIONS : "declares_axes"
    PRODUCT_VARIANT_DEFINITIONS }|--o| PRODUCT_GENDERS : "gender_axis"
    PRODUCT_VARIANT_DEFINITIONS }|--o| SIZE_RANGES : "size_axis"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "has"
    PRODUCT_GENDERS |o--o{ PRODUCT_VARIANTS : "dimension"
    SIZE_RANGES ||--o{ PRODUCT_VARIANTS : "size_dimension"
    SIZE_RANGES ||--o{ SIZES : "contains"
    UNITS ||--o{ PRODUCT_VARIANTS : "ref_unit"
    PRODUCT_VARIANTS ||--o{ BOXES : "stocked_as"
    BOXES ||--o| SIZES : "discrete_size"
    BOXES ||--o| UNITS : "display_unit"
    BOXES ||--o| PACKAGE_SPECS : "packaging"
    BOXES ||--o| BOXES : "split_source"
    BOXES ||--|| QR_CODES : "identified_by"
    LOCATIONS ||--o{ BOXES : "stored_at"
    BOX_STATES ||--o{ BOXES : "status"
    UNITS ||--|| UNIT_DIMENSIONS : "belongs_to"
    PACKAGE_SPECS ||--|| UNITS : "outer_unit"
    PACKAGE_SPECS ||--|| UNITS : "inner_unit"

    PRODUCTS {
        int id PK
        int base_id FK
        int category_id FK
        varchar name
        bool in_shop
        text comment
        datetime created_on
        int created_by FK
        datetime deleted_on "nullable"
    }

    PRODUCT_VARIANT_DEFINITIONS {
        int id PK
        int product_id FK
        int gender_id FK "nullable - NULL for non-gendered axis"
        int size_range_id FK "nullable - NULL if unmeasured/unstructured"
        int seq "display order in UI"
    }

    PRODUCT_VARIANTS {
        int id PK
        int product_id FK
        int gender_id FK "nullable - NULL for non-gendered"
        int size_range_id FK "nullable - NULL for unstructured sizes"
        int ref_unit_id FK "nullable - unit for acquisition_value"
        decimal acquisition_value "nullable DECIMAL(12,4)"
        int distribution_price "existing value field"
        datetime deprecated_on "nullable"
        int deprecated_by FK "nullable"
        int preceded_by_variant FK "nullable"
    }

    BOXES {
        int id PK
        varchar label_identifier "11 chars UNIQUE"
        int product_variant_id FK
        int size_id FK "nullable - discrete size from variant range"
        int display_unit_id FK "nullable - mass/volume unit"
        decimal measure_value "nullable DECIMAL(36,18)"
        int package_spec_id FK "nullable - compound packaging"
        int number_of_items "nullable"
        int location_id FK
        int state_id FK
        int qr_code_id FK "UNIQUE"
        int source_box_id FK "nullable self-ref for splits"
        date expiration_date "nullable"
        decimal box_weight_kg "nullable DECIMAL(8,3) - computed for mass bundles"
        text comment
        datetime created_on
        datetime deleted_on "nullable"
    }

    PACKAGE_SPECS {
        int id PK
        int outer_quantity "e.g. 40"
        int outer_unit_id FK "e.g. bag, pack, tin"
        decimal inner_quantity "e.g. 25.0 DECIMAL(12,4)"
        int inner_unit_id FK "e.g. kg, g, ml, piece"
        datetime created_on
    }

    UNIT_DIMENSIONS {
        int id PK
        varchar name "mass / volume / count"
        varchar base_symbol "kg / L / pc"
    }

    UNITS {
        int id PK
        int dimension_id FK
        varchar name "kilogram / gram / liter / piece / pair / pack"
        varchar symbol "kg / g / L / pc / pr / pk"
        decimal conversion_factor "DECIMAL(36,18) to base unit"
    }

    SIZE_RANGES {
        int id PK
        varchar name "S-M-L-XL / Shoe sizes Male / Water packs / Mass"
        int dimension_id FK "nullable - links to UNIT_DIMENSIONS for measured ranges"
        int seq
    }

    SIZES {
        int id PK
        varchar label "S / 42 / 6x500ml / single"
        int size_range_id FK
        int seq
    }

    PRODUCT_GENDERS {
        int id PK
        varchar label
        varchar short_label "nullable"
        bool male
        bool female
        bool adult
        bool child
        bool baby
        varchar color
    }

    PRODUCT_CATEGORIES {
        int id PK
        varchar name
        int parent_id FK "nullable"
        bool is_gendered "drives aggregation + UI"
        int seq
    }
```

### Data Structure Design

#### Product → ProductVariantDefinitions → ProductVariant → Box

```
PRODUCT (template: "what is this item?")
  ↓ declared via PRODUCT_VARIANT_DEFINITIONS (which gender × size_range combos are valid)
PRODUCT_VARIANT (SKU: one per valid combo, with acquisition_value + ref_unit)
  ↓ stocked as
BOX / BUNDLE (N identical items of one variant, at one location, with quantity + expiry + weight)
```

The `product_variant_definitions` table acts as the "product attribute lines" in ERP terminology. It defines the variant matrix without pre-creating all variants. Coordinators create only the variants they actually need; the definition table enforces they cannot create invalid combinations (e.g., Shoes-Male paired with the Female size range).

#### Pack formats as sizes

Products like Water, Peas, and Toothbrushes have no gender dimension but DO have a pack-format dimension. Pack formats are modelled as regular `sizes` within a named `size_range`:

```sql
-- Size range for Water pack formats
INSERT INTO sizegroup VALUES (30, 'Water pack formats', NULL);
INSERT INTO sizes VALUES (200, '6×500ml pack', 30, 1, ...), (201, '10L container', 30, 2, ...);

-- Size range for Pea pack formats
INSERT INTO sizegroup VALUES (31, 'Pea pack formats', NULL);
INSERT INTO sizes VALUES (210, '12×300g tin pack', 31, 1, ...), (211, '1kg bag', 31, 2, ...);

-- Size range for Toothbrush packs
INSERT INTO sizegroup VALUES (32, 'Toothbrush packs', NULL);
INSERT INTO sizes VALUES (220, 'single', 32, 1, ...), (221, 'pack of 3', 32, 2, ...);
```

When pack formats require different acquisition values (e.g., Water 6×500ml vs. 10L at different $/liter), they become separate variants, each pointing to a size_range containing only their format. When the unit cost is uniform per base unit (e.g., same $/kg across all pea pack formats), one variant covering both pack formats is sufficient and the box's `size_id` captures which format it is.

#### Mass/volume measured bundles

Products distributed in bulk (Rice, second-hand clothing) use `measure_value + display_unit_id` on the box instead of `size_id`. The size_range for such variants uses a measurement dimension (Mass, Volume). `box_weight_kg` is automatically derivable from `measure_value` when `display_unit_id` is a mass unit — the application computes this rather than requiring manual entry.

#### Package specifications at bundle level

`package_spec_id` on the box describes the physical outer packaging when it matters for logistics:

| Scenario | package_spec | number_of_items | measure_value |
|---|---|---|---|
| Pallet of 24×(6×500ml water packs) | outer=24 pack, inner=6 bottle × 500ml | 24 | 72 (L) |
| T-shirt carton of 48 pieces | outer=48 piece | 48 | NULL |
| Sack of 25 kg rice | outer=1 bag × 25 kg | NULL | 25 (kg) |
| Shoe box of 6 pairs | outer=6 pair | 6 | NULL |

The package spec is **optional**. Simple bundles omit it; compound logistics units use it.

### Sample Data Mappings

#### T-Shirt: 20 pieces, size M, Men's

```
products:                     id=1, base_id=3, name='T-Shirt', category_id=1 (Clothing)

-- Valid variant axes for T-Shirt (all genders share S-M-L-XL size range)
product_variant_definitions:  (product=1, gender=Male,   size_range=1 [XS,S,M,L,XL,XXL], seq=1)
                              (product=1, gender=Female, size_range=1, seq=2)
                              (product=1, gender=Boy,    size_range=4 [Children by year], seq=3)
                              (product=1, gender=Girl,   size_range=4, seq=4)

-- The Men's T-Shirt SKU
product_variants:             id=10, product_id=1, gender_id=2 (Male), size_range_id=1 (XS-XL),
                              ref_unit_id=<piece>, acquisition_value=1.20, distribution_price=0

-- Bundle: 20 pieces of Men's T-Shirt, size M
boxes:                        id=100, product_variant_id=10, size_id=2 (M), number_of_items=20,
                              measure_value=NULL, display_unit_id=NULL, package_spec_id=NULL,
                              expiration_date=NULL, box_weight_kg=NULL, location_id=12
```

Acquisition total: 20 × €1.20 = **€24.00**

#### Shoes: Men's size 42 / Women's size 36 / Kids' size 25

Correct size options are guaranteed: selecting gender=Male loads size_range_id=8 (38–46), not 34–42.

```
products:                     id=2, base_id=3, name='Shoes', category_id=2 (Shoes)

-- Each gender maps to its own gender-specific size range
product_variant_definitions:  (product=2, gender=Male,   size_range=8 [Shoe sizes Male: 38–46], seq=1)
                              (product=2, gender=Female, size_range=3 [Shoe sizes Female: 34–42], seq=2)
                              (product=2, gender=Kid,    size_range=9 [Shoe sizes children: 17–36], seq=3)

product_variants:             id=20, product_id=2, gender_id=2 (Male),   size_range_id=8,
                                     ref_unit_id=<pair>, acquisition_value=3.50
                              id=21, product_id=2, gender_id=1 (Female), size_range_id=3,
                                     ref_unit_id=<pair>, acquisition_value=3.50
                              id=22, product_id=2, gender_id=6 (Kid),    size_range_id=9,
                                     ref_unit_id=<pair>, acquisition_value=2.80

boxes:                        id=200, product_variant_id=20, size_id=<42 from range 8>, number_of_items=1
                              id=201, product_variant_id=21, size_id=<36 from range 3>, number_of_items=1
                              id=202, product_variant_id=22, size_id=<25 from range 9>, number_of_items=1
```

#### Second-hand clothing: 200 kg mixed, Unisex

```
products:                     id=3, name='Second-Hand Clothing', category_id=1

product_variant_definitions:  (product=3, gender=Male,        size_range=28 [Mass], seq=1)
                              (product=3, gender=Female,      size_range=28, seq=2)
                              (product=3, gender=Unisex Adult,size_range=28, seq=3)

product_variants:             id=30, product_id=3, gender_id=3 (Unisex Adult), size_range_id=28 (Mass),
                              ref_unit_id=<kg>, acquisition_value=0.50

boxes:                        id=300, product_variant_id=30, size_id=NULL,
                              display_unit_id=<kg>, measure_value=200.0,
                              box_weight_kg=200.0,  -- computed: measure_value already in kg
                              number_of_items=NULL, expiration_date=NULL, location_id=12
```

Acquisition total: 200 × €0.50 = **€100.00**

#### Rice: 40 bags × 25 kg each

```
package_specs:                id=1, outer_quantity=40, outer_unit_id=<bag>,
                              inner_quantity=25.0, inner_unit_id=<kg>

products:                     id=50, name='Rice', category_id=4 (Food)

product_variant_definitions:  (product=50, gender=NULL, size_range=28 [Mass], seq=1)

product_variants:             id=200, product_id=50, gender_id=NULL, size_range_id=28 (Mass),
                              ref_unit_id=<kg>, acquisition_value=0.75

boxes:                        id=500, product_variant_id=200, size_id=NULL,
                              display_unit_id=<kg>, measure_value=1000.0,  -- 40 × 25 kg
                              package_spec_id=1, number_of_items=40,
                              expiration_date='2025-09-01',
                              box_weight_kg=1000.3  -- computed from measure_value + tare
```

Acquisition total: 1000 kg × €0.75 = **€750.00**

#### Water: 24 packs of 6×500ml

When Water 6×500ml and 10L are procured at the same $/liter rate, one variant covers both formats and the box's `size_id` captures which format it is:

```
-- Pack formats as sizes within one size range
size_ranges:  id=30, name='Water pack formats'
sizes:        (id=200, label='6×500ml pack', sizegroup_id=30, seq=1)
              (id=201, label='10L container', sizegroup_id=30, seq=2)

package_specs:  id=2, outer_quantity=24, outer_unit_id=<pack>,
                inner_quantity=6.0, inner_unit_id=<bottle>

products:       id=60, name='Water', category_id=5 (Drinks)

product_variant_definitions:  (product=60, gender=NULL, size_range=30, seq=1)

-- Single variant; acquisition value expressed per liter (base unit)
product_variants:  id=210, product_id=60, gender_id=NULL, size_range_id=30,
                   ref_unit_id=<liter>, acquisition_value=0.70

boxes:  id=600, product_variant_id=210, size_id=200 (6×500ml pack),
        number_of_items=24,                              -- 24 packs
        measure_value=72.0, display_unit_id=<liter>,     -- 24 × 3 L = 72 L
        package_spec_id=2,
        expiration_date='2025-12-31', box_weight_kg=72.5
```

Acquisition total: 72 L × €0.70 = **€50.40**

If 6×500ml and 10L packs are procured at different per-liter rates, each becomes its own variant with a single-entry size range.

#### Peas: 5 cases × (12 tins × 300g)

```
size_ranges:   id=31, name='Pea pack formats'
sizes:         (id=210, label='12×300g tin pack', sizegroup_id=31, seq=1)
               (id=211, label='1kg bag', sizegroup_id=31, seq=2)

package_specs: id=3, outer_quantity=5, outer_unit_id=<case>,
               inner_quantity=12.0, inner_unit_id=<tin>

products:       id=61, name='Peas', category_id=4 (Food)

product_variant_definitions:  (product=61, gender=NULL, size_range=31, seq=1)

-- One variant; cost normalised to kg across both pack formats
product_variants:  id=220, product_id=61, gender_id=NULL, size_range_id=31,
                   ref_unit_id=<kg>, acquisition_value=1.80

boxes:  id=610, product_variant_id=220, size_id=210 (12×300g tin pack),
        number_of_items=5,                              -- 5 cases
        measure_value=18.0, display_unit_id=<kg>,       -- 5 × 12 × 0.3 kg = 18 kg
        package_spec_id=3,
        expiration_date='2026-01-01', box_weight_kg=19.2
```

Acquisition total: 18 kg × €1.80 = **€32.40**

#### Toothbrushes: 200 singles + 50 packs-of-3

Separate variants are used because the per-piece cost differs between formats:

```
size_ranges:  id=32, name='Toothbrush packs'
sizes:        (id=220, label='single',     sizegroup_id=32, seq=1)
              (id=221, label='pack of 3',  sizegroup_id=32, seq=2)

products:       id=62, name='Toothbrush', category_id=6 (Hygiene)

product_variant_definitions:  (product=62, gender=NULL, size_range=32, seq=1)

-- Two variants sharing the same size range; each picks a distinct size_id on the box
product_variants:
  id=230, product_id=62, gender_id=NULL, size_range_id=32,
          ref_unit_id=<piece>, acquisition_value=0.60  -- single: €0.60/piece
  id=231, product_id=62, gender_id=NULL, size_range_id=32,
          ref_unit_id=<pack>,  acquisition_value=1.50  -- pack of 3: €1.50/pack (€0.50/piece)

boxes:
  id=700, product_variant_id=230, size_id=220 (single),    number_of_items=200
  id=701, product_variant_id=231, size_id=221 (pack of 3), number_of_items=50
```

Acquisition totals: 200 × €0.60 + 50 × €1.50 = **€195.00**

### Migration from Legacy

#### Conceptual transformation

```
-- LEGACY: Product with gender tightly coupled
products: id=10, name='Shoes Male', gender_id=2 (Male), sizegroup_id=8 (Shoe sizes Male),
          value=0, camp_id=3, category_id=2

-- STEP 1: Create products_new row (strip gender/size_range)
products_new: id=10, base_id=3, name='Shoes', category_id=2

-- STEP 2: Create product_variant_definition rows (all gender variants for this product)
product_variant_definitions: (product=10, gender=Male,   size_range=8)
                             (product=10, gender=Female, size_range=3)  -- from paired female product
                             (product=10, gender=Kid,    size_range=9)  -- from paired kid product

-- STEP 3: Create product_variant for the existing legacy product
product_variants: id=auto, product_id=10, gender_id=2, size_range_id=8,
                  ref_unit_id=NULL, acquisition_value=NULL, distribution_price=0

-- STEP 4: Repoint legacy boxes
stock.product_variant_id = <new_variant_id>   (product_id column removed)
```

Product consolidation (merging "Shoes Male" + "Shoes Female" + "Shoes Kids" into one "Shoes" product) is **optional** and can happen per-organisation at their own pace. The migration can be run product-by-product with zero downtime.

#### Migration steps

1. **Create new tables**: `product_variant_definitions`, `product_variants` alongside existing `products`. No drops yet.
2. **Backfill categories**: add `is_gendered` column; food/hygiene categories → 0, clothing → 1.
3. **Migrate products**: for each legacy product, insert into `products_new` (strip gender/sizegroup), then create one `product_variant` row with the legacy gender and size_range. Map `value` → `distribution_price`. Map "NoGender"/"-" → `gender_id = NULL`.
4. **Create variant definitions**: from each migrated variant, create one `product_variant_definitions` row.
5. **Repoint boxes**: set `product_variant_id` on all `stock` rows using the mapping table from step 3.
6. **Dual-write period**: keep both `product_id` and `product_variant_id` populated until all consumers are updated.
7. **Update ShipmentDetail**: add `source_product_variant_id` / `target_product_variant_id` columns; populate from product → variant mapping.
8. **Drop legacy columns**: `stock.product_id`, `products.gender_id`, `products.sizegroup_id` after validation.

Estimated downtime: near-zero during migration; 5–10 min cutover window.

### Database Schema (Greenfield — key CREATE TABLE statements)

```sql
-- NOTE: Existing unchanged tables are omitted for brevity.

-- New table: defines valid variant axes per product
CREATE TABLE `product_variant_definitions` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`     INT UNSIGNED NOT NULL,
  `gender_id`      INT UNSIGNED DEFAULT NULL,
  `size_range_id`  INT UNSIGNED DEFAULT NULL,
  `seq`            INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pvd` (`product_id`, `gender_id`, `size_range_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_pvd_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_pvd_gender`  FOREIGN KEY (`gender_id`)  REFERENCES `genders` (`id`),
  CONSTRAINT `fk_pvd_range`   FOREIGN KEY (`size_range_id`) REFERENCES `sizegroup` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- New table: individual SKUs with acquisition value
CREATE TABLE `product_variants` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`          INT UNSIGNED NOT NULL,
  `gender_id`           INT UNSIGNED DEFAULT NULL,  -- NULL = non-gendered
  `size_range_id`       INT UNSIGNED DEFAULT NULL,  -- NULL = no structured sizes
  `ref_unit_id`         INT UNSIGNED DEFAULT NULL,  -- unit for acquisition_value
  `acquisition_value`   DECIMAL(12,4) DEFAULT NULL,
  `distribution_price`  INT NOT NULL DEFAULT 0,
  `deprecated_on`       DATETIME DEFAULT NULL,
  `deprecated_by`       INT UNSIGNED DEFAULT NULL,
  `preceded_by_variant` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pv` (`product_id`, `gender_id`, `size_range_id`),
  KEY `product_id` (`product_id`),
  KEY `gender_id` (`gender_id`),
  KEY `size_range_id` (`size_range_id`),
  CONSTRAINT `fk_pv_product`   FOREIGN KEY (`product_id`)   REFERENCES `products` (`id`),
  CONSTRAINT `fk_pv_gender`    FOREIGN KEY (`gender_id`)    REFERENCES `genders` (`id`),
  CONSTRAINT `fk_pv_sizerange` FOREIGN KEY (`size_range_id`) REFERENCES `sizegroup` (`id`),
  CONSTRAINT `fk_pv_refunit`   FOREIGN KEY (`ref_unit_id`)  REFERENCES `units` (`id`),
  CONSTRAINT `fk_pv_preceded`  FOREIGN KEY (`preceded_by_variant`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Modified products table (gender_id and sizegroup_id REMOVED, standard_product_id REMOVED)
CREATE TABLE `products_v2` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `base_id`     INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `in_shop`     TINYINT NOT NULL DEFAULT 0,
  `comment`     VARCHAR(255) DEFAULT NULL,
  `created_on`  DATETIME DEFAULT NULL,
  `created_by`  INT UNSIGNED DEFAULT NULL,
  `deleted_on`  DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `base_id` (`base_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Package specs (compound packaging metadata)
CREATE TABLE `package_specs` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `outer_quantity`  INT UNSIGNED NOT NULL,
  `outer_unit_id`   INT UNSIGNED NOT NULL,
  `inner_quantity`  DECIMAL(12,4) NOT NULL,
  `inner_unit_id`   INT UNSIGNED NOT NULL,
  `created_on`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `outer_unit_id` (`outer_unit_id`),
  KEY `inner_unit_id` (`inner_unit_id`),
  CONSTRAINT `fk_ps_outer` FOREIGN KEY (`outer_unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `fk_ps_inner` FOREIGN KEY (`inner_unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Modified stock/boxes table
CREATE TABLE `stock_v2` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label_identifier`    VARCHAR(11) NOT NULL DEFAULT '',
  `product_variant_id`  INT UNSIGNED NOT NULL,         -- replaces product_id
  `size_id`             INT UNSIGNED DEFAULT NULL,
  `display_unit_id`     INT UNSIGNED DEFAULT NULL,
  `measure_value`       DECIMAL(36,18) DEFAULT NULL,
  `package_spec_id`     INT UNSIGNED DEFAULT NULL,
  `number_of_items`     INT DEFAULT NULL,
  `location_id`         INT UNSIGNED NOT NULL,
  `state_id`            INT UNSIGNED NOT NULL DEFAULT 1,
  `qr_id`               INT UNSIGNED DEFAULT NULL,
  `source_box_id`       INT UNSIGNED DEFAULT NULL,
  `expiration_date`     DATE DEFAULT NULL,
  `box_weight_kg`       DECIMAL(8,3) DEFAULT NULL,
  `distro_event_id`     INT UNSIGNED DEFAULT NULL,
  `comment`             TEXT,
  `created_on`          DATETIME DEFAULT NULL,
  `created_by`          INT UNSIGNED DEFAULT NULL,
  `deleted_on`          DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `label_identifier` (`label_identifier`),
  UNIQUE KEY `qr_id` (`qr_id`),
  KEY `product_variant_id` (`product_variant_id`),
  KEY `location_id` (`location_id`),
  KEY `size_id` (`size_id`),
  KEY `state_id` (`state_id`),
  KEY `expiration_date` (`expiration_date`),
  CONSTRAINT `fk_stock_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `fk_stock_ps`      FOREIGN KEY (`package_spec_id`)    REFERENCES `package_specs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- product_categories gains is_gendered flag
ALTER TABLE `product_categories`
  ADD COLUMN `is_gendered` TINYINT(1) NOT NULL DEFAULT 1 AFTER `parent_id`;
-- Backfill: food, hygiene, non-apparel categories → 0

-- unit_dimensions: cleanly separates measured dimension types from sizegroups
CREATE TABLE `unit_dimensions` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(50) NOT NULL,   -- 'mass', 'volume', 'count'
  `base_symbol`  VARCHAR(10) NOT NULL,  -- 'kg', 'L', 'pc'
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `unit_dimensions` VALUES (1,'mass','kg'), (2,'volume','L'), (3,'count','pc');

-- sizegroup gains optional dimension_id for mass/volume ranges
ALTER TABLE `sizegroup`
  ADD COLUMN `dimension_id` INT UNSIGNED DEFAULT NULL AFTER `name`,
  ADD CONSTRAINT `fk_sg_dim` FOREIGN KEY (`dimension_id`) REFERENCES `unit_dimensions` (`id`);
-- Backfill: sizegroup 28 (Mass) → dimension_id=1; sizegroup 29 (Volume) → dimension_id=2
```

#### Indexing strategy

| Table | Index | Rationale |
|---|---|---|
| `product_variant_definitions` | `(product_id)` | UI variant-axis lookup per product |
| `product_variants` | `(product_id, gender_id)` | Variant lookup by product + gender |
| `product_variants` | `(product_id, size_range_id)` | Variant lookup by product + size range |
| `stock_v2` | `(product_variant_id, state_id)` | InStock count aggregations |
| `stock_v2` | `(location_id, state_id)` | Location-level stock views |
| `stock_v2` | `expiration_date` | Expiry alerts and food safety queries |
| `package_specs` | `(outer_unit_id, inner_unit_id)` | Unit-based filtering |

### Implementation Effort (Scenario 1)

```
Backend Changes:
- New/modified models: 5 (ProductVariant NEW, ProductVariantDefinition NEW,
  Box MODIFIED, Product MODIFIED, PackageSpec NEW)
- New/modified GraphQL types: 3 new (ProductVariant, ProductVariantDefinition, PackageSpec),
  ~10 modified (Box, Product, ShipmentDetail, all inputs)
- Modified GraphQL resolvers: ~20 (box CRUD, product CRUD, statistics, shipment)
- New GraphQL resolvers: ~5 (productVariant queries, productVariantDefinitions, package spec CRUD)
- New/modified business logic modules: 4 (box service, product service,
  statistics aggregation, shipment reconciliation)
- Modified authorization rules: ~6 (product/box scopes gain variant check)
Backend estimated hours: 160–240  (confidence: medium)

Frontend Changes:
- Modified components: BoxCreate, BoxEdit, BoxesFilter, BoxesTable, ProductsContainer,
  CreateCustomProductForm, all statistics/filter views (~16 files)
- New components: PackageSpecInput, AcquisitionValueInput, ExpirationDateInput,
  ProductVariantSelector, VariantDefinitionEditor (~5 components)
- Updated GraphQL queries/fragments: ~18 files
Frontend estimated hours: 90–140  (confidence: medium)

Migration:
- Migration scripts: 4 (category backfill, product split + variant creation,
  box repoint, ShipmentDetail update)
- Estimated downtime: near-zero (dual-write) + 5–10 min cutover window
- Rollback complexity: MEDIUM — parallel table approach limits risk vs. in-place ALTER
Migration estimated hours: 30–50  (confidence: medium)

Testing & QA:
- Unit/integration tests: ~35 hours
- Manual QA of all affected flows: ~15 hours
Testing estimated hours: 40–55  (confidence: medium)

TOTAL: 320–485 hours
```

### Advantages

- ✅ **Clean aggregation by product**: Statistics group by `product_id` naturally. Non-gendered products (food, hygiene) aggregate without filter gymnastics — `gender_id` is NULL on the variant, not a sentinel value.
- ✅ **Correct size options guaranteed by `product_variant_definitions`**: Selecting gender=Male for Shoes loads `size_range_id=8` (38–46). The constraint is DB-enforced, not a client-side category-ID list.
- ✅ **All example product types handled cleanly**: Gendered clothing (T-Shirts), gender-differentiated size ranges (Shoes), bulk measured items (Rice, second-hand clothing), and pack-format products (Water, Peas, Toothbrushes) all fit the same (variant, size) model.
- ✅ **Reference unit enables cross-format cost comparison**: Normalising Water variants to $/liter lets procurement compare 6×500ml packs vs. 10L jugs in one query.
- ✅ **No value history table overhead**: `acquisition_value` lives directly on `product_variants`. The existing `history` decorator captures changes automatically without a new schema object.
- ✅ **Standard product concept cleanly removed**: No `standard_product_id` FK or associated lifecycle coupling.
- ✅ **Bundle abstraction is intuitive**: A box IS-A bundle of N identical variant items. The three quantity modes (count, measure, compound packaging) cover all real-world scenarios.

### Drawbacks

- ⚠️ **Large migration scope**: The `products → product_variants → boxes` refactor touches every consumer: API, frontend, statistics, shipments, distribution events. ~320–485 hours total.
- ⚠️ **GraphQL breaking changes**: All resolvers returning `Product` fields (`gender`, `sizeRange`) change shape. A deprecation and transition period is required.
- ⚠️ **ShipmentDetail complexity**: `source_product_id`/`target_product_id` must become `source_product_variant_id`/`target_product_variant_id`, affecting cross-base reconciliation UI.
- ⚠️ **Product creation flow is more complex**: Creating a product now requires at minimum one variant definition and one variant. A guided creation wizard is needed.
- ⚠️ **Two variants sharing one size range** (Toothbrushes): Two variants with different acquisition values but the same `size_range_id` is valid but slightly counterintuitive without documentation.

### Tradeoffs

- 🔄 **You gain** a clean, scalable model where gender and size are true orthogonal dimensions. **You sacrifice** ~6 months of development velocity during migration.
- 🔄 **You gain** correct size options per gender, enforced at DB level by `product_variant_definitions`. **You sacrifice** the simplicity of the existing single-product / single-size-range model.
- 🔄 **You gain** the reference unit concept enabling cross-format acquisition value comparison. **You sacrifice** a single canonical "price" field on the product (it is now per variant).
- 🔄 **You gain** a future-proof model where adding new product dimensions (condition, color) requires no schema change. **You sacrifice** simplicity: every box lookup now requires a JOIN through `product_variants`.

---

## Scenario 2: Least Expensive Extension

### ERD Diagram

> **Legend**: 🟢 NEW table/column, 🟡 MODIFIED column/behavior. All other entities are unchanged.

```mermaid
erDiagram
    PRODUCTS ||--o{ BOXES : "contains"
    PRODUCTS ||--o{ PRODUCT_ACQUISITION_LOG : "🟢 value_history"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "classifies"
    PRODUCT_GENDERS ||--o{ PRODUCTS : "gender"
    SIZE_RANGES ||--o{ PRODUCTS : "size_dimension"
    SIZE_RANGES ||--o{ SIZES : "contains"
    BOXES ||--o| SIZES : "discrete_size"
    BOXES ||--o| UNITS : "display_unit"
    BOXES ||--o| PACKAGE_SPECS : "🟢 packaging"
    BOXES ||--o| BOXES : "split_source"
    BOXES ||--|| QR_CODES : "identified_by"
    LOCATIONS ||--o{ BOXES : "stored_at"
    BOX_STATES ||--o{ BOXES : "status"

    PRODUCTS {
        int id PK
        int base_id FK
        int category_id FK
        int gender_id FK
        int size_range_id FK
        int standard_product_id FK "nullable"
        varchar name
        int price "distribution price (existing)"
        decimal acquisition_value "🟢 NEW DECIMAL(12,4) nullable"
        int in_shop
        text comment
        datetime deleted_on
    }

    PRODUCT_CATEGORIES {
        int id PK
        varchar name
        int parent_id FK
        bool is_gendered "🟢 NEW TINYINT(1) DEFAULT 1"
        int seq
    }

    BOXES {
        int id PK
        varchar label_identifier
        int product_id FK
        int size_id FK "nullable"
        int display_unit_id FK "nullable"
        decimal measure_value "nullable"
        int number_of_items "nullable"
        int package_spec_id FK "🟢 NEW nullable"
        date expiration_date "🟢 NEW nullable"
        decimal box_weight_kg "🟢 NEW nullable DECIMAL(8,3)"
        int location_id FK
        int state_id FK
        int qr_id FK "UNIQUE"
        int source_box_id FK "nullable self"
        text comment
        datetime created_on
        datetime deleted_on
    }

    PACKAGE_SPECS {
        int id PK "🟢 NEW TABLE"
        int outer_quantity
        int outer_unit_id FK
        decimal inner_quantity "DECIMAL(12,4)"
        int inner_unit_id FK
        datetime created_on
    }

    PRODUCT_ACQUISITION_LOG {
        int id PK "🟢 NEW TABLE"
        int product_id FK
        decimal acquisition_value "DECIMAL(12,4)"
        varchar currency "CHAR(3) ISO 4217"
        datetime effective_from
        datetime effective_to "nullable = current"
        int created_by FK
        datetime created_on
        text reason "nullable"
    }
```

### Data Structure Design

#### Philosophy: additive-only changes

Every existing column, table, and foreign key is preserved as-is. All new functionality is introduced by:

1. **Two new columns on `products`**: `acquisition_value` (monetary worth) and the `is_gendered` flag on `product_categories`.
2. **Three new columns on `stock`**: `package_spec_id`, `expiration_date`, `box_weight_kg`.
3. **Two new tables**: `package_specs` (compound packaging) and `product_acquisition_log` (value audit trail).

No renames. No column drops. No existing FK changes. Existing API resolvers need no changes for unrelated features.

#### Non-gendered aggregation (without restructuring)

Adding `is_gendered TINYINT(1)` to `product_categories` is sufficient to fix the statistics aggregation problem:

- In statistics queries, `GROUP BY gender` only when the product's category has `is_gendered = 1`.
- The existing `GenderProductFilter` in the statistics module gains an `is_gendered` check before applying gender grouping.
- No product data migration needed — the `gender_id` on products remains; it is simply ignored during aggregation for non-gendered categories.

#### Acquisition value placement

`acquisition_value` is placed on the `products` table as one price for the whole product (not per size/gender). This is the minimum viable approach:

- Products with different sizes that have radically different per-unit values can still be differentiated by creating separate product records per size (the current practice).
- A `product_acquisition_log` table records changes over time for the audit trail.
- If per-size acquisition value is later needed, `acquisition_value` can be added to a `product_sizes` table in a subsequent iteration.

### Sample Data Mappings

#### T-shirts: 20 pieces, size M, men's

No change from current structure:

```
products:  id=1, name="T-Shirt", gender_id=1 (Men), size_range_id=2 (S,M,L,XL),
           acquisition_value=2.50  ← NEW

stock:     id=100, product_id=1, size_id=5 (M), number_of_items=20,
           measure_value=NULL, display_unit_id=NULL, package_spec_id=NULL,
           expiration_date=NULL, box_weight_kg=NULL
```

#### Rice: 40 bags of 25 kg each

```
package_specs: id=1, outer_quantity=40, outer_unit_id=7 (bag),
               inner_quantity=25.0, inner_unit_id=1 (kg)

products:  id=50, name="Rice", gender_id=8 (NoGender), size_range_id=20 (Mass),
           acquisition_value=0.75    ← per kg

stock:     id=500, product_id=50, size_id=22 (Mixed), measure_value=1000.0,
           display_unit_id=1 (kg), number_of_items=40,
           package_spec_id=1,        ← NEW: links to package_specs
           expiration_date='2025-09-01',  ← NEW
           box_weight_kg=1000.3      ← NEW
```

#### Wet wipes: 112 packages, ~1344 items

```
package_specs: id=2, outer_quantity=112, outer_unit_id=8 (package),
               inner_quantity=12.0, inner_unit_id=9 (item)  -- nominal; actual varies

products:  id=51, name="Wet Wipes", gender_id=8 (NoGender),
           size_range_id=1 (OneSize), acquisition_value=1.20

stock:     id=501, product_id=51, size_id=3 (OneSize/Mixed), number_of_items=1344,
           package_spec_id=2,         ← nominal 12-per-package spec
           measure_value=NULL, display_unit_id=NULL,
           comment="112 packages, variable sizes (actual items counted: 1344)"
```

#### Second-hand clothing: 200 kg mixed sizes

No change from current structure (already supported via Mass SizeRange):

```
products:  id=2, name="Second-Hand Clothing (Mixed)", gender_id=9 (Mixed),
           size_range_id=3 (Mass), acquisition_value=0.50

stock:     id=101, product_id=2, size_id=22 (Mixed), measure_value=200.0,
           display_unit_id=1 (kg), number_of_items=NULL, package_spec_id=NULL
```

### Migration from Legacy

Migration is trivial because all existing data remains valid. The new columns are nullable, so no backfill is required for existing rows. Changes are purely additive:

```sql
-- LEGACY Box: fully valid after migration, all queries still work unchanged
stock: id=500, product_id=10, size_id=22, measure_value=1000, display_unit_id=1, items=NULL

-- NEW Box: same row, new columns default NULL - backward compatible
stock: id=500, product_id=10, size_id=22, measure_value=1000, display_unit_id=1, items=NULL,
       package_spec_id=NULL,    -- no packaging metadata yet (can be filled later)
       expiration_date=NULL,    -- no expiry known
       box_weight_kg=NULL       -- not yet recorded
```

For new boxes (rice, wet wipes), the application layer populates the new columns via updated API inputs; old mobile clients that don't send these fields will get NULL values.

#### Backfill strategy (optional, low priority)

```sql
-- Set is_gendered = 0 for non-apparel categories
UPDATE product_categories
SET is_gendered = 0
WHERE name IN ('Food', 'Hygiene', 'Toiletries', 'Medical', 'School Supplies',
               'Household Items', 'Cleaning Products');

-- acquisition_value can be backfilled from external spreadsheet import
-- No automated backfill needed; organizations enter values going forward
```

### Database Schema (Least Expensive — ALTER statements)

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. product_categories: add is_gendered flag
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `product_categories`
  ADD COLUMN `is_gendered` TINYINT(1) NOT NULL DEFAULT 1
  COMMENT 'When 0, gender dimension is ignored in statistics aggregation'
  AFTER `parent_id`;

-- Backfill known non-gendered categories (adjust IDs per environment)
UPDATE `product_categories` SET `is_gendered` = 0
WHERE `label` IN ('Food','Hygiene','Toiletries','Medical',
                  'Cleaning Products','Household Items','School Supplies');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. products: add acquisition_value
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `products`
  ADD COLUMN `acquisition_value` DECIMAL(12,4) DEFAULT NULL
  COMMENT 'Stock acquisition cost per ref unit (currency = base currency_name)'
  AFTER `value`;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. New table: package_specs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `package_specs` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `outer_quantity`  INT UNSIGNED NOT NULL
                    COMMENT 'Number of outer containers, e.g. 40',
  `outer_unit_id`   INT UNSIGNED NOT NULL
                    COMMENT 'FK to units - type of outer container, e.g. bag',
  `inner_quantity`  DECIMAL(12,4) NOT NULL
                    COMMENT 'Amount per container, e.g. 25.0',
  `inner_unit_id`   INT UNSIGNED NOT NULL
                    COMMENT 'FK to units - unit of inner content, e.g. kg',
  `created_on`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `outer_unit_id` (`outer_unit_id`),
  KEY `inner_unit_id` (`inner_unit_id`),
  CONSTRAINT `fk_ps_outer` FOREIGN KEY (`outer_unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `fk_ps_inner` FOREIGN KEY (`inner_unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Compound packaging specifications (e.g. 40 bags x 25kg)';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. stock: add package_spec_id, expiration_date, box_weight_kg
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `stock`
  ADD COLUMN `package_spec_id`  INT UNSIGNED DEFAULT NULL
    COMMENT 'FK to package_specs - compound packaging metadata'
    AFTER `source_box_id`,
  ADD COLUMN `expiration_date`  DATE DEFAULT NULL
    COMMENT 'Best-before or expiry date for perishables'
    AFTER `package_spec_id`,
  ADD COLUMN `box_weight_kg`    DECIMAL(8,3) DEFAULT NULL
    COMMENT 'Physical gross weight of box in kg (logistics)'
    AFTER `expiration_date`;

ALTER TABLE `stock`
  ADD KEY `package_spec_id` (`package_spec_id`),
  ADD KEY `expiration_date` (`expiration_date`),
  ADD CONSTRAINT `fk_stock_ps` FOREIGN KEY (`package_spec_id`)
    REFERENCES `package_specs` (`id`);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. New table: product_acquisition_log (financial audit trail)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `product_acquisition_log` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`        INT UNSIGNED NOT NULL,
  `acquisition_value` DECIMAL(12,4) DEFAULT NULL,
  `distribution_price` INT NOT NULL DEFAULT 0,
  `currency`          CHAR(3) NOT NULL DEFAULT 'EUR'
                      COMMENT 'ISO 4217 currency code',
  `effective_from`    DATETIME NOT NULL,
  `effective_to`      DATETIME DEFAULT NULL
                      COMMENT 'NULL indicates the current active row',
  `created_by`        INT UNSIGNED NOT NULL,
  `created_on`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason`            TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_effective` (`product_id`, `effective_from`),
  KEY `effective_to` (`effective_to`),
  CONSTRAINT `fk_pal_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Temporal log of acquisition value and distribution price changes';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Populate initial acquisition log rows for existing products with a value
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO `product_acquisition_log`
  (`product_id`, `acquisition_value`, `distribution_price`, `currency`,
   `effective_from`, `created_by`, `created_on`)
SELECT `id`, NULL, `value`, 'EUR', NOW(), 1, NOW()
FROM `products`
WHERE `deleted` IS NULL OR `deleted` = '0000-00-00 00:00:00';
-- Note: created_by=1 is a placeholder; use a system user ID
```

#### Indexing strategy

| Table | New index | Rationale |
|---|---|---|
| `stock` | `expiration_date` | Alert queries ("expires within 30 days") |
| `stock` | `package_spec_id` | Package metadata joins |
| `product_acquisition_log` | `(product_id, effective_from)` | Point-in-time lookup |
| `product_categories` | *(no new index needed)* | Small table, full scan acceptable |

### Implementation Effort (Scenario 2)

```
Backend Changes:
- Modified models: 2 (Box: 3 new fields; Product: 1 new field)
- New models: 2 (PackageSpec, ProductAcquisitionLog)
- Modified ProductCategory model: 1 new field + logic in statistics resolvers
- New/modified GraphQL types: 2 new (PackageSpec, ProductAcquisitionLog),
  2 modified (Box type + BoxCreationInput/BoxUpdateInput, Product type)
- New GraphQL resolvers: 3 (packageSpec CRUD, productAcquisitionLog query)
- Modified GraphQL resolvers: 4 (box create/update to accept new fields,
  product create/edit to accept acquisition_value, statistics to use is_gendered)
- Modified business logic modules: 2 (box service for new fields, stats aggregation)
Backend estimated hours: 30–50  (confidence: high)

Frontend Changes:
- Modified components: BoxCreate (add expiration date + weight inputs),
  BoxEdit (same), BoxesFilter (add expiry filter), ProductsContainer
  (show acquisition value), CreateCustomProductForm (add acquisition value input)
  (~5 files)
- New components: PackageSpecInput (compound packaging form control) (~1 component)
- Updated GraphQL queries/fragments: ~8 files
Frontend estimated hours: 25–45  (confidence: high)

Migration:
- Migration scripts needed: 2 (5 ALTER statements + 2 CREATE TABLE, grouped into
  one forward migration; plus category backfill script)
- Estimated downtime: < 5 min (all ALTERs are ADD COLUMN on existing tables;
  MySQL instant ADD COLUMN for InnoDB in 8.0+)
- Rollback complexity: LOW – DROP COLUMN + DROP TABLE; no data transformation
Migration estimated hours: 5–10  (confidence: high)

Testing & QA:
- Backend test updates: ~15 hours
- Frontend test updates: ~10 hours
- Manual QA: ~5 hours
Testing estimated hours: 20–30  (confidence: high)

TOTAL: 80–135 hours
```

### Advantages

- ✅ **Minimal risk**: All changes are additive. Every existing API call, frontend query, and mobile client continues to work unchanged. New fields are nullable with sensible defaults.
- ✅ **Fast delivery**: ~80–135 hours versus ~360–540 hours. New functionality can ship within one sprint.
- ✅ **Zero data migration risk**: No existing rows are modified; rollback is `DROP COLUMN / DROP TABLE`.
- ✅ **Preserves all existing authorization patterns**: All product/box access is still scoped to `base_id`; no new scope checks needed.
- ✅ **Compound units in a clean structure**: `package_specs` is a proper relational table, not a JSON blob or concatenated string. It is queryable and extensible.

### Drawbacks

- ⚠️ **Gender-product coupling persists**: Gender remains on Product rather than Box. The aggregation fix (`is_gendered` on category) is pragmatic but not architecturally clean. Products with the same name but different genders (e.g., "T-Shirt Men" vs. "T-Shirt Women") remain as separate product rows.
- ⚠️ **Acquisition value is product-wide, not per-size**: A men's XL t-shirt and a men's S t-shirt have the same `acquisition_value`. Edge cases requiring per-size pricing cannot be served without further extension.
- ⚠️ **"Mixed" size UX confusion not resolved**: The "Mixed" size in every SizeRange is still present. Addressed by UX filtering rules, not schema changes.
- ⚠️ **Accrues technical debt**: The `gender_id` on products becomes progressively more awkward as non-apparel products grow. Scenario 1 will still need to be executed eventually.
- ⚠️ **Standard product versioning unchanged**: The `deprecated_on` / `preceded_by_product` lifecycle complexity on `StandardProduct` is not addressed.

### Tradeoffs

- 🔄 **You gain** working features this sprint. **You sacrifice** a clean data model that may require a larger refactor in 1–2 years.
- 🔄 **You gain** zero migration risk. **You sacrifice** the ability to record acquisition value per size/gender variant without another schema change.
- 🔄 **You gain** backwards-compatible GraphQL. **You sacrifice** the architectural opportunity to decouple gender from products while the codebase is still relatively small.

---

## Scenario 3: Targeted Gender-Decoupled Extension

> **Built on top of Scenario 2.** All additive changes from Scenario 2 are included. Two additional structural changes are applied: (a) gender is moved from a mandatory product attribute to an optional box-level attribute, and (b) the `product_acquisition_log` table is omitted — acquisition value history is derived from the existing `history` table.
>
> **Note on `hasGender` vs `is_gendered`:** The backend already exposes a `ProductCategory.hasGender: Boolean!` GraphQL field, currently implemented as a computed property (`parent_id == 12`). Scenario 3 replaces this hardcoded derivation with an actual `is_gendered TINYINT(1)` DB column, allowing category-level gender applicability to be queryable in SQL, overridable per category, and extensible without code changes.

### ERD Diagram

> **Legend**: 🟢 NEW table/column (includes all Scenario 2 additions), 🟡 MODIFIED column, 🔴 REMOVED constraint. All other entities are unchanged.

```mermaid
erDiagram
    PRODUCTS ||--o{ BOXES : "contains"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "classifies"
    PRODUCT_GENDERS |o--o{ PRODUCTS : "🟡 now nullable defaultGender"
    PRODUCT_GENDERS |o--o{ BOXES : "🟢 box-level gender"
    PRODUCTS ||--o{ PRODUCT_GENDER_SIZE_RANGES : "🟢 per-gender size mapping"
    PRODUCT_GENDERS |o--o{ PRODUCT_GENDER_SIZE_RANGES : "🟢 gender dimension"
    SIZE_RANGES ||--o{ PRODUCT_GENDER_SIZE_RANGES : "🟢 size range per gender"
    SIZE_RANGES ||--o{ SIZES : "contains"
    BOXES ||--o| SIZES : "discrete_size"
    BOXES ||--o| UNITS : "display_unit"
    BOXES ||--o| PACKAGE_SPECS : "🟢 packaging"
    BOXES ||--o| BOXES : "split_source"
    BOXES ||--|| QR_CODES : "identified_by"
    LOCATIONS ||--o{ BOXES : "stored_at"
    BOX_STATES ||--o{ BOXES : "status"
    PRODUCTS ||--o{ HISTORY : "🟡 acquisition_value via history"
    PRODUCT_GENDERS |o--o{ SHIPMENT_DETAILS : "🟢 source_gender"
    PRODUCT_GENDERS |o--o{ SHIPMENT_DETAILS : "🟢 target_gender"

    PRODUCTS {
        int id PK
        int base_id FK
        int category_id FK
        int gender_id FK "🟡 NOW NULLABLE - defaultGender, no sentinel"
        int standard_product_id FK "nullable"
        varchar name
        int price "distribution price"
        decimal acquisition_value "🟢 NEW DECIMAL(12,4) nullable"
        int in_shop
        text comment
        datetime deleted_on
    }

    PRODUCT_GENDER_SIZE_RANGES {
        int id PK "🟢 NEW TABLE"
        int product_id FK
        int gender_id FK "nullable = fallback / ungendered"
        int size_range_id FK
    }

    PRODUCT_CATEGORIES {
        int id PK
        varchar name
        int parent_id FK
        tinyint is_gendered "🟢 NEW TINYINT(1) DEFAULT 1 (backs hasGender field)"
        int seq
    }

    BOXES {
        int id PK
        varchar label_identifier
        int product_id FK
        int gender_id FK "🟢 NEW nullable - box-level gender"
        int size_id FK "nullable"
        int display_unit_id FK "nullable"
        decimal measure_value "nullable"
        int number_of_items "nullable"
        int package_spec_id FK "🟢 NEW nullable"
        date expiration_date "🟢 NEW nullable"
        decimal box_weight_kg "🟢 NEW nullable DECIMAL(8,3)"
        int location_id FK
        int state_id FK
        int qr_id FK "UNIQUE"
        int source_box_id FK "nullable self"
        text comment
        datetime created_on
        datetime deleted_on
    }

    PACKAGE_SPECS {
        int id PK "🟢 NEW TABLE"
        int outer_quantity
        int outer_unit_id FK
        decimal inner_quantity "DECIMAL(12,4)"
        int inner_unit_id FK
        datetime created_on
    }

    HISTORY {
        int id PK
        varchar tablename
        int record_id
        text changes "column name e.g. acquisition_value"
        int user_id FK
        varchar ip
        datetime changedate
        int from_int
        int to_int
        float from_float "previous acquisition_value"
        float to_float "new acquisition_value"
    }

    SHIPMENT_DETAILS {
        int id PK
        int shipment_id FK
        int box_id FK
        int source_product_id FK
        int target_product_id FK "nullable"
        int source_gender_id FK "🟢 NEW nullable"
        int target_gender_id FK "🟢 NEW nullable"
        int source_size_id FK "nullable"
        int target_size_id FK "nullable"
        int source_quantity
        int target_quantity "nullable"
        datetime created_on
        datetime removed_on "nullable"
        datetime lost_on "nullable"
        datetime received_on "nullable"
    }
```

### Data Structure Design

#### Core Concept: Gender as a Box-Level Attribute

The key structural change in Scenario 3 is moving gender from a mandatory, non-nullable attribute of `products` to an optional attribute of `stock` (boxes). This decoupling has three concrete effects:

1. **Products become gender-neutral definitions.** A product named "T-Shirt" is created once without a required gender. The product's `gender_id` becomes nullable — it may still be set as a `defaultGender` (coordinator's convenience for pre-filling the box form), but it is no longer the authoritative source.

2. **Boxes carry gender as an optional inventory attribute.** When creating a box of T-Shirts, the coordinator specifies the gender (Men, Women, etc.) on the box itself. For food or hygiene products, `stock.gender_id` is NULL and `products.gender_id` is NULL — no sentinel `NoGender` row required.

3. **Effective gender resolution.** Anywhere the system needs a box's gender — statistics aggregations, shipment reconciliation, filter queries — it uses:
   ```sql
   COALESCE(stock.gender_id, products.gender_id)
   ```
   Box-level gender takes precedence; if absent, the product-level default gender acts as a fallback. This provides full backwards compatibility: existing products with `gender_id` set continue to work without any data migration.

#### Required: `product_gender_size_ranges` Junction Table

The `sizegroup` table (ORM: `SizeRange`) has **no `gender_id` column**. Instead, separate sizegroup rows already encode gender semantics by naming convention:

| sizegroup.id | label | sizes |
|---|---|---|
| 3 | Shoe sizes Female | 34, 35, 36, 37, 38, 39, 40, 41, "42+" |
| 8 | Shoe sizes Male | "38-", 39, 40, 41, 42, 43, 44, 45, "46+" |
| 9 | Shoe sizes children | 20–36+ |

Currently this is encoded in the product rows: `products("Shoes Men", gender_id=2, size_range_id=8)` and `products("Shoes Women", gender_id=1, size_range_id=3)`. After merging these into a single "Shoes" product, the link between gender and the correct size range would be lost.

The `product_gender_size_ranges` junction table preserves this mapping explicitly:

```sql
CREATE TABLE `product_gender_size_ranges` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`    INT UNSIGNED NOT NULL,
  `gender_id`     INT UNSIGNED DEFAULT NULL  -- NULL = default / ungendered
                  COMMENT 'NULL row is the fallback when no gender matches',
  `size_range_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_product_gender` (`product_id`, `gender_id`),
  FOREIGN KEY (`product_id`)    REFERENCES `products`(`id`),
  FOREIGN KEY (`gender_id`)     REFERENCES `genders`(`id`)  ON UPDATE CASCADE,
  FOREIGN KEY (`size_range_id`) REFERENCES `sizegroup`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;
```

**Size-range resolution logic (used by BoxCreate/BoxEdit):**

```sql
-- Returns the most specific size range for a (product, gender) combination.
-- Exact gender match takes priority; NULL row is the fallback.
SELECT pgsr.size_range_id
FROM product_gender_size_ranges pgsr
WHERE pgsr.product_id = :product_id
  AND (pgsr.gender_id = :box_gender_id OR pgsr.gender_id IS NULL)
ORDER BY pgsr.gender_id IS NULL ASC   -- exact match first
LIMIT 1;
```

**Backfill migration** — every existing product maps to exactly one row:

```sql
INSERT INTO product_gender_size_ranges (product_id, gender_id, size_range_id)
SELECT id, gender_id, size_range_id FROM products WHERE deleted_on IS NULL;
```

After backfill, `products.size_range_id` is kept as a legacy column (not dropped) to avoid foreign key cascade complexity; it can be deprecated at leisure.

**GraphQL API change:**

```graphql
type Product {
  defaultGender: ProductGender           # was: gender (nullable)
  sizeRanges: [ProductGenderSizeRange!]! # NEW: replaces single sizeRange
  sizeRange: SizeRange                   # kept for backwards compat; returns fallback row
}

type ProductGenderSizeRange {
  gender: ProductGender   # null = default/ungendered
  sizeRange: SizeRange!
}
```

#### `product_categories.is_gendered` — Backing the existing `hasGender` field

The backend already exposes `ProductCategory.hasGender: Boolean!` via this resolver:

```python
@product_category.field("hasGender")
def resolve_product_category_has_gender(product_category_obj, _):
    return product_category_obj.parent_id == 12   # hardcoded to Clothing subtree
```

Scenario 3 replaces the hardcoded `parent_id == 12` with a real DB column `is_gendered TINYINT(1)`. The resolver body becomes `return product_category_obj.is_gendered`. The GraphQL field name `hasGender` is unchanged — this is a purely internal refactor.

**Why a DB column matters:**

- Statistics SQL queries can `JOIN product_categories ON pc.is_gendered = 1` to exclude non-gendered rows from gender aggregations, instead of post-processing a NoGender sentinel group.
- BoxCreate/BoxEdit can hide the gender selector for food/hygiene products using `category.hasGender` without a hardcoded client-side mapping.
- `GenderProductFilter` (statistics) can be hidden automatically when all queried categories have `is_gendered = 0`.
- New categories (e.g. "Sporting Goods") can be flagged `is_gendered = 1` with a data change, not a code change.

**Backfill migration:**

```sql
ALTER TABLE product_categories ADD COLUMN is_gendered TINYINT(1) NOT NULL DEFAULT 0;
-- Set all existing clothing subcategories (parent_id=12) as gendered:
UPDATE product_categories SET is_gendered = 1 WHERE parent_id = 12;
```

#### Acquisition Value History via the Existing `history` Table

Boxtribute already maintains a generic `history` table (`DbChangeHistory` ORM model) that records field-level changes to any table. The existing `save_update_to_history` decorator (already wrapping `edit_custom_product`, tracking `Product.gender`, `Product.name`, etc.) automatically writes a `history` row on every change. No new code is needed for the audit trail mechanism — only `acquisition_value` needs to be added to the tracked fields list.

```python
@save_update_to_history(
    fields=[
        Product.category,
        Product.size_range,
        Product.gender,
        Product.name,
        Product.price,
        Product.comment,
        Product.in_shop,
        Product.acquisition_value,   # ADD: tracked automatically via decorator
    ]
)
def edit_custom_product(...): ...
```

Query the audit trail:

```sql
SELECT changedate, from_float AS previous_value, to_float AS new_value, user_id
FROM history
WHERE tablename = 'products'
  AND record_id = :product_id
  AND changes = 'acquisition_value'
ORDER BY changedate;
```

**Precision note**: `history.from_float`/`to_float` are MySQL `FLOAT` (single-precision, ~7 significant digits). For acquisition values such as €0.75/kg or €1.20/item this is fully adequate. The limitation versus `DECIMAL(12,4)` is relevant only for values requiring more than 7 significant digits, which is not a realistic humanitarian-aid use case.

#### ShipmentDetail Gender Tracking

When a box is added to a shipment, the `source_gender_id` is captured as a snapshot in `shipment_detail` (mirroring the existing `source_size_id`/`target_size_id` pattern). This prevents ambiguity if a box's gender attribute is later edited and maintains a complete picture of what was sent vs. received. In the reconciliation UI (`MatchProductsForm`), the currently combined "Sender Product & Gender" block is split into separate "Sender Product" and "Sender Gender" fields, and a `targetGender` selector is added for the receiving base — exactly mirroring the existing `targetProduct` selector pattern.

For pre-migration shipments, `sourceGender` is NULL; the UI falls back to `sourceProduct.defaultGender` transparently.

### Sample Data Mappings

#### T-shirts: 20 pieces, size M, men's

Gender moves from the product to the box:

```
product_gender_size_ranges: (product_id=1, gender_id=NULL, size_range_id=1)
  -- T-Shirt uses XS–XXL for all genders; one fallback row is enough

products:  id=1, name="T-Shirt", gender_id=NULL,  ← no longer coupled
           category_id=3 (Tops), acquisition_value=2.50

stock:     id=100, product_id=1,
           gender_id=2 (Men),       ← NEW: gender at box level
           size_id=5 (M), number_of_items=20,
           measure_value=NULL, display_unit_id=NULL,
           package_spec_id=NULL, expiration_date=NULL, box_weight_kg=NULL
```

#### Shoes: 1 pair, size 42, men's

The per-gender size range mapping is now explicit:

```
product_gender_size_ranges: (product_id=10, gender_id=1 [Female], size_range_id=3)
                            (product_id=10, gender_id=2 [Male],   size_range_id=8)
                            (product_id=10, gender_id=6 [Kid],    size_range_id=9)

products:  id=10, name="Shoes", gender_id=NULL,   ← no longer coupled
           category_id=5 (Shoes), acquisition_value=5.00

stock:     id=102, product_id=10,
           gender_id=2 (Men),       ← box-level gender
           size_id=60 (42),         ← resolved via size range for Male (sizegroup 8)
           number_of_items=1
```

When BoxCreate loads this product with gender "Men" selected, the size options come from sizegroup 8 (Male shoe sizes 38–46). With gender "Women" selected, options come from sizegroup 3 (34–42). The `product_gender_size_ranges` table drives this lookup.

#### Rice: 40 bags of 25 kg each

No gender at either level — no sentinel row needed:

```
package_specs: id=1, outer_quantity=40, outer_unit_id=7 (bag),
               inner_quantity=25.0, inner_unit_id=1 (kg)

products:  id=50, name="Rice", gender_id=NULL,   ← truly no gender
           category_id=4 (Food), size_range_id=20 (Mass),
           acquisition_value=0.75

stock:     id=500, product_id=50,
           gender_id=NULL,           ← no gender
           size_id=22 (Mixed), measure_value=1000.0,
           display_unit_id=1 (kg), number_of_items=40,
           package_spec_id=1,
           expiration_date='2025-09-01', box_weight_kg=1000.3
```

#### Wet wipes: 112 packages, ~1344 items

```
package_specs: id=2, outer_quantity=112, outer_unit_id=8 (package),
               inner_quantity=12.0, inner_unit_id=9 (item)

products:  id=51, name="Wet Wipes", gender_id=NULL,
           category_id=5 (Hygiene), acquisition_value=1.20

stock:     id=501, product_id=51, gender_id=NULL,
           package_spec_id=2, number_of_items=1344,
           comment="112 packages, variable sizes (actual items counted: 1344)"
```

#### Second-hand clothing: 200 kg mixed sizes

Gender remains meaningful at box level:

```
products:  id=2, name="Second-Hand Clothing (Mixed)",
           gender_id=NULL,           ← or set to 3 (UnisexAdult) as product default
           size_range_id=3 (Mass), acquisition_value=0.50

stock:     id=101, product_id=2,
           gender_id=3 (UnisexAdult),  ← explicit at box level
           size_id=22 (Mixed), measure_value=200.0,
           display_unit_id=1 (kg)
```

### Migration from Legacy

#### Complete legacy-to-Scenario-3 transformation

```
-- LEGACY Product (gender tightly coupled, sentinel NoGender):
products: id=50, name="Rice", gender_id=10 (-/NoGender), size_range_id=20,
          value=0, camp_id=3

-- NEW Product (nullable gender, acquisition value added):
products: id=50, name="Rice", gender_id=NULL,   ← 10 → NULL
          size_range_id=20, value=0, acquisition_value=0.75, camp_id=3

---

-- LEGACY Box (gender comes only from product):
stock: id=500, product_id=50, size_id=22 (Mixed), measure_value=1000,
       display_unit_id=1 (kg), items=NULL

-- NEW Box (gender on box; NULL because food has no gender):
stock: id=500, product_id=50,
       gender_id=NULL,              ← no gender on box or product
       size_id=22 (Mixed), measure_value=1000,
       display_unit_id=1 (kg), items=NULL,
       package_spec_id=NULL, expiration_date=NULL, box_weight_kg=NULL
```

#### Migration steps

All schema changes are additive except making `gender_id` nullable. No row deletions are required. Steps 1–2 are the forward migration script; steps 3–5 are optional data cleanup that can run as background jobs.

**Step 1 — Schema changes** (single migration script, < 5 min):
```sql
-- Scenario 2 changes first (acquisition_value, package_specs, is_gendered on categories,
-- expiration_date, box_weight_kg, package_spec_id on stock)

-- S3: Make products.gender_id nullable
ALTER TABLE products MODIFY COLUMN gender_id INT UNSIGNED DEFAULT NULL;

-- S3: Add is_gendered to product_categories (backs hasGender GraphQL field)
ALTER TABLE product_categories ADD COLUMN is_gendered TINYINT(1) NOT NULL DEFAULT 0;
UPDATE product_categories SET is_gendered = 1 WHERE parent_id = 12;

-- S3: Create product_gender_size_ranges junction table
CREATE TABLE product_gender_size_ranges (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id    INT UNSIGNED NOT NULL,
  gender_id     INT UNSIGNED DEFAULT NULL,
  size_range_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_product_gender (product_id, gender_id),
  FOREIGN KEY (product_id)    REFERENCES products(id)  ON UPDATE CASCADE,
  FOREIGN KEY (gender_id)     REFERENCES genders(id)   ON UPDATE CASCADE,
  FOREIGN KEY (size_range_id) REFERENCES sizegroup(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Backfill from existing products (one row per product)
INSERT INTO product_gender_size_ranges (product_id, gender_id, size_range_id)
SELECT id, gender_id, size_range_id FROM products WHERE deleted_on IS NULL;

-- S3: Add gender_id to stock (box level)
ALTER TABLE stock ADD COLUMN gender_id INT UNSIGNED DEFAULT NULL AFTER product_id;
ALTER TABLE stock ADD KEY gender_id (gender_id);
ALTER TABLE stock ADD CONSTRAINT fk_stock_gender FOREIGN KEY (gender_id) REFERENCES genders(id);

-- S3: Add gender columns to shipment_detail
ALTER TABLE shipment_detail
  ADD COLUMN source_gender_id INT UNSIGNED DEFAULT NULL,
  ADD COLUMN target_gender_id INT UNSIGNED DEFAULT NULL;
ALTER TABLE shipment_detail
  ADD KEY source_gender_id (source_gender_id),
  ADD KEY target_gender_id (target_gender_id),
  ADD CONSTRAINT fk_sd_src_gender FOREIGN KEY (source_gender_id) REFERENCES genders(id),
  ADD CONSTRAINT fk_sd_tgt_gender FOREIGN KEY (target_gender_id) REFERENCES genders(id);
```

**Step 2 — Data backfill of NoGender sentinel** (optional, zero-risk):
```sql
-- Remove the NoGender sentinel (id=10, label='-') from products
-- that have it set. These products genuinely have no gender.
UPDATE products SET gender_id = NULL
WHERE gender_id = 10;  -- id 10 = '-' (NoGender sentinel row)
```
This is optional but strongly recommended to clean up existing data. It has no effect on any FK or query — the COALESCE logic handles NULL correctly.

**Step 3 — Populate box-level gender from product** (optional, gradual):
```sql
-- For existing boxes whose product has a non-null gender, copy it to box level.
-- This makes gender explicit at box level for old data.
-- Run as a background job to avoid locking.
UPDATE stock s
JOIN products p ON s.product_id = p.id
SET s.gender_id = p.gender_id
WHERE s.gender_id IS NULL AND p.gender_id IS NOT NULL;
```
This step is **optional and can be deferred**. The COALESCE fallback means old boxes without `stock.gender_id` continue to use their product's gender correctly.

**Step 4 — Product consolidation** (optional, application-driven):
For cases where the same item exists as separate gendered products (e.g. "T-Shirt Men" id=1 and "T-Shirt Women" id=2), they can be merged into a single "T-Shirt" product over time:
- Create new product "T-Shirt" with `gender_id=NULL`
- Re-assign boxes: `UPDATE stock SET product_id=<new_id>, gender_id=<original_gender> WHERE product_id IN (1,2)`
- Soft-delete old products: `UPDATE products SET deleted=NOW() WHERE id IN (1,2)`
This is entirely optional and can happen product-by-product at the organisation's pace.

### Database Schema (Scenario 3 — ALTER statements)

All Scenario 2 ALTERs apply first. Scenario 3 adds the following:

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- S3-1. Back product_categories.hasGender with a real DB column
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `product_categories`
  ADD COLUMN `is_gendered` TINYINT(1) NOT NULL DEFAULT 0
  COMMENT 'Backs the hasGender GraphQL field; replaces hardcoded parent_id==12 check';

-- Seed: all Clothing subcategories (parent_id=12) are gendered
UPDATE `product_categories` SET `is_gendered` = 1 WHERE `parent_id` = 12;

-- ─────────────────────────────────────────────────────────────────────────────
-- S3-2. Remove NOT NULL constraint from products.gender_id
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `products`
  MODIFY COLUMN `gender_id` INT UNSIGNED DEFAULT NULL
  COMMENT 'Optional defaultGender; NULL for non-gendered products (food, hygiene)';

-- Recommended: clear NoGender sentinel (genders.id=10, label="-")
UPDATE `products` SET `gender_id` = NULL WHERE `gender_id` = 10;

-- ─────────────────────────────────────────────────────────────────────────────
-- S3-3. Create product_gender_size_ranges junction table
--       Maps each (product, gender) pair to the correct size range.
--       gender_id = NULL means "default / ungendered" (fallback row).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `product_gender_size_ranges` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`    INT UNSIGNED NOT NULL,
  `gender_id`     INT UNSIGNED DEFAULT NULL
                  COMMENT 'NULL = fallback row used when no gender-specific row exists',
  `size_range_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_product_gender` (`product_id`, `gender_id`),
  KEY `size_range_id` (`size_range_id`),
  CONSTRAINT `fk_pgsr_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pgsr_gender`
    FOREIGN KEY (`gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pgsr_sizerange`
    FOREIGN KEY (`size_range_id`) REFERENCES `sizegroup` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Backfill: every existing product maps to exactly one row
INSERT INTO `product_gender_size_ranges` (`product_id`, `gender_id`, `size_range_id`)
SELECT `id`, `gender_id`, `size_range_id`
FROM `products`
WHERE `deleted_on` IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- S3-4. Add gender_id to stock (box-level gender)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `stock`
  ADD COLUMN `gender_id` INT UNSIGNED DEFAULT NULL
  COMMENT 'Box-level gender; takes precedence over products.gender_id via COALESCE'
  AFTER `product_id`;

ALTER TABLE `stock`
  ADD KEY `gender_id` (`gender_id`),
  ADD CONSTRAINT `fk_stock_gender`
    FOREIGN KEY (`gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- S3-5. Add gender snapshot columns to shipment_detail
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `shipment_detail`
  ADD COLUMN `source_gender_id` INT UNSIGNED DEFAULT NULL
    COMMENT 'Gender of box at time of shipment creation (COALESCE snapshot)'
    AFTER `source_size_id`,
  ADD COLUMN `target_gender_id` INT UNSIGNED DEFAULT NULL
    COMMENT 'Gender assigned at receiving base'
    AFTER `target_size_id`;

ALTER TABLE `shipment_detail`
  ADD KEY `source_gender_id` (`source_gender_id`),
  ADD KEY `target_gender_id` (`target_gender_id`),
  ADD CONSTRAINT `fk_sd_src_gender`
    FOREIGN KEY (`source_gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sd_tgt_gender`
    FOREIGN KEY (`target_gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- S3-6. Acquisition value change tracking: no new table needed.
--       Add acquisition_value to the fields tracked by save_update_to_history.
--       Example query to retrieve history for a product:
--   SELECT changedate, from_float AS previous_value, to_float AS new_value, user_id
--   FROM history
--   WHERE tablename = 'products'
--     AND record_id = :product_id
--     AND changes = 'acquisition_value'
--   ORDER BY changedate;
-- ─────────────────────────────────────────────────────────────────────────────
```

#### Indexing strategy

Inherits all Scenario 2 indexes, plus:

| Table | New index | Rationale |
|---|---|---|
| `product_gender_size_ranges` | `(product_id, gender_id)` UNIQUE | Size range lookup by (product, gender) |
| `stock` | `gender_id` | Box-level gender filter in statistics and box listing |
| `stock` | `(product_id, gender_id, state_id)` | Composite for aggregation queries |
| `shipment_detail` | `source_gender_id`, `target_gender_id` | Reconciliation queries by gender |

#### GraphQL schema evolution

```graphql
# Product.gender renamed to defaultGender (nullable)
type Product {
  defaultGender: ProductGender          # was: gender
  sizeRanges: [ProductGenderSizeRange!]! # NEW: replaces single sizeRange
  sizeRange: SizeRange                   # kept for backwards compat; returns fallback row
  acquisitionValue: Float                # NEW
  acquisitionValueHistory: [AcquisitionValueHistoryEntry!]!  # NEW - from history table
}

type ProductGenderSizeRange {
  gender: ProductGender   # null = default/ungendered fallback
  sizeRange: SizeRange!
}

# New type for history-derived acquisition value entries
type AcquisitionValueHistoryEntry {
  changeDate: Datetime!
  previousValue: Float           # from_float; null for the initial creation entry
  newValue: Float                # to_float
  changedBy: User
}

# Box gains an explicit gender field
type Box implements ItemsCollection {
  gender: ProductGender          # NEW nullable - box-level gender
  # ... all other fields unchanged (Scenario 2 additions included)
}

# Box creation and update inputs gain optional genderId
input BoxCreationInput {
  genderId: Int                  # NEW optional
  # ... all other fields unchanged
}

input BoxUpdateInput {
  genderId: Int                  # NEW optional
  # ... all other fields unchanged
}

# Product creation/edit: gender renamed to defaultGender, now optional
input CustomProductCreationInput {
  defaultGender: ProductGender   # was: gender: ProductGender! (required)
  genderSizeRanges: [ProductGenderSizeRangeInput!]!  # replaces sizeRangeId
  # ... all other fields unchanged
}

input ProductGenderSizeRangeInput {
  genderId: Int       # null = fallback / ungendered
  sizeRangeId: Int!
}

# ShipmentDetail gains gender snapshots
type ShipmentDetail {
  sourceGender: ProductGender    # NEW nullable snapshot
  targetGender: ProductGender    # NEW nullable
  # ... all other fields unchanged
}

# Existing filter continues to work; backend now checks COALESCE(stock.gender_id, products.gender_id)
input FilterBoxInput {
  productGender: ProductGender   # unchanged; semantics extended to cover box-level gender
  # ... all other filters unchanged
}
```

### Implementation Effort (Scenario 3) — Four Independent Packages

Scenario 3 decomposes naturally into four packages that can be implemented, tested, and shipped independently in any order. Package 2 (gender decoupling) is the largest; the remaining three are one-sprint deliverables.

#### Package 1 — Acquisition Value Tracking

*Schema:* `products.acquisition_value DECIMAL(12,4) DEFAULT NULL`; no new table. The `save_update_to_history` decorator already wrapping `edit_custom_product` automatically produces `history` rows — adding `Product.acquisition_value` to the tracked-fields list is the only change to the audit mechanism.

| Area | Work items | Hours |
|---|---|---|
| BE | ALTER TABLE; ORM field; `acquisitionValue` GraphQL field; `acquisitionValueHistory` resolver (SQL query on `history` table); update `create_custom_product` + `edit_custom_product` inputs | 10–14 |
| FE | Optional numeric input in CreateCustomProductForm and EditProduct; product list display; fragment update; `acquisitionValueHistory` lazy query | 8–12 |
| Testing | BE: unit + endpoint tests for new field and history query; FE: form validation tests | 5–8 |
| **Package 1 total** | | **23–34 h** |

#### Package 2 — Gender Decoupling

This package includes the `product_gender_size_ranges` junction table, which is a **required addition** — without it, gendered size ranges (shoe sizes, bra sizes) would be silently broken after product consolidation.

| Area | Work items | Hours |
|---|---|---|
| BE schema | `products.gender_id` → nullable; `stock.gender_id` nullable FK; `shipment_detail.source_gender_id`/`target_gender_id`; new `product_gender_size_ranges` table; `product_categories.is_gendered` column; backfill migrations | 10–14 |
| BE logic | `create_custom_product`/`edit_custom_product`: `gender` → `defaultGender` optional; `enable_standard_product`/`enable_standard_products`: nullable gender copy; `Product.sizeRanges` resolver (queries `product_gender_size_ranges`); statistics SQL × 8: `p.gender_id` → `COALESCE(s.gender_id, p.gender_id)`; `derive_box_filter` COALESCE condition; `create_box`/`update_box`: accept+store `stock.gender_id`; shipment detail creation: capture `source_gender_id` from `COALESCE(stock.gender_id, product.gender_id)`; `hasGender` resolver: `parent_id == 12` → `is_gendered` column | 20–28 |
| BE GraphQL | `Product.gender` → `Product.defaultGender` nullable; add `Product.sizeRanges: [ProductGenderSizeRange!]!`; `Box.gender`; `BoxCreationInput.genderId`; `BoxUpdateInput.genderId`; `ShipmentDetail.sourceGender`/`targetGender`; `CustomProductCreationInput`/`EditInput` updated; `FilterBoxInput.productGender` semantics updated | 8–12 |
| FE | BoxCreate: add gender selector, dynamic size-range loading via `sizeRanges`; BoxEdit: same; BoxReconciliation `MatchProductsForm`: split "Sender Product & Gender" block, add `targetGender` selector; `ShipmentReceivingTable`: read `sourceGender`; `CreateCustomProductForm`: gender → `defaultGender` optional, hidden when `!category.hasGender`, per-gender size range inputs; fragment updates | 28–38 |
| Testing | BE: product CRUD, statistics query, shipment detail, filter, `product_gender_size_ranges` lookup; FE: BoxCreate/BoxEdit gender × size interaction, reconciliation flow | 18–25 |
| **Package 2 total** | | **84–117 h** |

#### Package 3 — Package Specifications for Boxes

*Schema:* New `package_specs` table; `stock.package_spec_id INT UNSIGNED DEFAULT NULL FK`.

| Area | Work items | Hours |
|---|---|---|
| BE | CREATE TABLE migration; ORM model; `PackageSpec` GraphQL type; `createPackageSpec` mutation resolver; `BoxCreationInput.packageSpecId`, `BoxUpdateInput.packageSpecId`; `Box.packageSpec` field resolver | 12–16 |
| FE | PackageSpec compound input widget in BoxCreate/BoxEdit (outer qty + unit, inner qty + unit); fragment update; populate units dropdown | 10–14 |
| Testing | BE: CRUD tests, Box mutation tests; FE: form validation | 6–9 |
| **Package 3 total** | | **28–39 h** |

#### Package 4 — New Box Attributes (Expiration Date, Box Weight)

*Schema:* `stock.expiration_date DATE DEFAULT NULL`; `stock.box_weight_kg DECIMAL(8,3) DEFAULT NULL`.

| Area | Work items | Hours |
|---|---|---|
| BE | ALTER TABLE migration; ORM fields; `Box.expirationDate`, `Box.boxWeightKg` GraphQL fields; `BoxCreationInput`/`BoxUpdateInput` updates; optional `FilterBoxInput.expirationDateFrom/Until` | 8–12 |
| FE | Date picker for expiration + numeric weight input in BoxCreate/BoxEdit; optional filter UI in BoxesFilter | 8–12 |
| Testing | BE: Box mutation tests; FE: form validation | 5–7 |
| **Package 4 total** | | **21–31 h** |

#### Combined Scenario 3 Effort

| Package | BE | FE | Testing | Total |
|---|---|---|---|---|
| 1 — Acquisition value | 10–14 h | 8–12 h | 5–8 h | 23–34 h |
| 2 — Gender decoupling | 38–54 h | 28–38 h | 18–25 h | 84–117 h |
| 3 — Package specifications | 12–16 h | 10–14 h | 6–9 h | 28–39 h |
| 4 — Box attributes | 8–12 h | 8–12 h | 5–7 h | 21–31 h |
| **Total** | **68–96 h** | **54–76 h** | **34–49 h** | **156–221 h** |

> ℹ️ The previous total of 113–172 h did not account for the `product_gender_size_ranges` junction table and its related BoxCreate/BoxEdit size-loading logic, which is the primary driver of the Package 2 estimate.

### Advantages

- ✅ **Gender decoupling resolved**: Products no longer require a gender attribute. A single "T-Shirt" product can have boxes of men's, women's, or kids' — no more "T-Shirt Men"/"T-Shirt Women" product duplication. Non-apparel products have NULL gender throughout with no sentinel rows.
- ✅ **Correct size options for every gender via `product_gender_size_ranges`**: Shoe boxes automatically get Male shoe sizes (38–46) vs Female shoe sizes (34–42) based on the gender selected at box creation. The per-gender size range mapping is explicit and queryable.
- ✅ **No new audit table**: Acquisition value history reuses the existing `history` table and the `save_update_to_history` decorator. Zero new schema objects or ORM models required for the audit feature.
- ✅ **`hasGender` backed by real DB column**: The existing `ProductCategory.hasGender` GraphQL field is now backed by `is_gendered` in the DB, making it SQL-filterable. Statistics queries can exclude non-gendered categories natively; BoxCreate can hide the gender selector without client-side category ID lists.
- ✅ **Additive migration only** (except nullable relaxation): New columns are all nullable with defaults; `MODIFY COLUMN` to make `gender_id` nullable is near-instant on InnoDB.
- ✅ **Backwards-compatible API with gradual migration path**: The COALESCE fallback means all existing boxes and products continue to work without any data transformation. Product consolidation (merging "T-Shirt Men"/"T-Shirt Women") can happen at the organisation's own pace.

### Drawbacks

- ⚠️ **`Product.defaultGender` rename is a technically breaking change**: Renaming `Product.gender` → `Product.defaultGender` (even though the underlying nullability was already allowed) is a breaking change per the GraphQL spec. `CustomProductCreationInput.gender` → `defaultGender` is also breaking. A transition period with both names (deprecated `gender` field + new `defaultGender`) is advisable.
- ⚠️ **`product_gender_size_ranges` adds product creation complexity**: The product creation form must now capture per-gender size range mappings instead of a single size range. For categories with `hasGender = false` this is a single entry with `gender_id = NULL`; for shoes it requires up to three entries. This makes the CreateCustomProduct form noticeably more complex.
- ⚠️ **Dual-location gender creates query complexity**: Statistics and filter resolvers must handle COALESCE logic instead of a single JOIN. All 8 statistics SQL queries in `sql.py` require a one-line change from `p.gender_id` to `COALESCE(s.gender_id, p.gender_id)`.
- ⚠️ **Acquisition value history has float precision**: `history.from_float`/`to_float` are MySQL `FLOAT` (single-precision). Adequate for humanitarian aid values but would not meet financial-system precision requirements.
- ⚠️ **Existing shipments lose gender snapshot**: Pre-migration `shipment_detail` rows have NULL in `source_gender_id`/`target_gender_id`. The reconciliation UI must fall back to `sourceProduct.defaultGender` for these rows.

### Tradeoffs

- 🔄 **You gain** structural gender decoupling and correct size options for all product types. **You sacrifice** simplicity in product creation and a more complex migration path than Scenario 2.
- 🔄 **You gain** zero new tables for audit history by reusing the history mechanism. **You sacrifice** DECIMAL precision and the ability to add currency or "reason" metadata to individual acquisition value changes.
- 🔄 **You gain** a gradual consolidation path. **You sacrifice** a clean break — the COALESCE logic and dual-location gender will exist in the codebase for years until consolidation is complete.

---

## Comparison Matrix

| Dimension | Greenfield / ERP-Lite | Least Expensive | Gender-Decoupled |
|-----------|-----------|-----------------|-----------------|
| **Feature Coverage** | | | |
| Compound units support | ✓ (PackageSpec table) | ✓ (PackageSpec table) | ✓ (PackageSpec table) |
| Variable package sizes within box | Partial (nominal spec + comment) | Partial (nominal spec + comment) | Partial (nominal spec + comment) |
| Monetary acquisition value | ✓ (per variant, via history decorator) | ✓ (per product, with audit log) | ✓ (per product, via history table) |
| Acquisition value per size/gender | ✓ (ProductVariant level) | ✗ (product-level only) | ✗ (product-level only) |
| Acquisition value audit trail | ✓ (implicit via history decorator, FLOAT precision) | ✓ (dedicated temporal table, DECIMAL) | ✓ (history table, FLOAT precision) |
| Expiration dates | ✓ | ✓ | ✓ |
| Box weight (computed for mass bundles) | ✓ | ✓ | ✓ |
| Gender decoupled from product | ✓ (NULL gender_id on variant) | ✗ (sentinel required; coupling persists) | ✓ (nullable defaultGender + box-level gender) |
| Correct size options per gender | ✓ (product_variant_definitions table per variant) | ✗ (product has single sizeRange) | ✓ (product_gender_size_ranges table) |
| Non-gendered aggregation | ✓ (NULL gender_id, clean) | ✓ (is_gendered flag, pragmatic) | ✓ (COALESCE + is_gendered DB column) |
| Pack-format products (Water, Peas, Toothbrushes) | ✓ (pack format as size within size range) | ✓ (pack format as size; no structural change) | ✓ (pack format as size; no structural change) |
| Product consolidation ("T-Shirt Men" → "T-Shirt") | ✓ (variant model enables this) | ✗ (separate products remain) | ✓ (optional gradual merge path) |
| Financial audit trail | ✓ (implicit via history; no dedicated table) | ✓ (full temporal log, DECIMAL) | ✓ (history table; less structured) |
| Standard product lifecycle | N/A (out of scope) | ✗ (unchanged) | ✗ (unchanged) |
| "Mixed" size UX fix | ✓ (no Mixed size in measured variants) | ✗ (unchanged) | ✗ (unchanged) |
| **Implementation Complexity** | | | |
| Backend effort (hours) | 160–240 | 30–50 | 68–96 |
| Frontend effort (hours) | 90–140 | 25–45 | 54–76 |
| Migration effort (hours) | 30–50 | 5–10 | included above |
| Testing effort (hours) | 40–55 | 20–30 | 34–49 |
| API breaking changes | Yes (deprecated fields + new shape) | No | Minimal (`Product.gender` → `defaultGender`; nullable) |
| **Migration Risk** | | | |
| Data loss risk | Low (with dual-write period) | None | None |
| Rollback feasibility | Medium (parallel table approach) | Easy (DROP COLUMN/TABLE) | Easy (DROP COLUMN; MODIFY gender_id back) |
| Downtime required | near-zero migration + 5–10 min cutover | < 5 min | < 5 min |
| Existing mobile clients broken | Yes (during transition) | No | No (COALESCE preserves behaviour; deprecated field kept) |
| **Long-term Maintainability** | | | |
| Extensibility | 5/5 (variant layer absorbs new dimensions) | 3/5 (requires schema change per new dimension) | 4/5 (gender clean; size still on product) |
| Code complexity | 3/5 (extra JOIN layer) | 4/5 (minimal extra complexity) | 3/5 (COALESCE logic + product_gender_size_ranges lookup) |
| Query performance impact | Neutral (extra JOIN offset by cleaner indexes) | Positive (additive indexes only) | Neutral (one extra LEFT JOIN on stock gender) |
| Architectural cleanliness | 5/5 | 3/5 | 4/5 |
| Technical debt accrual | Low | Medium (gender-product coupling grows) | Low–Medium (dual-location gender until consolidation) |

---

## Recommendations

**For teams prioritizing shipping velocity and low risk:** implement **Scenario 2** now. It delivers all six of the "Must Support" requirements within a single sprint and introduces zero migration risk. The `is_gendered` flag on product categories is an honest, queryable solution to the aggregation problem even if it is not architecturally pure.

**For teams that must resolve the gender-product coupling but cannot afford a full Greenfield migration:** implement **Scenario 3**. It builds directly on top of Scenario 2's additive approach, resolves the core coupling issue (NoGender sentinel, product duplication for gendered items) at a total cost of ~156–221 hours, with no data loss risk and a gradual product consolidation path. The COALESCE fallback preserves full backwards compatibility during the transition period.

**For teams with a 6-month roadmap and tolerance for a controlled migration window:** plan **Scenario 1 (ERP-Lite)** as the target architecture. The `product_variants` + `product_variant_definitions` model cleanly handles all product types (gendered clothing, pack-format food/hygiene, bulk measured goods) and positions Boxtribute well for expanding its product catalog. The revised design removes `product_value_history` and `standard_product` complexity, bringing the total effort estimate down to ~320–485 hours with a near-zero-downtime dual-write migration.

**Suggested sequencing:**

1. **Sprint 1 (now)**: Ship **Scenario 3** (which is a strict superset of Scenario 2 except for `product_acquisition_log`). The gender decoupling delivers immediate value for food/hygiene onboarding and the effort delta over Scenario 2 is modest (~35–40 extra hours). The `package_specs` table, `product_categories.is_gendered`, and `history`-based acquisition value tracking are all directly reusable in a future Scenario 1 migration.
2. **Sprint 2–3**: Add `package_specs` unit type entries to the `units` table (bags, tins, bottles, packs) and expose them via the GraphQL Units query. Optionally run the product consolidation scripts to merge split gendered products organisation by organisation.
3. **Major version (12–18 months)**: Execute Scenario 1 migration. At this point `package_specs`, `history`-tracked acquisition values, `is_gendered` on categories, and `stock.gender_id` survive the migration unchanged or with trivial renames. Add `product_variant_definitions` and `product_variants` tables; repoint `stock.product_id` → `stock.product_variant_id` over a dual-write window.

---

## Open Questions

1. **Currency for acquisition value**: The `history` table has no currency field. Should acquisition value always be in the base's configured currency (`bases.currency_name`)? If multi-currency support is needed, a dedicated audit table (as in Scenario 2's `product_acquisition_log`) or a currency column on `products` would be required.

2. **Variable pack sizes**: The `package_specs` table captures nominal pack sizes (`inner_quantity`). For wet wipes with genuinely varying inner quantities (10–14 items per package), the `number_of_items` on the box is the authoritative count. Should the GraphQL schema expose a `packagingNominal` flag to indicate the spec is approximate? Or is the `comment` field sufficient?

3. **Box weight — computed vs. manual**: For mass-measured products, `box_weight_kg` can be derived from `measure_value` + container tare weight. Should the application auto-populate `box_weight_kg` when `display_unit` is mass and `measure_value` is set? This reduces data entry burden but requires a tare weight concept.

4. **Expiration dates and box splits**: When a box is split (`source_box_id` relationship), child boxes should inherit the parent's `expiration_date`. Should this be enforced at the database level (trigger) or application level (service layer)?

5. **`is_gendered` at which level?** (Scenarios 2 & 3): The flag is on `product_categories`. Should individual products also be able to override this (e.g., a "Clothing" category product that is gender-neutral)? A `products.is_gendered` column would provide finer control at the cost of additional complexity.

6. **IATI / UNSPSC alignment**: The `product_categories` table could be extended with an `external_code` column for UNSPSC or IATI commodity codes. This is low-cost in all scenarios (one nullable column) and could enable donor reporting interoperability. Requires a stakeholder decision on which classification system to adopt.

7. **ShipmentDetail and acquisition value**: When a box is shipped cross-base, should the receiving base inherit the sender's `acquisition_value`, record their own, or capture both? The current `ShipmentDetail` model could be extended with `acquisition_value_at_transfer` as a snapshot field to prevent value drift during reconciliation.

8. **Standard product gender** (Scenarios 2 & 3): `StandardProduct` still carries `gender_id` and a single `size_range_id`. When a base enables a standard product in Scenario 3, `gender_id` is nullable and the gender flows as `defaultGender` into `products`. A corresponding `standard_product_gender_size_ranges` junction table (or at minimum `StandardProduct.gender_id` made nullable) is needed for consistency. Standard products for food should have `gender_id = NULL` and a single fallback size range.

9. **COALESCE performance** (Scenario 3 specific): Statistics queries that currently use `p.gender_id AS gender` in 8 SQL queries must be updated to `COALESCE(s.gender_id, p.gender_id)`. The composite index `(product_id, gender_id, state_id)` on `stock` mitigates the extra lookup. Should the application materialise effective gender as a denormalised column on `stock` once product consolidation is complete to remove the COALESCE permanently?

10. **Precision of float audit** (Scenario 3 specific): `history.from_float`/`to_float` are MySQL `FLOAT` (single-precision, ~7 significant digits). Is this precision acceptable for acquisition value audit? If not, a `products.acquisition_value_history` dedicated table with `DECIMAL(12,4)` would be needed.

11. **`product_gender_size_ranges` for standard products**: When `enable_standard_product` runs, it copies the single `(gender_id, size_range_id)` from `StandardProduct` into one row in `product_gender_size_ranges`. If a standard product is defined without gendered size ranges (e.g., food), that row has `gender_id = NULL`. Is this sufficient, or should the standard product catalogue itself carry a `product_gender_size_ranges`-style mapping for products like shoes that need different size ranges per gender?

12. **`defaultGender` in BoxCreate pre-fill**: When the `defaultGender` is set on a product (e.g., "T-Shirt" with `defaultGender = Women`), should BoxCreate pre-select Women in the gender dropdown? This is a UX convenience but may confuse coordinators who expect to select any gender freely. Should `defaultGender` be visible to coordinators or treated as a backend-only hint?
