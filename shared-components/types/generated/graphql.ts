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
  NotDelivered = 'NotDelivered',
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

export type Dimensions = BeneficiaryDemographicsDimensions | CreatedBoxDataDimensions | MovedBoxDataDimensions | StockOverviewDataDimensions | TopProductsDimensions;

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

export type MovedBoxDataDimensions = {
  __typename?: 'MovedBoxDataDimensions';
  category?: Maybe<Array<Maybe<DimensionInfo>>>;
  size?: Maybe<Array<Maybe<DimensionInfo>>>;
  tag: Array<TagDimensionInfo>;
  target?: Maybe<Array<Maybe<TargetDimensionInfo>>>;
};

export type MovedBoxesData = DataCube & {
  __typename?: 'MovedBoxesData';
  dimensions?: Maybe<MovedBoxDataDimensions>;
  facts?: Maybe<Array<Maybe<MovedBoxesResult>>>;
};

/**
 * A box can be moved in various ways:
 * - within a base (location ID with InStock/Donated)
 * - because it's lost (Lost)
 * - because it becomes scrap (Scrap)
 * - because it's about to be shipped (target base ID with MarkedForShipment)
 * - because it's being shipped (target base ID with InTransit/Receiving)
 */
export type MovedBoxesResult = {
  __typename?: 'MovedBoxesResult';
  boxesCount: Scalars['Int']['output'];
  categoryId: Scalars['Int']['output'];
  gender: ProductGender;
  itemsCount: Scalars['Int']['output'];
  movedOn: Scalars['Date']['output'];
  productName: Scalars['String']['output'];
  sizeId: Scalars['Int']['output'];
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
  targetId: Scalars['ID']['output'];
};

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
  movedBoxes?: Maybe<MovedBoxesData>;
  stockOverview?: Maybe<StockOverviewData>;
  topProductsCheckedOut?: Maybe<TopProductsCheckedOutData>;
  topProductsDonated?: Maybe<TopProductsDonatedData>;
};


export type QueryBeneficiaryDemographicsArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryCreatedBoxesArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryMovedBoxesArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryStockOverviewArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTopProductsCheckedOutArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTopProductsDonatedArgs = {
  baseId: Scalars['Int']['input'];
};

export type Result = BeneficiaryDemographicsResult | CreatedBoxesResult | MovedBoxesResult | StockOverviewResult | TopProductsCheckedOutResult | TopProductsDonatedResult;

export enum ShipmentState {
  Canceled = 'Canceled',
  Completed = 'Completed',
  Lost = 'Lost',
  Preparing = 'Preparing',
  Receiving = 'Receiving',
  Sent = 'Sent'
}

export type StockOverviewData = DataCube & {
  __typename?: 'StockOverviewData';
  dimensions: StockOverviewDataDimensions;
  facts: Array<StockOverviewResult>;
};

export type StockOverviewDataDimensions = {
  __typename?: 'StockOverviewDataDimensions';
  category: Array<DimensionInfo>;
  location: Array<DimensionInfo>;
  size: Array<DimensionInfo>;
  tag: Array<TagDimensionInfo>;
};

export type StockOverviewResult = {
  __typename?: 'StockOverviewResult';
  boxState: BoxState;
  boxesCount: Scalars['Int']['output'];
  categoryId: Scalars['Int']['output'];
  gender: ProductGender;
  itemsCount: Scalars['Int']['output'];
  locationId: Scalars['Int']['output'];
  productName: Scalars['String']['output'];
  sizeId: Scalars['Int']['output'];
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
};

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

export type TargetDimensionInfo = BasicDimensionInfo & {
  __typename?: 'TargetDimensionInfo';
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<TargetType>;
};

export enum TargetType {
  BoxState = 'BoxState',
  OutgoingLocation = 'OutgoingLocation',
  Shipment = 'Shipment'
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

export type MovedBoxesQueryVariables = Exact<{
  baseId: Scalars['Int']['input'];
}>;


export type MovedBoxesQuery = { __typename?: 'Query', movedBoxes?: { __typename?: 'MovedBoxesData', facts?: Array<{ __typename?: 'MovedBoxesResult', movedOn: any, targetId: string, categoryId: number, boxesCount: number } | null> | null, dimensions?: { __typename?: 'MovedBoxDataDimensions', category?: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null } | null> | null, target?: Array<{ __typename?: 'TargetDimensionInfo', id?: string | null, name?: string | null, type?: TargetType | null } | null> | null } | null } | null };

export type StockOverviewQueryVariables = Exact<{
  baseId: Scalars['Int']['input'];
}>;


export type StockOverviewQuery = { __typename?: 'Query', stockOverview?: { __typename?: 'StockOverviewData', facts: Array<{ __typename?: 'StockOverviewResult', productName: string, categoryId: number, gender: ProductGender, boxesCount: number, itemsCount: number, sizeId: number, tagIds?: Array<number> | null, boxState: BoxState, locationId: number }>, dimensions: { __typename?: 'StockOverviewDataDimensions', category: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null }>, size: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null }>, tag: Array<{ __typename?: 'TagDimensionInfo', id?: string | null, name?: string | null }>, location: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null }> } } | null };

export type CreatedBoxesQueryVariables = Exact<{
  baseId: Scalars['Int']['input'];
}>;


export type CreatedBoxesQuery = { __typename?: 'Query', createdBoxes?: { __typename?: 'CreatedBoxesData', facts?: Array<{ __typename?: 'CreatedBoxesResult', boxesCount?: number | null, productId?: number | null, categoryId?: number | null, createdOn?: any | null, gender?: ProductGender | null, itemsCount?: number | null } | null> | null, dimensions?: { __typename?: 'CreatedBoxDataDimensions', product?: Array<{ __typename?: 'ProductDimensionInfo', id?: string | null, name?: string | null } | null> | null, category?: Array<{ __typename?: 'DimensionInfo', id?: string | null, name?: string | null } | null> | null } | null } | null };

export type BeneficiaryDemographicsQueryVariables = Exact<{
  baseId: Scalars['Int']['input'];
}>;


export type BeneficiaryDemographicsQuery = { __typename?: 'Query', beneficiaryDemographics?: { __typename?: 'BeneficiaryDemographicsData', facts?: Array<{ __typename?: 'BeneficiaryDemographicsResult', count?: number | null, createdOn?: any | null, age?: number | null, gender?: HumanGender | null } | null> | null, dimensions?: { __typename?: 'BeneficiaryDemographicsDimensions', tag?: Array<{ __typename?: 'TagDimensionInfo', name?: string | null, id?: string | null } | null> | null } | null } | null };


export const MovedBoxesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"movedBoxes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"movedBoxes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"movedOn"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"boxesCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MovedBoxesQuery, MovedBoxesQueryVariables>;
export const StockOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"stockOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stockOverview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"boxesCount"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}},{"kind":"Field","name":{"kind":"Name","value":"sizeId"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"boxState"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"size"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StockOverviewQuery, StockOverviewQueryVariables>;
export const CreatedBoxesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"createdBoxes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdBoxes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boxesCount"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreatedBoxesQuery, CreatedBoxesQueryVariables>;
export const BeneficiaryDemographicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BeneficiaryDemographics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaryDemographics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"baseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"createdOn"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<BeneficiaryDemographicsQuery, BeneficiaryDemographicsQueryVariables>;