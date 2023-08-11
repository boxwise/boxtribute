/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  Datetime: { input: any; output: any; }
};

export type BeneficiaryDemographicsResult = {
  __typename?: 'BeneficiaryDemographicsResult';
  age?: Maybe<Scalars['Int']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  createdOn?: Maybe<Scalars['Date']['output']>;
  gender?: Maybe<HumanGender>;
};

/** Classificators for [`Box`]({{Types.Box}}) state. */
export enum BoxState {
  Donated = 'Donated',
  InStock = 'InStock',
  InTransit = 'InTransit',
  Lost = 'Lost',
  MarkedForShipment = 'MarkedForShipment',
  Receiving = 'Receiving',
  Scrap = 'Scrap'
}

/** TODO: Add description here once specs are final/confirmed */
export enum DistributionEventState {
  Completed = 'Completed',
  OnDistro = 'OnDistro',
  Packing = 'Packing',
  Planning = 'Planning',
  ReturnTrackingInProgress = 'ReturnTrackingInProgress',
  ReturnedFromDistribution = 'ReturnedFromDistribution'
}

export enum DistributionEventTrackingFlowDirection {
  BackToBox = 'BackToBox',
  In = 'In',
  Out = 'Out'
}

export enum DistributionEventsTrackingGroupState {
  Completed = 'Completed',
  InProgress = 'InProgress'
}

export enum HumanGender {
  Diverse = 'Diverse',
  Female = 'Female',
  Male = 'Male'
}

/** Language codes. */
export enum Language {
  Ar = 'ar',
  Ckb = 'ckb',
  De = 'de',
  En = 'en',
  Fr = 'fr',
  Nl = 'nl'
}

export enum PackingListEntryState {
  NotStarted = 'NotStarted',
  Packed = 'Packed',
  PackingInProgress = 'PackingInProgress'
}

/** Classificators for [`Product`]({{Types.Product}}) gender. */
export enum ProductGender {
  Boy = 'Boy',
  Girl = 'Girl',
  Men = 'Men',
  TeenBoy = 'TeenBoy',
  TeenGirl = 'TeenGirl',
  UnisexAdult = 'UnisexAdult',
  UnisexBaby = 'UnisexBaby',
  UnisexKid = 'UnisexKid',
  Women = 'Women',
  None = 'none'
}

export type Query = {
  __typename?: 'Query';
  beneficiaryDemographics?: Maybe<Array<Maybe<BeneficiaryDemographicsResult>>>;
};


export type QueryBeneficiaryDemographicsArgs = {
  baseIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export enum ShipmentState {
  Canceled = 'Canceled',
  Completed = 'Completed',
  Lost = 'Lost',
  Preparing = 'Preparing',
  Receiving = 'Receiving',
  Sent = 'Sent'
}

/** Classificators for [`Tag`]({{Types.Tag}}) type. */
export enum TagType {
  All = 'All',
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

/** Classificator for resources that a [`Tag`]({{Types.Tag}}) can be applied to (according to [`TaggableResource`]({{Types.TaggableResource}})). */
export enum TaggableResourceType {
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

export enum TransferAgreementState {
  Accepted = 'Accepted',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Rejected = 'Rejected',
  UnderReview = 'UnderReview'
}

export enum TransferAgreementType {
  Bidirectional = 'Bidirectional',
  ReceivingFrom = 'ReceivingFrom',
  SendingTo = 'SendingTo'
}

export type BeneficiaryDemographicsQueryVariables = Exact<{ [key: string]: never; }>;


export type BeneficiaryDemographicsQuery = { __typename?: 'Query', beneficiaryDemographics?: Array<{ __typename?: 'BeneficiaryDemographicsResult', age?: number | null, gender?: HumanGender | null, createdOn?: any | null, count?: number | null } | null> | null };


export const BeneficiaryDemographicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BeneficiaryDemographics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaryDemographics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<BeneficiaryDemographicsQuery, BeneficiaryDemographicsQueryVariables>;