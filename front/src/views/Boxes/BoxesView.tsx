import { useEffect, useMemo, useState } from "react";
import { useApolloClient, useBackgroundQuery, useSuspenseQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import {
  locationToDropdownOptionTransformer,
  shipmentToDropdownOptionTransformer,
  tagToDropdownOptionsTransformer,
} from "utils/transformers";
import { Column } from "react-table";
import { URL_FILTER_CONFIG, useTableConfig } from "hooks/useTableConfig";
import {
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  SIZE_BASIC_FIELDS_FRAGMENT,
} from "../../../../graphql/fragments";
import { BASE_ORG_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxRow } from "./components/types";
import {
  DaysCell,
  ObjectCell,
  ShipmentCell,
  StateCell,
  TagsCell,
  QrCodeCell,
} from "./components/TableCells";
import { prepareBoxesForBoxesViewQueryVariables } from "./components/transformers";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
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
  IconButton,
} from "@chakra-ui/react";
import { FaInfoCircle } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { DateCell, ProductWithSPCheckmarkCell } from "components/Table/Cells";
import { BoxState } from "queries/types";
import BoxesTable from "./components/BoxesTable";
import { boxStateIds } from "utils/constants";
import { useSearchParams } from "react-router-dom";
import { BoxesFilterDrawer, FilterOption } from "./components/BoxesFilterDrawer";
import { IBoxesTagFilterValue } from "./components/BoxesTagFilter";

