import {
  ACTION_OPTIONS_FOR_BOXESVIEW_QUERY,
  BOXES_FOR_BOXESVIEW_QUERY,
} from "views/Boxes/BoxesView";
import { instockBox1, instockBox2, scrapBox } from "./boxes";

/** Converts a mocked `Box` into the flat `BoxRow` returned by the `boxRows` query. */
export const toBoxRow = (box: any, overrides: Record<string, any> = {}) => ({
  __typename: "BoxRow",
  id: box.id,
  labelIdentifier: box.labelIdentifier,
  numberOfItems: box.numberOfItems,
  comment: box.comment,
  weight: box.weight,
  monetaryValue: box.monetaryValue,
  weightUnitSymbol: box.weightDisplayUnit?.symbol ?? null,
  createdOn: box.createdOn,
  lastModifiedOn: box.lastModifiedOn,
  createdByName: box.createdBy?.name ?? null,
  lastModifiedByName: box.lastModifiedBy?.name ?? null,
  state: box.state,
  productName: box.product.name,
  productGender: box.product.gender,
  containsStandardProduct: box.product.type === "StandardInstantiation",
  productCategoryName: box.product.category.name,
  sizeName: box.size.label,
  locationName: box.location.name,
  shipmentId: box.shipmentDetail?.shipment?.id ?? null,
  hasQrCode: !!box.qrCode,
  tagIds: box.tags.map(({ id }) => id),
  ...overrides,
});

export const instockBoxRow1 = toBoxRow(instockBox1);
export const instockBoxRow2 = toBoxRow(instockBox2);
export const scrapBoxRow = toBoxRow(scrapBox);

/** `count` rows with the label identifiers `L0001`, `L0002`, ... */
export const generateBoxRows = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    toBoxRow(instockBox1, {
      id: String(1000 + i),
      labelIdentifier: `L${String(i + 1).padStart(4, "0")}`,
    }),
  );

interface IBoxRowsMockProps {
  baseId?: number;
  /** Complete `options` variable of the request */
  options: Record<string, any>;
  rows: Record<string, any>[];
  totalNumberOfBoxes?: number;
  totalNumberOfItems?: number;
  totalWeight?: number;
  totalMonetaryValue?: number;
  delay?: number;
}

export const boxRowsMock = ({
  baseId = 2,
  options,
  rows,
  totalNumberOfBoxes = rows.length,
  totalNumberOfItems = rows.reduce((total, row) => total + (row.numberOfItems ?? 0), 0),
  totalWeight = 0,
  totalMonetaryValue = 0,
  delay,
}: IBoxRowsMockProps) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: { baseId, options },
  },
  result: {
    data: {
      boxRows: {
        __typename: "BoxRowsResult",
        page: rows,
        totalNumberOfBoxes,
        totalNumberOfItems,
        totalWeight,
        totalMonetaryValue,
      },
    },
  },
  ...(delay ? { delay } : {}),
});

/** `options` of the first request of a view */
export const firstRequestOptions = (
  filters: Record<string, any>,
  sort: Record<string, any> = {},
) => ({
  page: 1,
  pageSize: 100,
  filters,
  ...sort,
});

export const actionOptionsMock = (baseId = "2") => ({
  request: {
    query: ACTION_OPTIONS_FOR_BOXESVIEW_QUERY,
    variables: { baseId },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: baseId,
        monetaryCurrencyCode: "EUR",
        locations: [
          {
            __typename: "ClassicLocation",
            defaultBoxState: "Lost",
            id: "14",
            name: "LOST",
            seq: 14,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "Scrap",
            id: "15",
            name: "SCRAP",
            seq: 15,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "16",
            name: "Stockroom",
            seq: 16,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "17",
            name: "WH1",
            seq: 17,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "18",
            name: "WH2",
            seq: 18,
          },
        ],
        tags: [
          {
            __typename: "Tag",
            color: "#f37167",
            description: "Donation from company x",
            id: "10",
            name: "company X",
            type: "Box",
            lastUsedOn: null,
            deletedOn: null,
            createdOn: "2023-11-01T10:00:00Z",
            lastModifiedOn: "2023-11-01T10:00:00Z",
          },
          {
            __typename: "Tag",
            color: "#d89016",
            description: "",
            id: "11",
            name: "new",
            type: "All",
            lastUsedOn: null,
            deletedOn: null,
            createdOn: "2023-11-05T12:00:00Z",
            lastModifiedOn: "2023-11-05T12:00:00Z",
          },
          {
            __typename: "Tag",
            color: "#0097ff",
            description: "Hold back for emergencies",
            id: "12",
            name: "emergency",
            type: "Box",
            lastUsedOn: null,
            deletedOn: null,
            createdOn: "2023-11-10T09:30:00Z",
            lastModifiedOn: "2023-11-10T09:30:00Z",
          },
        ],
        products: [
          {
            __typename: "Product",
            id: "267",
            name: "Sweatpants",
            type: "Custom",
            gender: "Men",
            deletedOn: null,
            category: { __typename: "ProductCategory", id: "1", name: "Bottoms" },
          },
          {
            __typename: "Product",
            id: "350",
            name: "Robes",
            type: "Custom",
            gender: "UnisexKid",
            deletedOn: null,
            category: { __typename: "ProductCategory", id: "1", name: "Bottoms" },
          },
        ],
      },
      sizes: [
        { __typename: "Size", id: "52", label: "Mixed" },
        { __typename: "Size", id: "68", label: "One size" },
      ],
      productCategories: [{ __typename: "ProductCategory", id: "1", name: "Bottoms" }],
      shipments: [
        {
          __typename: "Shipment",
          labelIdentifier: "S001-231111-LExTH",
          id: "1",
          sourceBase: {
            __typename: "Base",
            id: "1",
            name: "Lesvos",
            organisation: {
              __typename: "Organisation",
              id: "1",
              name: "BoxAid",
            },
          },
          state: "Preparing",
          targetBase: {
            __typename: "Base",
            id: "2",
            name: "Thessaloniki",
            organisation: {
              __typename: "Organisation",
              id: "2",
              name: "BoxCare",
            },
          },
        },
      ],
    },
  },
});
