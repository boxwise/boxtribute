import { gql } from "@apollo/client";
import { BOX_BASIC_FIELDS_FRAGMENT } from "./warehouse";

export const USER_BASIC_FIELDS_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    name
  }
`;

export const HISTORY_FIELDS_FRAGMENT = gql`
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment HistoryFields on HistoryEntry {
    id
    changes
    changeDate
    user {
      ...UserBasicFields
    }
  }
`;

export const TAG_FIELDS_FRAGMENT = gql`
  fragment TagFields on Tag {
    id
    name
    color
  }
`;

export const TAG_OPTIONS_FRAGMENT = gql`
  fragment TagOptions on Tag {
    value: id
    label: name
    color
  }
`;

export const DISTRO_EVENT_FIELDS_FRAGMENT = gql`
  fragment DistroEventFields on DistributionEvent {
    id
    state
    name
    distributionSpot {
      name
    }
    plannedStartDateTime
    plannedEndDateTime
  }
`;

export const BASE_BASIC_FIELDS_FRAGMENT = gql`
  fragment BaseBasicFields on Base {
    id
    name
  }
`;

export const ORGANISATION_BASIC_FIELDS_FRAGMENT = gql`
  fragment OrganisationBasicFields on Organisation {
    id
    name
  }
`;

export const BASE_ORG_FIELDS_FRAGMENT = gql`
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${ORGANISATION_BASIC_FIELDS_FRAGMENT}
  fragment BaseOrgFields on Base {
    ...BaseBasicFields
    organisation {
      ...OrganisationBasicFields
    }
  }
`;

export const TRANSFER_AGREEMENT_FIELDS_FRAGMENT = gql`
  ${ORGANISATION_BASIC_FIELDS_FRAGMENT}
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment TransferAgreementFields on TransferAgreement {
    id
    type
    state
    comment
    validFrom
    validUntil
    sourceOrganisation {
      ...OrganisationBasicFields
    }
    sourceBases {
      ...BaseBasicFields
    }
    targetOrganisation {
      ...OrganisationBasicFields
    }
    targetBases {
      ...BaseBasicFields
    }
    shipments {
      id
      state
      sourceBase {
        ...BaseBasicFields
      }
      targetBase {
        ...BaseBasicFields
      }
    }
    requestedOn
    requestedBy {
      ...UserBasicFields
    }
    acceptedOn
    acceptedBy {
      ...UserBasicFields
    }
    terminatedOn
    terminatedBy {
      ...UserBasicFields
    }
  }
`;

export const SHIPMENT_DETAIL_FIELDS_FRAGMENT = gql`
  ${BOX_BASIC_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment ShipmentDetailFields on ShipmentDetail {
    id
    box {
      ...BoxFields
    }
    createdOn
    createdBy {
      ...UserBasicFields
    }
    deletedOn
    deletedBy {
      ...UserBasicFields
    }
  }
`;

export const SHIPMENT_FIELDS_FRAGMENT = gql`
  ${BASE_ORG_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  ${SHIPMENT_DETAIL_FIELDS_FRAGMENT}
  fragment ShipmentFields on Shipment {
    id
    state
    details {
      ...ShipmentDetailFields
    }
    sourceBase {
      ...BaseOrgFields
    }
    targetBase {
      ...BaseOrgFields
    }
    transferAgreement {
      id
    }
    startedOn
    startedBy {
      ...UserBasicFields
    }
    sentOn
    sentBy {
      ...UserBasicFields
    }
    receivingStartedOn
    receivingStartedBy {
      ...UserBasicFields
    }
    completedOn
    completedBy {
      ...UserBasicFields
    }
    canceledOn
    canceledBy {
      ...UserBasicFields
    }
  }
`;
