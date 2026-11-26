import {
  BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY,
  OPTIONS_FOR_BENEFICIARIESVIEW_QUERY,
} from "views/Beneficiaries/BeneficiariesView";

/** A `BeneficiaryRow` as returned by the `beneficiaryRows` query. Family heads have no `familyHeadId`. */
export const beneficiaryRow = (overrides: Record<string, any> = {}) => ({
  __typename: "BeneficiaryRow",
  id: "1",
  firstName: "Anna",
  lastName: "Abel",
  gender: "Female",
  age: 10000,
  familyHeadId: null,
  familyHeadLastName: overrides.lastName ?? "Abel",
  groupIdentifier: "1001",
  tokens: 5,
  tagIds: [],
  comment: null,
  lastActiveOn: "2024-05-01",
  createdOn: "2023-01-15",
  email: null,
  phoneNumber: null,
  customTextField1: null,
  customTextField2: null,
  customNumberField: null,
  customDateField: null,
  soonToBeDeactivated: false,
  signed: true,
  ...overrides,
});

interface IBeneficiaryRowsMockProps {
  baseId?: number;
  /** Complete `options` variable of the request */
  options: Record<string, any>;
  rows: Record<string, any>[];
  totalNumberOfBeneficiaries?: number;
  delay?: number;
}

export const beneficiaryRowsMock = ({
  baseId = 2,
  options,
  rows,
  totalNumberOfBeneficiaries = rows.length,
  delay,
}: IBeneficiaryRowsMockProps) => ({
  request: {
    query: BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY,
    variables: { baseId, options },
  },
  result: {
    data: {
      beneficiaryRows: {
        __typename: "BeneficiaryRowsResult",
        totalNumberOfBeneficiaries,
        page: rows,
      },
    },
  },
  ...(delay ? { delay } : {}),
});

/** `options` of the first request of a tab (UI pages 1 and 2) */
export const firstRequestOptions = (
  filters: Record<string, any>,
  sort: { sortBy?: string; descending?: boolean } = {},
) => ({
  page: 1,
  pageSize: 100,
  filters,
  sortBy: "LastName",
  descending: false,
  ...sort,
});

/** `options` of the request that only fetches the total number of beneficiaries of a tab */
export const totalsOnlyOptions = (
  filters: Record<string, any>,
  sort: { sortBy?: string; descending?: boolean } = {},
) => ({ page: 1, pageSize: 1, filters, sortBy: "LastName", descending: false, ...sort });

export const beneficiaryOptionsMock = (baseId = "2", overrides: Record<string, any> = {}) => ({
  request: {
    query: OPTIONS_FOR_BENEFICIARIESVIEW_QUERY,
    variables: { baseId },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: baseId,
        tags: [
          {
            __typename: "Tag",
            color: "#f37167",
            description: "",
            id: "20",
            name: "refugee",
            type: "Beneficiary",
            lastUsedOn: null,
            deletedOn: null,
            createdOn: "2023-11-01T10:00:00Z",
            lastModifiedOn: "2023-11-01T10:00:00Z",
          },
          {
            __typename: "Tag",
            color: "#0097ff",
            description: "",
            id: "21",
            name: "newcomer",
            type: "Beneficiary",
            lastUsedOn: null,
            deletedOn: null,
            createdOn: "2023-11-05T10:00:00Z",
            lastModifiedOn: "2023-11-05T10:00:00Z",
          },
        ],
        freeshopCurrencyName: "Tokens",
        groupIdentifier: "Case number",
        beneficiaryEmailEnabled: false,
        beneficiaryPhoneEnabled: false,
        beneficiaryCustomTextField1Enabled: false,
        beneficiaryCustomTextField2Enabled: false,
        beneficiaryCustomNumberFieldEnabled: false,
        beneficiaryCustomDateFieldEnabled: false,
        beneficiaryCustomTextField1Name: null,
        beneficiaryCustomTextField2Name: null,
        beneficiaryCustomNumberFieldName: null,
        beneficiaryCustomDateFieldName: null,
        ...overrides,
      },
    },
  },
});
