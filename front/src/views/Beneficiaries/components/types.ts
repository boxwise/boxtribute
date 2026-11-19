export interface IBeneficiaryTag {
  id: string;
  name: string;
  color: string | null;
}

export interface IBeneficiaryGroupHeader {
  /** Last name of the family head */
  name: string;
  /** Number of family members on the page, including the head */
  count: number;
}

export interface BeneficiaryRow {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  /** In days */
  age: number | null;
  familyHeadId: number | null;
  familyHeadLastName: string;
  isFamilyHead: boolean;
  groupIdentifier: string;
  tokens: number;
  tags: IBeneficiaryTag[];
  comment: string | null;
  lastActiveOn: Date | null;
  createdOn: Date | null;
  email: string | null;
  phoneNumber: string | null;
  customTextField1: string | null;
  customTextField2: string | null;
  customNumberField: number | null;
  customDateField: Date | null;
  soonToBeDeactivated: boolean;
  signed: boolean;
  /** Set on the first row of a family with more than one member on the page (sorted by last name) */
  groupHeader?: IBeneficiaryGroupHeader;
}
