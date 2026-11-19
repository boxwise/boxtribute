import { useMemo } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import { Column } from "react-table";
import { useAtomValue } from "jotai";
import { graphql } from "../../../../graphql/graphql";
import { TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useTableConfig } from "hooks/useTableConfig";
import { tagToDropdownOptionsTransformer } from "utils/transformers";
import { TagsCell } from "views/Boxes/components/TableCells";
import { BeneficiaryRow } from "./components/types";
import {
  AgeCell,
  BeneficiaryDateCell,
  FirstNameCell,
  GenderCell,
  SurnameCell,
} from "./components/TableCells";
import BeneficiariesTable from "./components/BeneficiariesTable";
import { useBeneficiariesViewUrlState } from "./hooks/useBeneficiariesViewUrlState";

export const BENEFICIARY_ROW_FIELDS_FRAGMENT = graphql(`
  fragment BeneficiaryRowFields on BeneficiaryRow @_unmask {
    id
    firstName
    lastName
    gender
    age
    familyHeadId
    familyHeadLastName
    groupIdentifier
    tokens
    tagIds
    comment
    lastActiveOn
    createdOn
    email
    phoneNumber
    customTextField1
    customTextField2
    customNumberField
    customDateField
    soonToBeDeactivated
    signed
  }
`);

export const BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY = graphql(
  `
    query BeneficiariesForBeneficiariesView($baseId: Int!, $options: BeneficiaryRowOptions) {
      beneficiaryRows(baseId: $baseId, options: $options) {
        totalNumberOfBeneficiaries
        page {
          ...BeneficiaryRowFields
        }
      }
    }
  `,
  [BENEFICIARY_ROW_FIELDS_FRAGMENT],
);

export const OPTIONS_FOR_BENEFICIARIESVIEW_QUERY = graphql(
  `
    query OptionsForBeneficiariesView($baseId: ID!) {
      base(id: $baseId) {
        id
        tags(resourceType: Beneficiary) {
          ...TagBasicFields
        }
        freeshopCurrencyName
        groupIdentifier
        beneficiaryEmailEnabled
        beneficiaryPhoneEnabled
        beneficiaryCustomTextField1Enabled
        beneficiaryCustomTextField2Enabled
        beneficiaryCustomNumberFieldEnabled
        beneficiaryCustomDateFieldEnabled
        beneficiaryCustomTextField1Name
        beneficiaryCustomTextField2Name
        beneficiaryCustomNumberFieldName
        beneficiaryCustomDateFieldName
      }
    }
  `,
  [TAG_BASIC_FIELDS_FRAGMENT],
);

const FALLBACK_FIELD_NAME = "n/a";

// The other columns are shown by default. Columns of fields that are disabled for the base do not exist.
const DEFAULT_HIDDEN_COLUMNS = [
  "lastActiveOn",
  "createdOn",
  "email",
  "phoneNumber",
  "customTextField1",
  "customTextField2",
  "customNumberField",
  "customDateField",
];

function Beneficiaries() {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const tableConfigKey = `bases/${baseId}/beneficiaries`;

  // Tab, filters, sorting and pages are derived from the URL
  const urlState = useBeneficiariesViewUrlState();

  // Fetch the options of the base and the filter options causing the suspense.
  const { data } = useSuspenseQuery(OPTIONS_FOR_BENEFICIARIESVIEW_QUERY, {
    variables: { baseId },
  });
  const base = data.base;

  const columns: Column<BeneficiaryRow>[] = useMemo(
    () => [
      { Header: "Surname", accessor: "lastName", id: "lastName", Cell: SurnameCell },
      { Header: "First name", accessor: "firstName", id: "firstName", Cell: FirstNameCell },
      { Header: "Gender", accessor: "gender", id: "gender", Cell: GenderCell },
      { Header: "Age", accessor: "age", id: "age", Cell: AgeCell },
      {
        Header: base?.groupIdentifier ?? "Group",
        accessor: "groupIdentifier",
        id: "groupIdentifier",
      },
      { Header: base?.freeshopCurrencyName ?? "Tokens", accessor: "tokens", id: "tokens" },
      { Header: "Tags", accessor: "tags", id: "tags", Cell: TagsCell, disableSortBy: true },
      { Header: "Comment", accessor: "comment", id: "comment", disableSortBy: true },
      {
        Header: "Last active",
        accessor: "lastActiveOn",
        id: "lastActiveOn",
        Cell: BeneficiaryDateCell,
      },
      { Header: "Created on", accessor: "createdOn", id: "createdOn", Cell: BeneficiaryDateCell },
      ...((base?.beneficiaryEmailEnabled
        ? [{ Header: "Email", accessor: "email", id: "email" }]
        : []) as Column<BeneficiaryRow>[]),
      ...((base?.beneficiaryPhoneEnabled
        ? [{ Header: "Phone", accessor: "phoneNumber", id: "phoneNumber" }]
        : []) as Column<BeneficiaryRow>[]),
      ...((base?.beneficiaryCustomTextField1Enabled
        ? [
            {
              Header: base.beneficiaryCustomTextField1Name ?? FALLBACK_FIELD_NAME,
              accessor: "customTextField1",
              id: "customTextField1",
            },
          ]
        : []) as Column<BeneficiaryRow>[]),
      ...((base?.beneficiaryCustomTextField2Enabled
        ? [
            {
              Header: base.beneficiaryCustomTextField2Name ?? FALLBACK_FIELD_NAME,
              accessor: "customTextField2",
              id: "customTextField2",
            },
          ]
        : []) as Column<BeneficiaryRow>[]),
      ...((base?.beneficiaryCustomNumberFieldEnabled
        ? [
            {
              Header: base.beneficiaryCustomNumberFieldName ?? FALLBACK_FIELD_NAME,
              accessor: "customNumberField",
              id: "customNumberField",
              disableSortBy: true,
            },
          ]
        : []) as Column<BeneficiaryRow>[]),
      ...((base?.beneficiaryCustomDateFieldEnabled
        ? [
            {
              Header: base.beneficiaryCustomDateFieldName ?? FALLBACK_FIELD_NAME,
              accessor: "customDateField",
              id: "customDateField",
              Cell: BeneficiaryDateCell,
              disableSortBy: true,
            },
          ]
        : []) as Column<BeneficiaryRow>[]),
    ],
    [base],
  );

  // Only the hidden columns are kept here (in memory); the rest of the table state is in the URL.
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      hiddenColumns: DEFAULT_HIDDEN_COLUMNS,
    },
  });

  const tags = useMemo(() => base?.tags ?? [], [base?.tags]);
  const tagOptions = useMemo(() => tagToDropdownOptionsTransformer(tags), [tags]);

  return (
    <>
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Beneficiaries
      </Heading>
      <BeneficiariesTable
        baseId={baseId}
        urlState={urlState}
        tableConfig={tableConfig}
        columns={columns}
        tags={tags}
        tagOptions={tagOptions}
      />
    </>
  );
}

export default Beneficiaries;
