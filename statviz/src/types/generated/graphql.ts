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

export type BasicDimensionInfo = {
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type BeneficiaryDemographicsData = DataCube & {
  __typename?: 'BeneficiaryDemographicsData';
  dimensions?: Maybe<BeneficiaryDemographicsDimensions>;
  facts?: Maybe<Array<Maybe<BeneficiaryDemographicsResult>>>;
};

export type BeneficiaryDemographicsDimensions = {
  __typename?: 'BeneficiaryDemographicsDimensions';
  tag?: Maybe<Array<Maybe<TagDimensionInfo>>>;
};

export type BeneficiaryDemographicsResult = {
  __typename?: 'BeneficiaryDemographicsResult';
  age?: Maybe<Scalars['Int']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  createdOn?: Maybe<Scalars['Date']['output']>;
  gender?: Maybe<HumanGender>;
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
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

export type CreatedBoxDataDimensions = {
  __typename?: 'CreatedBoxDataDimensions';
  category?: Maybe<Array<Maybe<DimensionInfo>>>;
  product?: Maybe<Array<Maybe<ProductDimensionInfo>>>;
};

export type CreatedBoxesData = DataCube & {
  __typename?: 'CreatedBoxesData';
  dimensions?: Maybe<CreatedBoxDataDimensions>;
  facts?: Maybe<Array<Maybe<CreatedBoxesResult>>>;
};

export type CreatedBoxesResult = {
  __typename?: 'CreatedBoxesResult';
  boxesCount?: Maybe<Scalars['Int']['output']>;
  categoryId?: Maybe<Scalars['Int']['output']>;
  createdOn?: Maybe<Scalars['Date']['output']>;
  gender?: Maybe<ProductGender>;
  itemsCount?: Maybe<Scalars['Int']['output']>;
  productId?: Maybe<Scalars['Int']['output']>;
};

export type DataCube = {
  dimensions?: Maybe<Dimensions>;
  facts?: Maybe<Array<Maybe<Result>>>;
};

export type DimensionInfo = BasicDimensionInfo & {
  __typename?: 'DimensionInfo';
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Dimensions = BeneficiaryDemographicsDimensions | CreatedBoxDataDimensions | TopProductsDimensions;

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

export type ProductDimensionInfo = BasicDimensionInfo & {
  __typename?: 'ProductDimensionInfo';
  gender?: Maybe<ProductGender>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

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
  beneficiaryDemographics?: Maybe<BeneficiaryDemographicsData>;
  createdBoxes?: Maybe<CreatedBoxesData>;
  topProductsCheckedOut?: Maybe<TopProductsCheckedOutData>;
  topProductsDonated?: Maybe<TopProductsDonatedData>;
};


export type QueryBeneficiaryDemographicsArgs = {
  baseIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryCreatedBoxesArgs = {
  baseId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTopProductsCheckedOutArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTopProductsDonatedArgs = {
  baseId: Scalars['Int']['input'];
};

export type Result = BeneficiaryDemographicsResult | CreatedBoxesResult | TopProductsCheckedOutResult | TopProductsDonatedResult;

export enum ShipmentState {
  Canceled = 'Canceled',
  Completed = 'Completed',
  Lost = 'Lost',
  Preparing = 'Preparing',
  Receiving = 'Receiving',
  Sent = 'Sent'
}

export type TagDimensionInfo = BasicDimensionInfo & {
  __typename?: 'TagDimensionInfo';
  /**  Hex color code  */
  color?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

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

export type TopProductsCheckedOutData = DataCube & {
  __typename?: 'TopProductsCheckedOutData';
  dimensions?: Maybe<TopProductsDimensions>;
  facts?: Maybe<Array<Maybe<TopProductsCheckedOutResult>>>;
};

export type TopProductsCheckedOutResult = {
  __typename?: 'TopProductsCheckedOutResult';
  categoryId?: Maybe<Scalars['Int']['output']>;
  checkedOutOn?: Maybe<Scalars['Date']['output']>;
  itemsCount?: Maybe<Scalars['Int']['output']>;
  productId?: Maybe<Scalars['Int']['output']>;
  rank?: Maybe<Scalars['Int']['output']>;
};

export type TopProductsDimensions = {
  __typename?: 'TopProductsDimensions';
  category?: Maybe<Array<Maybe<DimensionInfo>>>;
  product?: Maybe<Array<Maybe<ProductDimensionInfo>>>;
  /**  Always null for topProductsCheckedOut query  */
  size?: Maybe<Array<Maybe<DimensionInfo>>>;
};

export type TopProductsDonatedData = DataCube & {
  __typename?: 'TopProductsDonatedData';
  dimensions?: Maybe<TopProductsDimensions>;
  facts?: Maybe<Array<Maybe<TopProductsDonatedResult>>>;
};

export type TopProductsDonatedResult = {
  __typename?: 'TopProductsDonatedResult';
  categoryId?: Maybe<Scalars['Int']['output']>;
  createdOn?: Maybe<Scalars['Date']['output']>;
  donatedOn?: Maybe<Scalars['Date']['output']>;
  itemsCount?: Maybe<Scalars['Int']['output']>;
  productId?: Maybe<Scalars['Int']['output']>;
  rank?: Maybe<Scalars['Int']['output']>;
  sizeId?: Maybe<Scalars['Int']['output']>;
};

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

export type CreatedBoxesQueryVariables = Exact<{
  baseId: Scalars['Int']['input'];
}>;


export type CreatedBoxesQuery = { __typename?: 'Query', createdBoxes?: { __typename?: 'CreatedBoxesData', facts?: Array<{ __typename?: 'CreatedBoxesResult', boxesCount?: number | null, productId?: number | null, categoryId?: number | null, createdOn?: any | null, gender?: ProductGender | null, itemsCount?: number | null } | null> | null, dimensions?: { __typename?: 'CreatedBoxDataDimensions', product?: Array<{ __typename?: 'ProductDimensionInfo', id?: string | null, name?: string | null } | null> | null, category?: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null } | null> | null } | null } | null };

export type BeneficiaryDemographicsQueryVariables = Exact<{ [key: string]: never; }>;


export type BeneficiaryDemographicsQuery = { __typename?: 'Query', beneficiaryDemographics?: { __typename?: 'BeneficiaryDemographicsData', facts?: Array<{ __typename?: 'BeneficiaryDemographicsResult', count?: number | null, createdOn?: any | null, age?: number | null, gender?: HumanGender | null } | null> | null, dimensions?: { __typename?: 'BeneficiaryDemographicsDimensions', tag?: Array<{ __typename?: 'TagDimensionInfo', name?: string | null, id?: string | null } | null> | null } | null } | null };


export const CreatedBoxesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"createdBoxes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdBoxes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boxesCount"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreatedBoxesQuery, CreatedBoxesQueryVariables>;
export const BeneficiaryDemographicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BeneficiaryDemographics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaryDemographics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<BeneficiaryDemographicsQuery, BeneficiaryDemographicsQueryVariables>;