// TODO: Implement Pagination and Filtering
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
      state
      location {
        id
        name
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

export const BOXES_FOR_BOXESVIEW_QUERY = graphql(
  `
    query BoxesForBoxesView($baseId: ID!, $filterInput: FilterBoxInput, $paginationInput: Int) {
      boxes(
        baseId: $baseId
        filterInput: $filterInput
        paginationInput: { first: $paginationInput }
      ) {
        totalCount
        pageInfo {
          hasNextPage
        }
        elements {
          ...BoxesQueryElementField
        }
      }
    }
  `,
  [BOXES_QUERY_ELEMENT_FIELD_FRAGMENT],
);

export const ACTION_OPTIONS_FOR_BOXESVIEW_QUERY = graphql(
  `
    query ActionOptionsForBoxesView($baseId: ID!) {
      base(id: $baseId) {
        id
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
      }
      shipments {
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
  [BASE_ORG_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT],
);

function Boxes({
  hasExecutedInitialFetchOfBoxes,
}: {
  hasExecutedInitialFetchOfBoxes: { current: boolean };
}) {
  const [searchParams] = useSearchParams();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const apolloClient = useApolloClient();
  const [isPopoverOpen, setIsPopoverOpen] = useBoolean();
  const tableConfigKey = `bases/${baseId}/boxes`;

  const defaultHiddenColumns = useMemo(() => {
    const start = [
      "qrLabel",
      "gender",
      "size",
      "shipment",
      "comment",
      "age",
      "lastModified",
      "lastModifiedBy",
      "createdBy",
      "productCategory",
    ];

    const filterIds: string[] = [];
    URL_FILTER_CONFIG.forEach(({ filterId, urlParam }) => {
      const param = searchParams.get(urlParam);

      if (param) {
        filterIds.push(filterId);
      }
    });

    return start.filter((colId) => !filterIds.includes(colId));
  }, [searchParams]);

  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [],
      sortBy: [{ id: "lastModified", desc: true }],
      hiddenColumns: defaultHiddenColumns,
    },
    syncFiltersAndUrlParams: true,
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useBoolean();
  const [pendingFilters, setPendingFilters] = useState<{
    product: FilterOption[];
    gender: FilterOption[];
    size: FilterOption[];
    state: FilterOption[];
    location: FilterOption[];
    comment: FilterOption[];
    includedTags: IBoxesTagFilterValue[];
    excludedTags: IBoxesTagFilterValue[];
  }>({
    product: [],
    gender: [],
    size: [],
    state: [],
    location: [],
    comment: [],
    includedTags: [],
    excludedTags: [],
  });

  // fetch options for actions on boxes causing the suspense.
  const { data: actionOptionsData } = useSuspenseQuery(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, {
    variables: {
      baseId,
    },
  });

  // The first 20 boxes to be shown are preloaded causing the suspense on the initial mount.
  // The rest of the boxes are fetched in the background in the following useEffect.
  const [boxesQueryRef, { refetch: refetchBoxes }] = useBackgroundQuery(BOXES_FOR_BOXESVIEW_QUERY, {
    variables: prepareBoxesForBoxesViewQueryVariables(baseId, tableConfig.getColumnFilters(), 20),
  });
  const [isBackgroundFetchOfBoxesLoading, setIsBackgroundFetchOfBoxesLoading] = useState(
    !hasExecutedInitialFetchOfBoxes.current,
  );
  useEffect(() => {
    if (hasExecutedInitialFetchOfBoxes.current) {
      return;
    }

    // Only on very initial mount, query 20 boxes of the most used states to preload the data into
    // Apollo cache.
    // But skip preloading a state if the current table config already requests it via filters.
    // e.g. if tableConfig.getColumnFilters() already contains the id for "Donated" (boxStateIds.Donated),
    // do not query Donated here.
    const states = ["InStock", "Donated", "Scrap"] satisfies Partial<BoxState>[];

    // Read the current state filter values (these are state IDs like "5", "6" etc.)
    const stateFilterValues: string[] =
      (tableConfig.getColumnFilters().find((f) => f.id === "state")?.value as string[]) ?? [];

    for (const state of states) {
      const stateId = boxStateIds[state];
      // If the table is already filtered to this state ID, skip preloading it.
      if (stateId && stateFilterValues.includes(stateId)) {
        continue;
      }

      apolloClient.query({
        query: BOXES_FOR_BOXESVIEW_QUERY,
        variables: {
          baseId,
          filterInput: {
            states: [state],
          },
          paginationInput: 20,
        },
        fetchPolicy: "network-only",
      });
    }

    apolloClient
      .query({
        query: BOXES_FOR_BOXESVIEW_QUERY,
        variables: prepareBoxesForBoxesViewQueryVariables(baseId, tableConfig.getColumnFilters()),
        fetchPolicy: "network-only",
      })
      .then(({ data, errors }) => {
        if ((errors?.length || 0) === 0 && data?.boxes?.elements) {
          hasExecutedInitialFetchOfBoxes.current = true;
        }
      })
      .finally(() => {
        setIsBackgroundFetchOfBoxesLoading(false);
      });
    // only on initial mount, so no dependencies needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableColumns: Column<BoxRow>[] = useMemo(
    () => [
      {
        Header: "QR label",
        accessor: "hasQrCode",
        id: "qrLabel",
        Cell: QrCodeCell,
        disableFilters: true,
        sortType: (rowA, rowB) => {
          if (rowA.values.qrLabel === rowB.values.qrLabel) return 0;
          if (rowA.values.qrLabel > rowB.values.qrLabel) return 1;
          return -1;
        },
      },
      {
        Header: "Box #",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
        disableFilters: true,
      },
      {
        Header: "Product",
        accessor: "product",
        id: "product",
        Cell: ProductWithSPCheckmarkCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.product?.name.toLowerCase() ?? "";
          const b = rowB.values.product?.name.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Product Category",
        accessor: "productCategory",
        id: "productCategory",
        Cell: ObjectCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.productCategory?.name.toLowerCase() ?? "";
          const b = rowB.values.productCategory?.name.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Cell: ObjectCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.gender?.name.toLowerCase() ?? "";
          const b = rowB.values.gender?.name.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
        Cell: ObjectCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.size?.name?.toLowerCase() ?? "";
          const b = rowB.values.size?.name?.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Items",
        accessor: "numberOfItems",
        id: "numberOfItems",
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "state",
        id: "state",
        Cell: StateCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.state?.name.toLowerCase() ?? "";
          const b = rowB.values.state?.name.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Cell: ObjectCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.location?.name.toLowerCase() ?? "";
          const b = rowB.values.location?.name.toLowerCase() ?? "";
          return a.localeCompare(b);
        },
        disableFilters: true,
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Cell: TagsCell,
        sortType: (rowA, rowB) => {
          const a = rowA.values.tags?.length ?? 0;
          const b = rowB.values.tags?.length ?? 0;
          return a - b;
        },
        disableFilters: true,
      },
      {
        Header: "Shipment",
        accessor: "shipment",
        id: "shipment",
        Cell: ShipmentCell,
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Comments",
        accessor: "comment",
        id: "comment",
        disableFilters: true,
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
        disableFilters: true,
      },
      {
        Header: "Last Modified",
        accessor: "lastModified",
        id: "lastModified",
        Cell: DateCell,
        disableFilters: true,
        sortType: "datetime",
      },
      {
        Header: "Last Modified By",
        accessor: "lastModifiedBy",
        id: "lastModifiedBy",
        disableFilters: true,
      },
      {
        Header: "Created By",
        accessor: "createdBy",
        id: "createdBy",
        disableFilters: true,
      },
    ],
    [isPopoverOpen, setIsPopoverOpen.off, setIsPopoverOpen.on],
  );

  const filterOptions = useMemo(() => {
    const extractOptions = (rows: any[], accessor: string): FilterOption[] => {
      const uniqueValues = new Map<string, string>();
      rows.forEach((row) => {
        const value = row[accessor];
        if (value && typeof value === "object" && value.id && value.name) {
          uniqueValues.set(value.id, value.name);
        }
      });
      return Array.from(uniqueValues.entries())
        .map(([id, name]) => ({ value: id, label: name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    };

    return {
      product: extractOptions([], "product"),
      gender: extractOptions([], "gender"),
      size: extractOptions([], "size"),
      state: Object.entries(boxStateIds).map(([name, id]) => ({ label: name, value: id })),
      location: locationToDropdownOptionTransformer(actionOptionsData.base?.locations ?? []),
      comment: [],
    };
  }, [actionOptionsData]);

  const availableTags: IBoxesTagFilterValue[] = useMemo(
    () =>
      (actionOptionsData?.base?.tags ?? []).map((tag) => ({
        id: parseInt(tag.id, 10),
        value: tag.id,
        label: tag.name,
        urlId: tag.id,
        color: tag.color || "#000000",
      })),
    [actionOptionsData],
  );

  useEffect(() => {
    const currentFilters = tableConfig.getColumnFilters();
    const newPendingFilters: typeof pendingFilters = {
      product: [],
      gender: [],
      size: [],
      state: [],
      location: [],
      comment: [],
      includedTags: [],
      excludedTags: [],
    };

    currentFilters.forEach((filter) => {
      if (filter.id === "product" && Array.isArray(filter.value)) {
        newPendingFilters.product = filter.value.map((id: string) => {
          const option = filterOptions.product.find((opt) => opt.value === id);
          return option || { value: id, label: id };
        });
      } else if (filter.id === "gender" && Array.isArray(filter.value)) {
        newPendingFilters.gender = filter.value.map((id: string) => {
          const option = filterOptions.gender.find((opt) => opt.value === id);
          return option || { value: id, label: id };
        });
      } else if (filter.id === "size" && Array.isArray(filter.value)) {
        newPendingFilters.size = filter.value.map((id: string) => {
          const option = filterOptions.size.find((opt) => opt.value === id);
          return option || { value: id, label: id };
        });
      } else if (filter.id === "state" && Array.isArray(filter.value)) {
        newPendingFilters.state = filter.value.map((id: string) => {
          const option = filterOptions.state.find((opt) => opt.value === id);
          return option || { value: id, label: id };
        });
      } else if (filter.id === "location" && Array.isArray(filter.value)) {
        newPendingFilters.location = filter.value.map((id: string) => {
          const option = filterOptions.location.find((opt) => opt.value === id);
          return option || { value: id, label: id };
        });
      } else if (filter.id === "tags" && Array.isArray(filter.value)) {
        newPendingFilters.includedTags = filter.value
          .map((id: string) => availableTags.find((tag) => tag.id === parseInt(id, 10)))
          .filter((tag): tag is IBoxesTagFilterValue => tag !== undefined);
      }
    });

    setPendingFilters(newPendingFilters);
  }, [tableConfig, filterOptions, availableTags, isFilterDrawerOpen]);

  const handleFilterChange = (filterId: string, value: FilterOption[] | IBoxesTagFilterValue[]) => {
    setPendingFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleApplyFilters = () => {
    const newFilters: any[] = [];

    if (pendingFilters.product.length > 0) {
      newFilters.push({
        id: "product",
        value: pendingFilters.product.map((opt) => opt.value),
      });
    }
    if (pendingFilters.gender.length > 0) {
      newFilters.push({
        id: "gender",
        value: pendingFilters.gender.map((opt) => opt.value),
      });
    }
    if (pendingFilters.size.length > 0) {
      newFilters.push({
        id: "size",
        value: pendingFilters.size.map((opt) => opt.value),
      });
    }
    if (pendingFilters.state.length > 0) {
      newFilters.push({
        id: "state",
        value: pendingFilters.state.map((opt) => opt.value),
      });
    }
    if (pendingFilters.location.length > 0) {
      newFilters.push({
        id: "location",
        value: pendingFilters.location.map((opt) => opt.value),
      });
    }
    if (pendingFilters.includedTags.length > 0) {
      newFilters.push({
        id: "tags",
        value: pendingFilters.includedTags.map((tag) => String(tag.id)),
      });
    }

    tableConfig.setColumnFilters(newFilters);
  };

  const handleClearFilters = () => {
    setPendingFilters({
      product: [],
      gender: [],
      size: [],
      state: [],
      location: [],
      comment: [],
      includedTags: [],
      excludedTags: [],
    });
    tableConfig.setColumnFilters([]);
  };

  return (
    <>
      <BreadcrumbNavigation items={[{ label: "Aid Inventory" }, { label: "Manage Boxes" }]} />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Boxes
      </Heading>
      <BoxesTable
        isBackgroundFetchOfBoxesLoading={isBackgroundFetchOfBoxesLoading}
        hasExecutedInitialFetchOfBoxes={hasExecutedInitialFetchOfBoxes}
        tableConfig={tableConfig}
        onRefetch={refetchBoxes}
        boxesQueryRef={boxesQueryRef}
        columns={availableColumns}
        shipmentOptions={shipmentToDropdownOptionTransformer(actionOptionsData.shipments, baseId)}
        locationOptions={locationToDropdownOptionTransformer(
          actionOptionsData.base?.locations ?? [],
        )}
        tagOptions={tagToDropdownOptionsTransformer(actionOptionsData?.base?.tags ?? [])}
        filterButton={
          <IconButton
            aria-label="Filter boxes"
            icon={<MdFilterList />}
            onClick={setIsFilterDrawerOpen.on}
            size="md"
            variant="ghost"
          />
        }
      />
      <BoxesFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={setIsFilterDrawerOpen.off}
        productOptions={filterOptions.product}
        genderOptions={filterOptions.gender}
        sizeOptions={filterOptions.size}
        stateOptions={filterOptions.state}
        locationOptions={filterOptions.location}
        commentOptions={filterOptions.comment}
        availableTags={availableTags}
        pendingFilters={pendingFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </>
  );
}

export default Boxes;
