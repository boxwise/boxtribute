import { useMemo } from "react";
import { useAuthorization } from "hooks/useAuthorization";
import { useSuspenseQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import {
  locationToDropdownOptionTransformer,
  shipmentToDropdownOptionTransformer,
  tagToDropdownOptionsTransformer,
} from "utils/transformers";
import { Column } from "react-table";
import { useTableConfig } from "hooks/useTableConfig";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  SIZE_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";
import { BASE_ORG_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxRow } from "./components/types";
import { DaysCell, StateCell, TagsCell, QrCodeCell } from "./components/TableCells";
import {
  categoriesToFilterOptions,
  genderFilterOptions,
  productsToFilterOptions,
  sizesToFilterOptions,
} from "./components/transformers";
import {
  Heading,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  HStack,
  PopoverAnchor,
  useBoolean,
  Box,
} from "@chakra-ui/react";
import { FaInfoCircle } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { DateCell, ProductWithSPCheckmarkCell } from "components/Table/Cells";
import BoxesTable from "./components/BoxesTable";
import { formatWeight, formatMonetaryValue } from "utils/helpers";
import { useBoxesViewUrlState } from "./hooks/useBoxesViewUrlState";

export const BOXES_QUERY_ELEMENT_FIELD_FRAGMENT = graphql(
  `
    fragment BoxesQueryElementField on Box @_unmask {
      id
      labelIdentifier
      product {
        type
        ...ProductBasicFields
      }
      numberOfItems
      size {
        ...SizeBasicFields
      }
      weight
      monetaryValue
      weightDisplayUnit {
        symbol
      }
      state
      location {
        id
        name
        base {
          monetaryCurrencyCode
        }
      }
      tags {
        ...TagBasicFields
      }
      shipmentDetail {
        id
        shipment {
          id
          labelIdentifier
        }
      }
      qrCode {
        code
      }
      comment
      createdOn
      lastModifiedOn
      deletedOn
      createdBy {
        id
        name
      }
      lastModifiedBy {
        id
        name
      }
    }
  `,
  [PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT],
);

export const BOX_ROW_FIELDS_FRAGMENT = graphql(`
  fragment BoxRowFields on BoxRow @_unmask {
    id
    labelIdentifier
    numberOfItems
    comment
    weight
    monetaryValue
    weightUnitSymbol
    createdOn
    lastModifiedOn
    createdByName
    lastModifiedByName
    state
    productName
    productGender
    containsStandardProduct
    productCategoryName
    sizeName
    locationName
    shipmentId
    shipmentDetailId
    hasQrCode
    tagIds
  }
`);

export const BOXES_FOR_BOXESVIEW_QUERY = graphql(
  `
    query BoxesForBoxesView($baseId: Int!, $options: BoxRowOptions) {
      boxRows(baseId: $baseId, options: $options) {
        page {
          ...BoxRowFields
        }
        totalNumberOfBoxes
        totalNumberOfItems
        totalWeight
        totalMonetaryValue
      }
    }
  `,
  [BOX_ROW_FIELDS_FRAGMENT],
);

export const ACTION_OPTIONS_FOR_BOXESVIEW_QUERY = graphql(
  `
    query ActionOptionsForBoxesView($baseId: ID!) {
      base(id: $baseId) {
        id
        monetaryCurrencyCode
        locations {
          id
          seq
          name
          ... on ClassicLocation {
            defaultBoxState
          }
        }
        tags(resourceType: Box) {
          ...TagBasicFields
        }
        products {
          ...ProductBasicFields
        }
      }
      sizes {
        ...SizeBasicFields
      }
      productCategories {
        id
        name
      }
      shipments(states: [Preparing]) {
        id
        labelIdentifier
        state
        sourceBase {
          ...BaseOrgFields
        }
        targetBase {
          ...BaseOrgFields
        }
      }
    }
  `,
  [
    BASE_ORG_FIELDS_FRAGMENT,
    TAG_BASIC_FIELDS_FRAGMENT,
    PRODUCT_BASIC_FIELDS_FRAGMENT,
    SIZE_BASIC_FIELDS_FRAGMENT,
  ],
);

function Boxes() {
  const authorize = useAuthorization();
  const showWeightAndValue = authorize({ minBeta: 7 });
  const baseId = useAtomValue(selectedBaseIdAtom);
  const [isPopoverOpen, setIsPopoverOpen] = useBoolean();
  const tableConfigKey = `bases/${baseId}/boxes`;

  // Filters, sorting and page are derived from the URL
  const urlState = useBoxesViewUrlState(baseId);

  const defaultHiddenColumns = useMemo(() => {
    const start = [
      "qrLabel",
      "gender",
      "size",
      "comment",
      "age",
      "lastModified",
      "lastModifiedBy",
      "createdBy",
      "productCategory",
      ...(showWeightAndValue ? ["weight", "monetaryValue"] : []),
    ];

    // Columns of active filters are shown
    const filterIds = urlState.filters.map(({ id }) => id);
    return start.filter((colId) => !filterIds.includes(colId));
  }, [urlState.filters, showWeightAndValue]);

  // Only the hidden columns are kept here (in memory); the rest of the table state is in the URL.
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      hiddenColumns: defaultHiddenColumns,
    },
  });

  // fetch options for actions on boxes and the filter options causing the suspense.
  const { data: actionOptionsData } = useSuspenseQuery(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, {
    variables: {
      baseId,
    },
  });

  const availableColumns: Column<BoxRow>[] = useMemo(
    () => [
      {
        Header: "QR label",
        accessor: "hasQrCode",
        id: "qrLabel",
        Cell: QrCodeCell,
        disableSortBy: true,
      },
      {
        Header: "Box #",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
      },
      {
        Header: "Product",
        accessor: "productName",
        id: "product",
        Cell: ProductWithSPCheckmarkCell,
      },
      {
        Header: "Product Category",
        accessor: "productCategoryName",
        id: "productCategory",
      },
      {
        Header: "Gender",
        accessor: "productGender",
        id: "gender",
      },
      {
        Header: "Size",
        accessor: "sizeName",
        id: "size",
      },
      {
        Header: "Items",
        accessor: "numberOfItems",
        id: "numberOfItems",
      },
      ...((showWeightAndValue
        ? [
            {
              Header: "Weight",
              accessor: "weight",
              id: "weight",
              Cell: ({ value, row }) => formatWeight(value, row.original.weightUnitSymbol),
            },
            {
              Header: "Value",
              accessor: "monetaryValue",
              id: "monetaryValue",
              Cell: ({ value, row }) => formatMonetaryValue(value, row.original.currency),
            },
          ]
        : []) as Column<BoxRow>[]),
      {
        Header: "Status",
        accessor: "state",
        id: "state",
        Cell: StateCell,
        disableSortBy: true,
      },
      {
        Header: "Location",
        accessor: "locationName",
        id: "location",
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Cell: TagsCell,
        disableSortBy: true,
      },
      {
        Header: "Comments",
        accessor: "comment",
        id: "comment",
      },
      {
        Header: (
          <Popover
            isOpen={isPopoverOpen}
            onOpen={setIsPopoverOpen.on}
            onClose={setIsPopoverOpen.off}
            closeOnBlur={true}
            isLazy
            lazyBehavior="keepMounted"
          >
            <HStack>
              <PopoverAnchor>
                <div>Age</div>
              </PopoverAnchor>
              <PopoverTrigger>
                <Box>
                  <FaInfoCircle height={8} width={8} />
                </Box>
              </PopoverTrigger>
            </HStack>
            <PopoverContent minW={{ base: "100%", lg: "max-content", sm: "max-content" }}>
              <PopoverBody>
                How old the box is from the time
                <br />
                it was first created in Boxtribute.
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ),
        accessor: "age",
        id: "age",
        Cell: DaysCell,
        disableSortBy: true,
      },
      {
        Header: "Last Modified On",
        accessor: "lastModified",
        id: "lastModified",
        Cell: DateCell,
        disableSortBy: true,
      },
      {
        Header: "Last Modified By",
        accessor: "lastModifiedBy",
        id: "lastModifiedBy",
        disableSortBy: true,
      },
      {
        Header: "Created By",
        accessor: "createdBy",
        id: "createdBy",
        disableSortBy: true,
      },
    ],
    [isPopoverOpen, setIsPopoverOpen.off, setIsPopoverOpen.on, showWeightAndValue],
  );

  const base = actionOptionsData.base;
  const productOptions = useMemo(() => productsToFilterOptions(base?.products), [base?.products]);
  const categoryOptions = useMemo(
    () => categoriesToFilterOptions(actionOptionsData.productCategories),
    [actionOptionsData.productCategories],
  );
  const sizeOptions = useMemo(
    () => sizesToFilterOptions(actionOptionsData.sizes),
    [actionOptionsData.sizes],
  );
  const genderOptions = useMemo(() => genderFilterOptions(), []);
  const locationOptions = useMemo(
    () => locationToDropdownOptionTransformer(base?.locations ?? []),
    [base?.locations],
  );
  const tagOptions = useMemo(() => tagToDropdownOptionsTransformer(base?.tags ?? []), [base?.tags]);
  const shipmentOptions = useMemo(
    () => shipmentToDropdownOptionTransformer(actionOptionsData.shipments, baseId),
    [actionOptionsData.shipments, baseId],
  );

  return (
    <>
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Boxes
      </Heading>
      <BoxesTable
        baseId={baseId}
        urlState={urlState}
        tableConfig={tableConfig}
        actionOptionsData={actionOptionsData}
        columns={availableColumns}
        shipmentOptions={shipmentOptions}
        locationOptions={locationOptions}
        tagOptions={tagOptions}
        productOptions={productOptions}
        categoryOptions={categoryOptions}
        genderOptions={genderOptions}
        sizeOptions={sizeOptions}
      />
    </>
  );
}

export default Boxes;
