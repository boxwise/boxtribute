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

export type AssignTagToBoxesResult = BoxesResult | DeletedTagError | InsufficientPermissionError | ResourceDoesNotExistError | TagTypeMismatchError | UnauthorizedForBaseError;

/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type Base = {
  __typename?: 'Base';
  /**  List of all [`Beneficiaries`]({{Types.Beneficiary}}) registered in this base. Optionally pass filters  */
  beneficiaries?: Maybe<BeneficiaryPage>;
  currencyName?: Maybe<Scalars['String']['output']>;
  deletedOn?: Maybe<Scalars['Datetime']['output']>;
  distributionEvents: Array<DistributionEvent>;
  distributionEventsBeforeReturnedFromDistributionState: Array<DistributionEvent>;
  distributionEventsInReturnedFromDistributionState: Array<DistributionEvent>;
  distributionEventsStatistics: Array<DistributionEventsStatistics>;
  distributionEventsTrackingGroups: Array<DistributionEventsTrackingGroup>;
  distributionSpots: Array<DistributionSpot>;
  id: Scalars['ID']['output'];
  /**  List of all non-deleted [`ClassicLocations`]({{Types.ClassicLocation}}) present in this base  */
  locations: Array<ClassicLocation>;
  name: Scalars['String']['output'];
  organisation: Organisation;
  /**  List of all non-deleted [`Products`]({{Types.Product}}) registered in this base  */
  products: Array<Product>;
  /**  List of all non-deleted [`Tags`]({{Types.Tag}}) registered in this base. Optionally filter for a [`resource type`]({{Types.TaggableResourceType}})  */
  tags?: Maybe<Array<Tag>>;
};


/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type BaseBeneficiariesArgs = {
  filterInput?: InputMaybe<FilterBeneficiaryInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};


/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type BaseDistributionEventsArgs = {
  states?: InputMaybe<Array<DistributionEventState>>;
};


/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type BaseDistributionEventsTrackingGroupsArgs = {
  states?: InputMaybe<Array<DistributionEventsTrackingGroupState>>;
};


/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type BaseProductsArgs = {
  filterInput?: InputMaybe<FilterProductInput>;
};


/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type BaseTagsArgs = {
  resourceType?: InputMaybe<TaggableResourceType>;
};

export type BasicDimensionInfo = {
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/**
 * Representation of a beneficiary.
 * The beneficiary is registered in a specific [`Base`]({{Types.Base}}).
 */
export type Beneficiary = {
  __typename?: 'Beneficiary';
  active: Scalars['Boolean']['output'];
  /**  If dateOfBirth is not set, age will be null.  */
  age?: Maybe<Scalars['Int']['output']>;
  base?: Maybe<Base>;
  comment?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']['output']>;
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  dateOfSignature?: Maybe<Scalars['Date']['output']>;
  /**  Null if this beneficiary is the family head  */
  familyHead?: Maybe<Beneficiary>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<HumanGender>;
  /**  All members of a family have the same group identifier  */
  groupIdentifier: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isVolunteer: Scalars['Boolean']['output'];
  languages?: Maybe<Array<Language>>;
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']['output']>;
  lastName: Scalars['String']['output'];
  registered: Scalars['Boolean']['output'];
  signature?: Maybe<Scalars['String']['output']>;
  signed: Scalars['Boolean']['output'];
  tags?: Maybe<Array<Tag>>;
  /**  Number of tokens the beneficiary holds (sum of all transaction values)  */
  tokens?: Maybe<Scalars['Int']['output']>;
  /**  List of all [`Transactions`]({{Types.Transaction}}) that this beneficiary executed  */
  transactions?: Maybe<Array<Transaction>>;
};

export type BeneficiaryCreationInput = {
  baseId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth: Scalars['Date']['input'];
  dateOfSignature?: InputMaybe<Scalars['Date']['input']>;
  familyHeadId?: InputMaybe<Scalars['Int']['input']>;
  firstName: Scalars['String']['input'];
  gender: HumanGender;
  groupIdentifier: Scalars['String']['input'];
  isVolunteer: Scalars['Boolean']['input'];
  languages?: InputMaybe<Array<Language>>;
  lastName: Scalars['String']['input'];
  registered: Scalars['Boolean']['input'];
  signature?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
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
  deletedOn?: Maybe<Scalars['Date']['output']>;
  gender?: Maybe<HumanGender>;
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
};

/** Utility type holding a page of [`Beneficiaries`]({{Types.Beneficiary}}). */
export type BeneficiaryPage = {
  __typename?: 'BeneficiaryPage';
  elements?: Maybe<Array<Beneficiary>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BeneficiaryUpdateInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  dateOfSignature?: InputMaybe<Scalars['Date']['input']>;
  familyHeadId?: InputMaybe<Scalars['Int']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<HumanGender>;
  groupIdentifier?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isVolunteer?: InputMaybe<Scalars['Boolean']['input']>;
  languages?: InputMaybe<Array<Language>>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  registered?: InputMaybe<Scalars['Boolean']['input']>;
  signature?: InputMaybe<Scalars['String']['input']>;
};

/** Representation of a box storing items of a [`Product`]({{Types.Product}}) in a [`Location`]({{Types.Location}}) */
export type Box = ItemsCollection & {
  __typename?: 'Box';
  comment?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']['output']>;
  deletedOn?: Maybe<Scalars['Datetime']['output']>;
  /**  Information about the unit that the measure shall be displayed in. If the box holds a product with size (e.g. clothing), its unit is null  */
  displayUnit?: Maybe<Unit>;
  distributionEvent?: Maybe<DistributionEvent>;
  /**  Sorted by date, newest first  */
  history?: Maybe<Array<HistoryEntry>>;
  id: Scalars['ID']['output'];
  /**  Sequence of numbers for identifying the box, usually written on box label  */
  labelIdentifier: Scalars['String']['output'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']['output']>;
  /**  If the client is not authorized to access the location's base, return `null` instead of raising an authorization error. This enables the target side of a shipment to scan boxes that are not yet reconciliated into their stock (but still registered at the source side)  */
  location?: Maybe<Location>;
  /**  The value of the measure, expressed in ``unit``. If the box holds a product with size (e.g. clothing), its measure value is null  */
  measureValue?: Maybe<Scalars['Float']['output']>;
  numberOfItems?: Maybe<Scalars['Int']['output']>;
  /**  If the client is not authorized to access the product's base, return `null` instead of raising an authorization error. This enables the target side of a shipment to scan boxes that are not yet reconciliated into their stock (but still registered at the source side)  */
  product?: Maybe<Product>;
  qrCode?: Maybe<QrCode>;
  /**  Returns null if box is not part of an active shipment  */
  shipmentDetail?: Maybe<ShipmentDetail>;
  /**  If the box holds a 'measure' product (i.e. classified by a package measure like 500gr), its size is null  */
  size?: Maybe<Size>;
  state: BoxState;
  tags?: Maybe<Array<Tag>>;
};

export type BoxAssignTagInput = {
  labelIdentifiers: Array<Scalars['String']['input']>;
  tagId: Scalars['Int']['input'];
};

export type BoxCreationInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  displayUnitId?: InputMaybe<Scalars['Int']['input']>;
  locationId: Scalars['Int']['input'];
  measureValue?: InputMaybe<Scalars['Float']['input']>;
  numberOfItems?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  qrCode?: InputMaybe<Scalars['String']['input']>;
  sizeId?: InputMaybe<Scalars['Int']['input']>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type BoxMoveInput = {
  labelIdentifiers: Array<Scalars['String']['input']>;
  locationId: Scalars['Int']['input'];
};

/** Utility type holding a page of [`Boxes`]({{Types.Box}}). */
export type BoxPage = {
  __typename?: 'BoxPage';
  elements: Array<Box>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BoxResult = Box | InsufficientPermissionError | UnauthorizedForBaseError;

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

export type BoxUpdateInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  displayUnitId?: InputMaybe<Scalars['Int']['input']>;
  labelIdentifier: Scalars['String']['input'];
  locationId?: InputMaybe<Scalars['Int']['input']>;
  measureValue?: InputMaybe<Scalars['Float']['input']>;
  numberOfItems?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  sizeId?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<BoxState>;
  /**  List of all tags that shall be assigned to the box. Any requested tags already assigned to the box will not be assigned again  */
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /**  List of tags that shall be assigned in addition to already assigned tags. Any requested tags already assigned to the box will not be assigned again  */
  tagIdsToBeAdded?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Utility response type for box bulk-update mutations, containing both updated boxes and invalid boxes (ignored due to e.g. being deleted, in prohibited base, and/or non-existing). */
export type BoxesResult = {
  __typename?: 'BoxesResult';
  invalidBoxLabelIdentifiers: Array<Scalars['String']['output']>;
  updatedBoxes: Array<Box>;
};

export type BoxesStillAssignedToProductError = {
  __typename?: 'BoxesStillAssignedToProductError';
  labelIdentifiers: Array<Scalars['String']['output']>;
};

/**
 * Representation of a classic physical location used to store [`Boxes`]({{Types.Box}}) (e.g. a warehouse).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
export type ClassicLocation = Location & {
  __typename?: 'ClassicLocation';
  base?: Maybe<Base>;
  /**  List of all [`Boxes`]({{Types.Box}}) (incl. deleted) in this classic location  */
  boxes?: Maybe<BoxPage>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']['output']>;
  /**  Default state for boxes in this classic location */
  defaultBoxState?: Maybe<BoxState>;
  id: Scalars['ID']['output'];
  isShop: Scalars['Boolean']['output'];
  isStockroom: Scalars['Boolean']['output'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /**  Used for ordering purposes  */
  seq?: Maybe<Scalars['Int']['output']>;
};


/**
 * Representation of a classic physical location used to store [`Boxes`]({{Types.Box}}) (e.g. a warehouse).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
export type ClassicLocationBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

export type CreateCustomProductResult = EmptyNameError | InsufficientPermissionError | InvalidPriceError | Product | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type CreatedBoxDataDimensions = {
  __typename?: 'CreatedBoxDataDimensions';
  category?: Maybe<Array<Maybe<DimensionInfo>>>;
  product?: Maybe<Array<Maybe<ProductDimensionInfo>>>;
  tag?: Maybe<Array<Maybe<TagDimensionInfo>>>;
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
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
};

export type CustomProductCreationInput = {
  baseId: Scalars['Int']['input'];
  categoryId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  gender: ProductGender;
  inShop?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Int']['input']>;
  sizeRangeId: Scalars['Int']['input'];
};

export type CustomProductEditInput = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<ProductGender>;
  id: Scalars['ID']['input'];
  inShop?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  sizeRangeId?: InputMaybe<Scalars['Int']['input']>;
};

export type DataCube = {
  dimensions?: Maybe<Dimensions>;
  facts?: Maybe<Array<Maybe<Result>>>;
};

export type DeleteBoxesResult = BoxesResult | InsufficientPermissionError;

export type DeleteProductResult = BoxesStillAssignedToProductError | InsufficientPermissionError | Product | ProductTypeMismatchError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type DeletedLocationError = {
  __typename?: 'DeletedLocationError';
  name: Scalars['String']['output'];
};

export type DeletedTagError = {
  __typename?: 'DeletedTagError';
  name: Scalars['String']['output'];
};

export type DimensionInfo = BasicDimensionInfo & {
  __typename?: 'DimensionInfo';
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Dimensions = BeneficiaryDemographicsDimensions | CreatedBoxDataDimensions | MovedBoxDataDimensions | StockOverviewDataDimensions | TopProductsDimensions;

export type DisableStandardProductResult = BoxesStillAssignedToProductError | InsufficientPermissionError | Product | ProductTypeMismatchError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type DistributionEvent = {
  __typename?: 'DistributionEvent';
  boxes: Array<Box>;
  distributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  distributionSpot?: Maybe<DistributionSpot>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  packingListEntries: Array<PackingListEntry>;
  plannedEndDateTime: Scalars['Datetime']['output'];
  plannedStartDateTime: Scalars['Datetime']['output'];
  state: DistributionEventState;
  unboxedItemsCollections: Array<UnboxedItemsCollection>;
};

export type DistributionEventCreationInput = {
  distributionSpotId: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  plannedEndDateTime?: InputMaybe<Scalars['Datetime']['input']>;
  plannedStartDateTime: Scalars['Datetime']['input'];
};

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

export type DistributionEventsStatistics = {
  __typename?: 'DistributionEventsStatistics';
  categoryLabel: Scalars['String']['output'];
  distroEventTrackingGroupId: Scalars['String']['output'];
  earliestPossibleDistroDate: Scalars['String']['output'];
  genderLabel: Scalars['String']['output'];
  inflow: Scalars['Int']['output'];
  involvedDistributionEventIds: Scalars['String']['output'];
  latestPossibleDistroDate: Scalars['String']['output'];
  outflow: Scalars['Int']['output'];
  potentiallyInvolvedDistributionSpots: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  sizeId: Scalars['String']['output'];
  sizeLabel: Scalars['String']['output'];
};

export type DistributionEventsTrackingEntry = {
  __typename?: 'DistributionEventsTrackingEntry';
  dateTimeOfTracking: Scalars['Datetime']['output'];
  distributionEventsTrackingGroup: DistributionEventsTrackingGroup;
  flowDirection: DistributionEventTrackingFlowDirection;
  id: Scalars['ID']['output'];
  numberOfItems: Scalars['Int']['output'];
  product: Product;
  size: Size;
};

export type DistributionEventsTrackingGroup = {
  __typename?: 'DistributionEventsTrackingGroup';
  createdOn: Scalars['Datetime']['output'];
  distributionEvents: Array<DistributionEvent>;
  distributionEventsTrackingEntries: Array<DistributionEventsTrackingEntry>;
  id: Scalars['ID']['output'];
  state: DistributionEventsTrackingGroupState;
};

export enum DistributionEventsTrackingGroupState {
  Completed = 'Completed',
  InProgress = 'InProgress'
}

export type DistributionSpot = Location & {
  __typename?: 'DistributionSpot';
  base?: Maybe<Base>;
  /**  Not implemented, only for compatibility with Location interface  */
  boxes?: Maybe<BoxPage>;
  comment: Scalars['String']['output'];
  distributionEvents: Array<DistributionEvent>;
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};


export type DistributionSpotBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

export type DistributionSpotCreationInput = {
  baseId: Scalars['Int']['input'];
  comment: Scalars['String']['input'];
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type EditCustomProductResult = EmptyNameError | InsufficientPermissionError | InvalidPriceError | Product | ProductTypeMismatchError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type EditStandardProductInstantiationResult = InsufficientPermissionError | InvalidPriceError | Product | ProductTypeMismatchError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type EmptyNameError = {
  __typename?: 'EmptyNameError';
  /**  Dummy field since type definitions without fields are not possible  */
  _?: Maybe<Scalars['Boolean']['output']>;
};

export type EnableStandardProductResult = InsufficientPermissionError | InvalidPriceError | Product | ResourceDoesNotExistError | StandardProductAlreadyEnabledForBaseError | UnauthorizedForBaseError;

export type FilterBaseInput = {
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Optional filter values when retrieving [`Beneficiaries`]({{Types.Beneficiary}}).
 * If several fields are defined (not null), they are combined into a filter expression using logical AND (i.e. the filter returns only elements for which *all* fields are true).
 */
export type FilterBeneficiaryInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  /**  Filter for all beneficiaries who were created on this date (incl.), or later.  */
  createdFrom?: InputMaybe<Scalars['Date']['input']>;
  /**  Filter for all beneficiaries who were created on this date (incl.), or earlier.  */
  createdUntil?: InputMaybe<Scalars['Date']['input']>;
  isVolunteer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter for all beneficiaries where pattern is (case-insensitive) part of first name, last name, or comment, or where pattern matches the group identifier */
  pattern?: InputMaybe<Scalars['String']['input']>;
  registered?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Optional filter values when retrieving [`Boxes`]({{Types.Box}}).
 * If several fields are defined (not null), they are combined into a filter expression using logical AND (i.e. the filter returns only elements for which *all* fields are true).
 */
export type FilterBoxInput = {
  /**  Filter for all boxes that who were last modified on this date (incl.), or later.  */
  lastModifiedFrom?: InputMaybe<Scalars['Date']['input']>;
  /**  Filter for all boxes that who were last modified on this date (incl.), or earlier.  */
  lastModifiedUntil?: InputMaybe<Scalars['Date']['input']>;
  productCategoryId?: InputMaybe<Scalars['Int']['input']>;
  productGender?: InputMaybe<ProductGender>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  sizeId?: InputMaybe<Scalars['Int']['input']>;
  /**  Filter for all boxes that have *one* of the specified states.  */
  states?: InputMaybe<Array<BoxState>>;
  /**  Filter for all boxes that have *at least one* of the specified tags.  */
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type FilterProductInput = {
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<ProductTypeFilter>;
};

export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  changeDate?: Maybe<Scalars['Datetime']['output']>;
  changes: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  user?: Maybe<User>;
};

export enum HumanGender {
  Diverse = 'Diverse',
  Female = 'Female',
  Male = 'Male'
}

export type InsufficientPermissionError = {
  __typename?: 'InsufficientPermissionError';
  /**  e.g. 'product:write' missing  */
  name: Scalars['String']['output'];
};

export type InvalidPriceError = {
  __typename?: 'InvalidPriceError';
  value: Scalars['Int']['output'];
};

export type ItemsCollection = {
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  numberOfItems?: Maybe<Scalars['Int']['output']>;
  product?: Maybe<Product>;
  size?: Maybe<Size>;
};

/** Language codes. */
export enum Language {
  Ar = 'ar',
  Ckb = 'ckb',
  De = 'de',
  En = 'en',
  Fr = 'fr',
  Nl = 'nl'
}

export type Location = {
  base?: Maybe<Base>;
  boxes?: Maybe<BoxPage>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};


export type LocationBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

export type Metrics = {
  __typename?: 'Metrics';
  /**  Like `numberOfFamiliesServed` but add up all members of served families  */
  numberOfBeneficiariesServed?: Maybe<Scalars['Int']['output']>;
  /**
   * Return number of families served by client's organisation in optional date range.
   * If `after` *and* `before` are specified, construct date range for filtering.
   * If one of `after` or `before` is specified, construct half-open date range.
   * If none is specified, the result is an all-time number.
   */
  numberOfFamiliesServed?: Maybe<Scalars['Int']['output']>;
  /**
   * Return number of sales performed by client's organisation in optional date range.
   * See `numberOfFamiliesServed` about using the `after` and `before` parameters.
   */
  numberOfSales?: Maybe<Scalars['Int']['output']>;
  /** Return number of boxes, and number of contained items, managed by client's organisation. */
  stockOverview?: Maybe<StockOverview>;
};


export type MetricsNumberOfBeneficiariesServedArgs = {
  after?: InputMaybe<Scalars['Date']['input']>;
  before?: InputMaybe<Scalars['Date']['input']>;
};


export type MetricsNumberOfFamiliesServedArgs = {
  after?: InputMaybe<Scalars['Date']['input']>;
  before?: InputMaybe<Scalars['Date']['input']>;
};


export type MetricsNumberOfSalesArgs = {
  after?: InputMaybe<Scalars['Date']['input']>;
  before?: InputMaybe<Scalars['Date']['input']>;
};

export type MoveBoxesResult = BoxesResult | DeletedLocationError | InsufficientPermissionError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type MovedBoxDataDimensions = {
  __typename?: 'MovedBoxDataDimensions';
  category?: Maybe<Array<Maybe<DimensionInfo>>>;
  /**  'Dimension' in the sense of Mass or Volume  */
  dimension: Array<DimensionInfo>;
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
  /**  Null for boxes with size-product  */
  absoluteMeasureValue?: Maybe<Scalars['Float']['output']>;
  boxesCount: Scalars['Int']['output'];
  categoryId: Scalars['Int']['output'];
  /**  'Dimension' in the sense of Mass or Volume; null for boxes with size-product  */
  dimensionId?: Maybe<Scalars['Int']['output']>;
  gender: ProductGender;
  itemsCount: Scalars['Int']['output'];
  movedOn: Scalars['Date']['output'];
  /**  Shipment target organisation name; null for BoxState/OutgoingLocation target types  */
  organisationName?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  /**  Null for boxes with measure-product  */
  sizeId?: Maybe<Scalars['Int']['output']>;
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
  targetId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /**  Change state of specified transfer agreement to `Accepted`. Only valid for agreements in `UnderReview` state. The client must be member of all agreement target bases.  */
  acceptTransferAgreement?: Maybe<TransferAgreement>;
  addPackingListEntryToDistributionEvent?: Maybe<PackingListEntry>;
  assignBoxToDistributionEvent?: Maybe<Box>;
  /**  Assign a tag to a resource (box or beneficiary). If the resource already has this tag assigned, do nothing  */
  assignTag?: Maybe<TaggableResource>;
  /**  Any boxes that are non-existing, already assigned to the requested tag, and/or in a base that the user must not access are returned in the `BoxesResult.invalidBoxLabelIdentifiers` list.  */
  assignTagToBoxes?: Maybe<AssignTagToBoxesResult>;
  /**  Change state of specified shipment to `Canceled`. Only valid for shipments in `Preparing` state. Any boxes marked for shipment are moved back into stock. The client must be member of either source or target base of the shipment.  */
  cancelShipment?: Maybe<Shipment>;
  /**  Change state of specified transfer agreement to `Canceled`. Only valid for agreements in `UnderReview` or `Accepted` state. The client must be member of either all agreement target bases or all agreement source bases.  */
  cancelTransferAgreement?: Maybe<TransferAgreement>;
  changeDistributionEventState?: Maybe<DistributionEvent>;
  completeDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  /**  Create a new beneficiary in a base, using first/last name, date of birth, and group identifier. Optionally pass tags to assign to the beneficiary.  */
  createBeneficiary?: Maybe<Beneficiary>;
  /**  Create a new box in a location, containing items of certain product and size. Optionally pass tags to assign to the box.  */
  createBox?: Maybe<Box>;
  /**  Create a new custom product in a base, specifying properties like name, gender, size range, and price. Return errors in case of invalid input. The client must be member of the specified base.  */
  createCustomProduct?: Maybe<CreateCustomProductResult>;
  createDistributionEvent?: Maybe<DistributionEvent>;
  createDistributionSpot?: Maybe<DistributionSpot>;
  createQrCode?: Maybe<QrCode>;
  /**  Create a new shipment between two bases. The specified transfer agreement must be in `Accepted` state. The client must be member of the specified source base.  */
  createShipment?: Maybe<Shipment>;
  /**  Create a new tag for a base, described by name, color and type.  */
  createTag?: Maybe<Tag>;
  /**  Create new transfer agreement with with a partner organisation (the client's organisation is the initiating organisation). By default, the agreement is established with non-deleted bases of the partner organisation, and is infinitely valid. As a result, any base added to that organisation afterwards will NOT be part of the agreement; instead a new agreement needs to be established. If an accepted agreement with the same set of organisations and bases already exists, an error is returned. The client must be member of all bases of the initiating organisation.   */
  createTransferAgreement?: Maybe<TransferAgreement>;
  /**  Deactivate beneficiary with specified ID.  */
  deactivateBeneficiary?: Maybe<Beneficiary>;
  /**  Any boxes that are non-existing, already deleted, in a non-warehouse [`BoxState`]({{Types.BoxState}}) (MarkedForShipment, InTransit, Receiving, NotDelivered) and/or in a base that the user must not access are returned in the `BoxesResult.invalidBoxLabelIdentifiers` list.  */
  deleteBoxes?: Maybe<DeleteBoxesResult>;
  /**  Soft-delete the custom product with specified ID. Return errors if the product is still assigned to any boxes. The client must be member of the base that the product is registered in.  */
  deleteProduct?: Maybe<DeleteProductResult>;
  /**  Soft-delete tag with specified ID.  */
  deleteTag?: Maybe<Tag>;
  /**  Disable the standard product instantiation with specified ID. Return errors if the product is still assigned to any boxes. The client must be member of the base that the product is registered in.  */
  disableStandardProduct?: Maybe<DisableStandardProductResult>;
  /**  Edit properties of the custom product with specified ID. Return errors in case of invalid input. The client must be member of the base that the product is registered in.  */
  editCustomProduct?: Maybe<EditCustomProductResult>;
  /**  Edit properties of the standard product instantiation with specified ID. Return errors in case of invalid input. The client must be member of the base that the product is registered in.  */
  editStandardProductInstantiation?: Maybe<EditStandardProductInstantiationResult>;
  /**  Enable a standard product for a base, specifying properties like size range, and price. This creates a so-called standard product instantiation that can be treated like any [`Product`]({{Types.Product}}). Return errors in case of invalid input (especially if the standard product has already been enabled for the base). The client must be member of the specified base.  */
  enableStandardProduct?: Maybe<EnableStandardProductResult>;
  /**  Change state of specified shipment to `Lost`, and state of all contained `InTransit` boxes to `NotDelivered`. Only valid for shipments in `Sent` state. The client must be member of either source or target base of the shipment.  */
  markShipmentAsLost?: Maybe<Shipment>;
  /**  Any boxes that are non-existing, already inside the requested location, inside a different base other than the one of the requested location, and/or in a base that the user must not access are returned in the `BoxesResult.invalidBoxLabelIdentifiers` list.  */
  moveBoxesToLocation?: Maybe<MoveBoxesResult>;
  moveItemsFromBoxToDistributionEvent?: Maybe<UnboxedItemsCollection>;
  moveItemsFromReturnTrackingGroupToBox?: Maybe<DistributionEventsTrackingEntry>;
  /**  Change state of boxes that were accidentally marked as `NotDelivered` back to `InStock`.  */
  moveNotDeliveredBoxesInStock?: Maybe<Shipment>;
  /**  Change state of specified transfer agreement to `Rejected`. Only valid for agreements in `UnderReview` state. The client must be member of all agreement target bases.  */
  rejectTransferAgreement?: Maybe<TransferAgreement>;
  removeAllPackingListEntriesFromDistributionEventForProduct?: Maybe<Scalars['Boolean']['output']>;
  removeItemsFromUnboxedItemsCollection?: Maybe<UnboxedItemsCollection>;
  removePackingListEntryFromDistributionEvent?: Maybe<DistributionEvent>;
  /**  Change state of specified shipment to `Sent`, and state of all contained `MarkedForShipment` boxes to `InTransit`. Only valid for shipments in `Preparing` state. The client must be member of the shipment source base.  */
  sendShipment?: Maybe<Shipment>;
  setReturnedNumberOfItemsForDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingEntry>;
  startDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  /**  Change state of specified shipment to `Receiving`, and state of all contained `InTransit` boxes to `Receiving`. Only valid for shipments in `Sent` state. The client must be member of the shipment target base.  */
  startReceivingShipment?: Maybe<Shipment>;
  unassignBoxFromDistributionEvent?: Maybe<Box>;
  /**  Remove a tag from a resource (box or beneficiary). If the resource does not have this tag assigned, do nothing  */
  unassignTag?: Maybe<TaggableResource>;
  /**  Any boxes that are non-existing, don't have the requested tag assigned, and/or in a base that the user must not access are returned in the `BoxesResult.invalidBoxLabelIdentifiers` list.  */
  unassignTagFromBoxes?: Maybe<UnassignTagFromBoxesResult>;
  /**  Update one or more properties of a beneficiary with specified ID.  */
  updateBeneficiary?: Maybe<Beneficiary>;
  /**  Update one or more properties of a box with specified label identifier.  */
  updateBox?: Maybe<Box>;
  updatePackingListEntry?: Maybe<PackingListEntry>;
  updateSelectedProductsForDistributionEventPackingList?: Maybe<DistributionEvent>;
  /**  Add boxes to or remove boxes from the shipment during preparation on the source side. Only valid if shipment is in `Preparing` state. The client must be member of the shipment source base.  */
  updateShipmentWhenPreparing?: Maybe<Shipment>;
  /**  Reconcile boxes or mark them as lost during shipment receival on the target side. Only valid if shipment is in `Receiving` state. If all boxes are reconciled, the state automatically updates to `Completed`. The client must be member of the shipment target base.  */
  updateShipmentWhenReceiving?: Maybe<Shipment>;
  /**  Update one or more properties of a tag with specified ID.  */
  updateTag?: Maybe<Tag>;
};


export type MutationAcceptTransferAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddPackingListEntryToDistributionEventArgs = {
  creationInput: PackingListEntryInput;
};


export type MutationAssignBoxToDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
};


export type MutationAssignTagArgs = {
  assignmentInput?: InputMaybe<TagOperationInput>;
};


export type MutationAssignTagToBoxesArgs = {
  updateInput?: InputMaybe<BoxAssignTagInput>;
};


export type MutationCancelShipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelTransferAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChangeDistributionEventStateArgs = {
  distributionEventId: Scalars['ID']['input'];
  newState: DistributionEventState;
};


export type MutationCompleteDistributionEventsTrackingGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateBeneficiaryArgs = {
  creationInput?: InputMaybe<BeneficiaryCreationInput>;
};


export type MutationCreateBoxArgs = {
  creationInput?: InputMaybe<BoxCreationInput>;
};


export type MutationCreateCustomProductArgs = {
  creationInput?: InputMaybe<CustomProductCreationInput>;
};


export type MutationCreateDistributionEventArgs = {
  creationInput?: InputMaybe<DistributionEventCreationInput>;
};


export type MutationCreateDistributionSpotArgs = {
  creationInput?: InputMaybe<DistributionSpotCreationInput>;
};


export type MutationCreateQrCodeArgs = {
  boxLabelIdentifier?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateShipmentArgs = {
  creationInput?: InputMaybe<ShipmentCreationInput>;
};


export type MutationCreateTagArgs = {
  creationInput?: InputMaybe<TagCreationInput>;
};


export type MutationCreateTransferAgreementArgs = {
  creationInput?: InputMaybe<TransferAgreementCreationInput>;
};


export type MutationDeactivateBeneficiaryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBoxesArgs = {
  labelIdentifiers: Array<Scalars['String']['input']>;
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDisableStandardProductArgs = {
  instantiationId: Scalars['ID']['input'];
};


export type MutationEditCustomProductArgs = {
  editInput?: InputMaybe<CustomProductEditInput>;
};


export type MutationEditStandardProductInstantiationArgs = {
  editInput?: InputMaybe<StandardProductInstantiationEditInput>;
};


export type MutationEnableStandardProductArgs = {
  enableInput?: InputMaybe<StandardProductEnableInput>;
};


export type MutationMarkShipmentAsLostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveBoxesToLocationArgs = {
  updateInput?: InputMaybe<BoxMoveInput>;
};


export type MutationMoveItemsFromBoxToDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
};


export type MutationMoveItemsFromReturnTrackingGroupToBoxArgs = {
  distributionEventsTrackingGroupId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
  productId: Scalars['ID']['input'];
  sizeId: Scalars['ID']['input'];
  targetBoxLabelIdentifier: Scalars['ID']['input'];
};


export type MutationMoveNotDeliveredBoxesInStockArgs = {
  boxIds: Array<Scalars['String']['input']>;
};


export type MutationRejectTransferAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveAllPackingListEntriesFromDistributionEventForProductArgs = {
  distributionEventId: Scalars['ID']['input'];
  productId: Scalars['ID']['input'];
};


export type MutationRemoveItemsFromUnboxedItemsCollectionArgs = {
  id: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
};


export type MutationRemovePackingListEntryFromDistributionEventArgs = {
  packingListEntryId: Scalars['ID']['input'];
};


export type MutationSendShipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetReturnedNumberOfItemsForDistributionEventsTrackingGroupArgs = {
  distributionEventsTrackingGroupId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
  productId: Scalars['ID']['input'];
  sizeId: Scalars['ID']['input'];
};


export type MutationStartDistributionEventsTrackingGroupArgs = {
  baseId: Scalars['ID']['input'];
  distributionEventIds: Array<Scalars['ID']['input']>;
};


export type MutationStartReceivingShipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnassignBoxFromDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
};


export type MutationUnassignTagArgs = {
  unassignmentInput?: InputMaybe<TagOperationInput>;
};


export type MutationUnassignTagFromBoxesArgs = {
  updateInput?: InputMaybe<BoxAssignTagInput>;
};


export type MutationUpdateBeneficiaryArgs = {
  updateInput?: InputMaybe<BeneficiaryUpdateInput>;
};


export type MutationUpdateBoxArgs = {
  updateInput?: InputMaybe<BoxUpdateInput>;
};


export type MutationUpdatePackingListEntryArgs = {
  numberOfItems: Scalars['Int']['input'];
  packingListEntryId: Scalars['ID']['input'];
};


export type MutationUpdateSelectedProductsForDistributionEventPackingListArgs = {
  distributionEventId: Scalars['ID']['input'];
  productIdsToAdd: Array<Scalars['ID']['input']>;
  productIdsToRemove: Array<Scalars['ID']['input']>;
};


export type MutationUpdateShipmentWhenPreparingArgs = {
  updateInput?: InputMaybe<ShipmentWhenPreparingUpdateInput>;
};


export type MutationUpdateShipmentWhenReceivingArgs = {
  updateInput?: InputMaybe<ShipmentWhenReceivingUpdateInput>;
};


export type MutationUpdateTagArgs = {
  updateInput?: InputMaybe<TagUpdateInput>;
};

/** Representation of an organisation. */
export type Organisation = {
  __typename?: 'Organisation';
  /**  List of all non-deleted [`Bases`]({{Types.Base}}) managed by this organisation. Accessible for any authenticated user  */
  bases?: Maybe<Array<Base>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};


/** Representation of an organisation. */
export type OrganisationBasesArgs = {
  filterInput?: InputMaybe<FilterBaseInput>;
};

export type PackingListEntry = {
  __typename?: 'PackingListEntry';
  id: Scalars['ID']['output'];
  matchingPackedItemsCollections: Array<ItemsCollection>;
  numberOfItems: Scalars['Int']['output'];
  product?: Maybe<Product>;
  size?: Maybe<Size>;
  state: PackingListEntryState;
};

export type PackingListEntryInput = {
  distributionEventId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
  sizeId: Scalars['Int']['input'];
};

export enum PackingListEntryState {
  NotStarted = 'NotStarted',
  Packed = 'Packed',
  PackingInProgress = 'PackingInProgress'
}

/**
 * Additional information passed along in `*Page` types.
 * The client shall use the `has*Page` fields to determine whether to fetch more data.
 */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** An identifier for the last element on the page. The client shall use it for the [`PaginationInput.after`]({{Types.PaginationInput}}) field */
  endCursor: Scalars['String']['output'];
  /**  If true, a next page is available.  */
  hasNextPage: Scalars['Boolean']['output'];
  /**  If true, a previous page is available.  */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** An identifier for the first element on the page. The client shall use it for the [`PaginationInput.before`]({{Types.PaginationInput}}) field */
  startCursor: Scalars['String']['output'];
};

/**
 * Optional input for queries/fields that return a page of elements.
 * The specified fields must be either none OR `first` OR `after, first` OR `before, last`. Other combinations result in unexpected behavior and/or errors.
 * The default page size (`first` and `last`, resp.) is 50.
 * This format is inspired by https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
 */
export type PaginationInput = {
  /** Indicate requesting paginating of the first X elements after this cursor. By default, the first relevant element of the database. See also [`PageInfo.endCursor`]({{Types.PageInfo}}) */
  after?: InputMaybe<Scalars['String']['input']>;
  /** Indicate requesting paginating of the last X elements before this cursor. See also [`PageInfo.startCursor`]({{Types.PageInfo}}) */
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Representation of a product, containing information about [`ProductCategory`]({{Types.ProductCategory}}), size, and [`ProductGender`]({{Types.ProductGender}}).
 * The product is registered in a specific [`Base`]({{Types.Base}}).
 */
export type Product = {
  __typename?: 'Product';
  base?: Maybe<Base>;
  category: ProductCategory;
  comment?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']['output']>;
  deletedOn?: Maybe<Scalars['Datetime']['output']>;
  gender?: Maybe<ProductGender>;
  id: Scalars['ID']['output'];
  inShop: Scalars['Boolean']['output'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']['output']>;
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  sizeRange: SizeRange;
  type: ProductType;
};

/** Representation of a product category. */
export type ProductCategory = {
  __typename?: 'ProductCategory';
  /**  Non-clothing categories don't have a product gender.  */
  hasGender: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /**  List of all products registered in bases the client is authorized to view.  */
  products?: Maybe<ProductPage>;
};


/** Representation of a product category. */
export type ProductCategoryProductsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};

export type ProductDimensionInfo = BasicDimensionInfo & {
  __typename?: 'ProductDimensionInfo';
  gender?: Maybe<ProductGender>;
  id?: Maybe<Scalars['Int']['output']>;
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

/** Utility type holding a page of [`Products`]({{Types.Product}}). */
export type ProductPage = {
  __typename?: 'ProductPage';
  elements: Array<Product>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Classificators for [`Product`]({{Types.Product}}) type. */
export enum ProductType {
  Custom = 'Custom',
  StandardInstantiation = 'StandardInstantiation'
}

export enum ProductTypeFilter {
  All = 'All',
  Custom = 'Custom',
  StandardInstantiation = 'StandardInstantiation'
}

export type ProductTypeMismatchError = {
  __typename?: 'ProductTypeMismatchError';
  expectedType: ProductType;
};

/** Representation of a QR code, possibly associated with a [`Box`]({{Types.Box}}). */
export type QrCode = {
  __typename?: 'QrCode';
  /**  [`Box`]({{Types.Box}}) associated with the QR code (`null` if none associated), or an error in case of insufficient permission or missing authorization for box's base  */
  box?: Maybe<BoxResult>;
  code: Scalars['String']['output'];
  createdOn?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
};

export type QrCodeResult = InsufficientPermissionError | QrCode | ResourceDoesNotExistError;

export type Query = {
  __typename?: 'Query';
  /**  Return [`Base`]({{Types.Base}})  with specified ID. Accessible for clients who are members of this base.  */
  base?: Maybe<Base>;
  /**  Return all non-deleted [`Bases`]({{Types.Base}}) that the client is authorized to view.  */
  bases: Array<Base>;
  /**  Return all [`Beneficiaries`]({{Types.Beneficiary}}) that the client is authorized to view. Optionally pass filter.  */
  beneficiaries: BeneficiaryPage;
  /**  Return [`Beneficiary`]({{Types.Beneficiary}}) with specified ID. Accessible for clients who are members of the beneficiary's base  */
  beneficiary?: Maybe<Beneficiary>;
  beneficiaryDemographics?: Maybe<BeneficiaryDemographicsData>;
  /**  Return [`Box`]({{Types.Box}}) with specified label identifier. For a box in InTransit, Receiving, or NotDelivered state, clients of both source and target base of the underlying shipment are allowed to view it. Otherwise the client must be permitted to access the base of the box location  */
  box?: Maybe<Box>;
  /**  Return page of non-deleted [`Boxes`]({{Types.Box}}) in base with specified ID. Optionally pass filters  */
  boxes: BoxPage;
  createdBoxes?: Maybe<CreatedBoxesData>;
  distributionEvent?: Maybe<DistributionEvent>;
  distributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  distributionSpot?: Maybe<DistributionSpot>;
  distributionSpots: Array<DistributionSpot>;
  /**  Return [`ClassicLocation`]({{Types.ClassicLocation}}) with specified ID. Accessible for clients who are members of the location's base  */
  location?: Maybe<ClassicLocation>;
  /**  Return all [`ClassicLocations`]({{Types.ClassicLocation}}) that the client is authorized to view.  */
  locations: Array<ClassicLocation>;
  /**  Return various metrics about stock and beneficiaries for client's organisation.  */
  metrics?: Maybe<Metrics>;
  movedBoxes?: Maybe<MovedBoxesData>;
  /**  Return [`Organisation`]({{Types.Organisation}}) with specified ID.  */
  organisation?: Maybe<Organisation>;
  /**  Return all [`Organisations`]({{Types.Organisation}}).  */
  organisations: Array<Organisation>;
  packingListEntry?: Maybe<PackingListEntry>;
  /**  Return [`Product`]({{Types.Product}}) with specified ID. Accessible for clients who are members of the product's base  */
  product?: Maybe<Product>;
  /**  Return all [`ProductCategories`]({{Types.ProductCategory}}).  */
  productCategories: Array<ProductCategory>;
  /**  Return [`ProductCategory`]({{Types.ProductCategory}}) with specified ID.  */
  productCategory?: Maybe<ProductCategory>;
  /**  Return all [`Products`]({{Types.Product}}) (incl. deleted) that the client is authorized to view.  */
  products: ProductPage;
  /**  Return [`QrCode`]({{Types.QrCode}}) with specified code (an MD5 hash in hex format of length 32), or an error in case of insufficient permission or missing resource.  */
  qrCode: QrCodeResult;
  qrExists?: Maybe<Scalars['Boolean']['output']>;
  /**  Return [`Shipment`]({{Types.Shipment}}) with specified ID. Clients are authorized to view a shipment if they're member of either the source or the target base  */
  shipment?: Maybe<Shipment>;
  /**  Return all [`Shipments`]({{Types.Shipment}}) that the client is authorized to view.  */
  shipments: Array<Shipment>;
  /**  Return [`StandardProduct`]({{Types.StandardProduct}}) with specified ID, or an error in case of insufficient permission or missing resource.  */
  standardProduct?: Maybe<StandardProductResult>;
  /**  Return standard products of latest version. Optionally include all standard products enabled for specified base.  */
  standardProducts?: Maybe<StandardProductsResult>;
  stockOverview?: Maybe<StockOverviewData>;
  /**  Return [`Tag`]({{Types.Tag}}) with specified ID. Accessible for clients who are members of the tag's base  */
  tag?: Maybe<Tag>;
  /**  Return all non-deleted [`Tags`]({{Types.Tag}}) that the client is authorized to view. Optionally filter for tags of certain type.  */
  tags: Array<Tag>;
  topProductsCheckedOut?: Maybe<TopProductsCheckedOutData>;
  topProductsDonated?: Maybe<TopProductsDonatedData>;
  /**  Return [`TransferAgreement`]({{Types.TransferAgreement}}) with specified ID. Clients are authorized to view an agreement if they're member of at least one of the agreement's source or target bases  */
  transferAgreement?: Maybe<TransferAgreement>;
  /**
   * Return all [`TransferAgreements`]({{Types.TransferAgreement}}) that the client is authorized to view.
   * Without any arguments, return transfer agreements that involve client's organisation,
   * regardless of agreement state. Optionally filter for agreements of certain state(s).
   */
  transferAgreements: Array<TransferAgreement>;
  /**  Return [`User`]({{Types.User}}) with specified ID. Some fields might be restricted.  */
  user?: Maybe<User>;
  /**  Return all [`Users`]({{Types.User}}). Accessible for god users only  */
  users: Array<User>;
};


export type QueryBaseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBasesArgs = {
  filterInput?: InputMaybe<FilterBaseInput>;
};


export type QueryBeneficiariesArgs = {
  filterInput?: InputMaybe<FilterBeneficiaryInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryBeneficiaryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBeneficiaryDemographicsArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryBoxArgs = {
  labelIdentifier: Scalars['String']['input'];
};


export type QueryBoxesArgs = {
  baseId: Scalars['ID']['input'];
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryCreatedBoxesArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryDistributionEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDistributionEventsTrackingGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDistributionSpotArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLocationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMetricsArgs = {
  organisationId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMovedBoxesArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryOrganisationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPackingListEntryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryQrCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryQrExistsArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
};


export type QueryShipmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStandardProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStandardProductsArgs = {
  baseId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryStockOverviewArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTagArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTagsArgs = {
  tagType?: InputMaybe<TagType>;
};


export type QueryTopProductsCheckedOutArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTopProductsDonatedArgs = {
  baseId: Scalars['Int']['input'];
};


export type QueryTransferAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTransferAgreementsArgs = {
  states?: InputMaybe<Array<TransferAgreementState>>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type ResourceDoesNotExistError = {
  __typename?: 'ResourceDoesNotExistError';
  id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
};

export type Result = BeneficiaryDemographicsResult | CreatedBoxesResult | MovedBoxesResult | StockOverviewResult | TopProductsCheckedOutResult | TopProductsDonatedResult;

/** Representation of a shipment of boxes between two bases of two distinct organisations. The content is tracked via [`ShipmentDetails`]({{Types.ShipmentDetail}}) */
export type Shipment = {
  __typename?: 'Shipment';
  canceledBy?: Maybe<User>;
  canceledOn?: Maybe<Scalars['Datetime']['output']>;
  completedBy?: Maybe<User>;
  completedOn?: Maybe<Scalars['Datetime']['output']>;
  details: Array<ShipmentDetail>;
  id: Scalars['ID']['output'];
  /**  Unique identifier of the shipment, constructed from ID, start date, source and target base names. E.g. `S042-230815-THxLE`  */
  labelIdentifier: Scalars['String']['output'];
  receivingStartedBy?: Maybe<User>;
  receivingStartedOn?: Maybe<Scalars['Datetime']['output']>;
  sentBy?: Maybe<User>;
  sentOn?: Maybe<Scalars['Datetime']['output']>;
  sourceBase: Base;
  startedBy: User;
  startedOn: Scalars['Datetime']['output'];
  state?: Maybe<ShipmentState>;
  targetBase: Base;
  /**  If no agreement associated with the shipment, it's an intra-org one  */
  transferAgreement?: Maybe<TransferAgreement>;
};

export type ShipmentCreationInput = {
  sourceBaseId: Scalars['Int']['input'];
  targetBaseId: Scalars['Int']['input'];
  /**  Passing null will create an intra-org shipment  */
  transferAgreementId?: InputMaybe<Scalars['Int']['input']>;
};

/** Representation of a box in a shipment. Boxes might be added or removed on the source side, and received or marked as lost on the target side. All properties (product, location, size, quantity) at source and target side are tracked here */
export type ShipmentDetail = {
  __typename?: 'ShipmentDetail';
  box: Box;
  createdBy: User;
  createdOn: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  lostBy?: Maybe<User>;
  lostOn?: Maybe<Scalars['Datetime']['output']>;
  receivedBy?: Maybe<User>;
  receivedOn?: Maybe<Scalars['Datetime']['output']>;
  removedBy?: Maybe<User>;
  removedOn?: Maybe<Scalars['Datetime']['output']>;
  shipment: Shipment;
  sourceLocation?: Maybe<ClassicLocation>;
  sourceProduct?: Maybe<Product>;
  sourceQuantity?: Maybe<Scalars['Int']['output']>;
  sourceSize?: Maybe<Size>;
  targetLocation?: Maybe<ClassicLocation>;
  targetProduct?: Maybe<Product>;
  targetQuantity?: Maybe<Scalars['Int']['output']>;
  targetSize?: Maybe<Size>;
};

export type ShipmentDetailUpdateInput = {
  id: Scalars['ID']['input'];
  targetLocationId: Scalars['Int']['input'];
  targetProductId: Scalars['Int']['input'];
  targetQuantity: Scalars['Int']['input'];
  targetSizeId: Scalars['Int']['input'];
};

export enum ShipmentState {
  Canceled = 'Canceled',
  Completed = 'Completed',
  Lost = 'Lost',
  Preparing = 'Preparing',
  Receiving = 'Receiving',
  Sent = 'Sent'
}

export type ShipmentWhenPreparingUpdateInput = {
  id: Scalars['ID']['input'];
  preparedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']['input']>>;
  removedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']['input']>>;
  targetBaseId?: InputMaybe<Scalars['Int']['input']>;
};

export type ShipmentWhenReceivingUpdateInput = {
  id: Scalars['ID']['input'];
  lostBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']['input']>>;
  receivedShipmentDetailUpdateInputs?: InputMaybe<Array<ShipmentDetailUpdateInput>>;
};

/** Representation of product size (e.g. clothing size "XL", shoe size 39). */
export type Size = {
  __typename?: 'Size';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
};

/** Representation of group of sizes (e.g. clothing sizes "S, M, L, XL"), or of a dimension (mass or volume). */
export type SizeRange = {
  __typename?: 'SizeRange';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  /**  List of sizes belonging to the group  */
  sizes: Array<Size>;
  /**  List of units belonging to the dimension  */
  units: Array<Unit>;
};

/**
 * Representation of a standard product, containing information about [`ProductCategory`]({{Types.ProductCategory}}), size, and [`ProductGender`]({{Types.ProductGender}}).
 * Users can enable this standard product for their bases which creates a standard product instantiation.
 */
export type StandardProduct = {
  __typename?: 'StandardProduct';
  addedBy?: Maybe<User>;
  addedOn?: Maybe<Scalars['Datetime']['output']>;
  category: ProductCategory;
  deprecatedBy?: Maybe<User>;
  deprecatedOn?: Maybe<Scalars['Datetime']['output']>;
  /**  All bases that this standard product is enabled for.  */
  enabledForBases?: Maybe<Array<Base>>;
  gender: ProductGender;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  precededByProduct?: Maybe<StandardProduct>;
  sizeRange: SizeRange;
  supercededByProduct?: Maybe<StandardProduct>;
  version: Scalars['Int']['output'];
};

export type StandardProductAlreadyEnabledForBaseError = {
  __typename?: 'StandardProductAlreadyEnabledForBaseError';
  existingStandardProductInstantiationId: Scalars['ID']['output'];
};

export type StandardProductEnableInput = {
  baseId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  inShop?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  sizeRangeId?: InputMaybe<Scalars['Int']['input']>;
  standardProductId: Scalars['Int']['input'];
};

export type StandardProductInstantiationEditInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  inShop?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  sizeRangeId?: InputMaybe<Scalars['Int']['input']>;
};

/** Utility type holding a page of [`StandardProducts`]({{Types.StandardProduct}}). */
export type StandardProductPage = {
  __typename?: 'StandardProductPage';
  elements: Array<StandardProduct>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StandardProductResult = InsufficientPermissionError | ResourceDoesNotExistError | StandardProduct;

export type StandardProductsResult = InsufficientPermissionError | StandardProductPage | UnauthorizedForBaseError;

export type StockOverview = {
  __typename?: 'StockOverview';
  numberOfBoxes?: Maybe<Scalars['Int']['output']>;
  numberOfItems?: Maybe<Scalars['Int']['output']>;
  productCategoryName?: Maybe<Scalars['String']['output']>;
};

export type StockOverviewData = DataCube & {
  __typename?: 'StockOverviewData';
  dimensions: StockOverviewDataDimensions;
  facts: Array<StockOverviewResult>;
};

export type StockOverviewDataDimensions = {
  __typename?: 'StockOverviewDataDimensions';
  category: Array<DimensionInfo>;
  /**  'Dimension' in the sense of Mass or Volume  */
  dimension: Array<DimensionInfo>;
  location: Array<DimensionInfo>;
  size: Array<DimensionInfo>;
  tag: Array<TagDimensionInfo>;
};

export type StockOverviewResult = {
  __typename?: 'StockOverviewResult';
  /**  Null for boxes with size-product  */
  absoluteMeasureValue?: Maybe<Scalars['Float']['output']>;
  boxState: BoxState;
  boxesCount: Scalars['Int']['output'];
  categoryId: Scalars['Int']['output'];
  /**  'Dimension' in the sense of Mass or Volume; null for boxes with size-product  */
  dimensionId?: Maybe<Scalars['Int']['output']>;
  gender: ProductGender;
  itemsCount: Scalars['Int']['output'];
  locationId: Scalars['Int']['output'];
  productName: Scalars['String']['output'];
  /**  Null for boxes with measure-product  */
  sizeId?: Maybe<Scalars['Int']['output']>;
  tagIds?: Maybe<Array<Scalars['Int']['output']>>;
};

/** Representation of a tag. */
export type Tag = {
  __typename?: 'Tag';
  base: Base;
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /**  List of boxes and/or beneficiaries that have this tag assigned  */
  taggedResources?: Maybe<Array<TaggableResource>>;
  type: TagType;
};

export type TagCreationInput = {
  baseId: Scalars['Int']['input'];
  color: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: TagType;
};

export type TagDimensionInfo = BasicDimensionInfo & {
  __typename?: 'TagDimensionInfo';
  /**  Hex color code  */
  color?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TagOperationInput = {
  id: Scalars['ID']['input'];
  resourceId: Scalars['ID']['input'];
  resourceType: TaggableResourceType;
};

/** Classificators for [`Tag`]({{Types.Tag}}) type. */
export enum TagType {
  All = 'All',
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

export type TagTypeMismatchError = {
  __typename?: 'TagTypeMismatchError';
  expectedType: TagType;
};

export type TagUpdateInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TagType>;
};

/**  Union for resources that tags can be applied to.  */
export type TaggableResource = Beneficiary | Box;

/** Classificator for resources that a [`Tag`]({{Types.Tag}}) can be applied to (according to [`TaggableResource`]({{Types.TaggableResource}})). */
export enum TaggableResourceType {
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

export type TargetDimensionInfo = {
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

/** Representation of a transaction executed by a beneficiary (spending or receiving tokens). */
export type Transaction = {
  __typename?: 'Transaction';
  beneficiary: Beneficiary;
  /**  Number of transferred products  */
  count?: Maybe<Scalars['Int']['output']>;
  createdBy?: Maybe<User>;
  createdOn: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  product?: Maybe<Product>;
  /**  Value of the transaction  */
  tokens?: Maybe<Scalars['Int']['output']>;
};

/** Representation of an agreement between two organisations prior to start mutual shipments. */
export type TransferAgreement = {
  __typename?: 'TransferAgreement';
  acceptedBy?: Maybe<User>;
  acceptedOn?: Maybe<Scalars['Datetime']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  requestedBy: User;
  requestedOn: Scalars['Datetime']['output'];
  shipments: Array<Shipment>;
  /**  List of all non-deleted bases of the source organisation included in the agreement  */
  sourceBases?: Maybe<Array<Base>>;
  sourceOrganisation: Organisation;
  state?: Maybe<TransferAgreementState>;
  /**  List of all non-deleted bases of the target organisation included in the agreement  */
  targetBases?: Maybe<Array<Base>>;
  targetOrganisation: Organisation;
  terminatedBy?: Maybe<User>;
  terminatedOn?: Maybe<Scalars['Datetime']['output']>;
  type: TransferAgreementType;
  validFrom: Scalars['Datetime']['output'];
  validUntil?: Maybe<Scalars['Datetime']['output']>;
};


/** Representation of an agreement between two organisations prior to start mutual shipments. */
export type TransferAgreementSourceBasesArgs = {
  filterInput?: InputMaybe<FilterBaseInput>;
};


/** Representation of an agreement between two organisations prior to start mutual shipments. */
export type TransferAgreementTargetBasesArgs = {
  filterInput?: InputMaybe<FilterBaseInput>;
};

export type TransferAgreementCreationInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  initiatingOrganisationBaseIds: Array<Scalars['Int']['input']>;
  initiatingOrganisationId: Scalars['Int']['input'];
  partnerOrganisationBaseIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  partnerOrganisationId: Scalars['Int']['input'];
  type: TransferAgreementType;
  /**  Validity dates must be in local time  */
  validFrom?: InputMaybe<Scalars['Date']['input']>;
  validUntil?: InputMaybe<Scalars['Date']['input']>;
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

export type UnassignTagFromBoxesResult = BoxesResult | InsufficientPermissionError | ResourceDoesNotExistError | UnauthorizedForBaseError;

export type UnauthorizedForBaseError = {
  __typename?: 'UnauthorizedForBaseError';
  /**  e.g. 'product:write' present but not for requested base  */
  id: Scalars['ID']['output'];
  /**  Empty string if base does not exist  */
  name: Scalars['String']['output'];
  /**  Empty string if base does not exist  */
  organisationName: Scalars['String']['output'];
};

export type UnboxedItemsCollection = ItemsCollection & {
  __typename?: 'UnboxedItemsCollection';
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
  numberOfItems?: Maybe<Scalars['Int']['output']>;
  product?: Maybe<Product>;
  size?: Maybe<Size>;
};

/** Representation of dimensional unit (e.g. kilogram or liter) */
export type Unit = {
  __typename?: 'Unit';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

/** Representation of a boxtribute user. */
export type User = {
  __typename?: 'User';
  /**  List of all [`Bases`]({{Types.Base}}) this user can access. Meaningful only if the currently authenticated user queries themselves  */
  bases?: Maybe<Array<Maybe<Base>>>;
  /**  Available only if the currently authenticated user queries themselves  */
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastAction?: Maybe<Scalars['Datetime']['output']>;
  lastLogin?: Maybe<Scalars['Datetime']['output']>;
  /**  First and last name. Accessible to any authenticated user  */
  name?: Maybe<Scalars['String']['output']>;
  /**  The [`Organisation`]({{Types.Organisation}}) the user is a member of. Meaningful only if the currently authenticated user queries themselves  */
  organisation?: Maybe<Organisation>;
  validFirstDay?: Maybe<Scalars['Date']['output']>;
  validLastDay?: Maybe<Scalars['Date']['output']>;
};

export type AssignBoxesToShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  labelIdentifiers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type AssignBoxesToShipmentMutation = { __typename?: 'Mutation', updateShipmentWhenPreparing?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type UnassignBoxesFromShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  labelIdentifiers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type UnassignBoxesFromShipmentMutation = { __typename?: 'Mutation', updateShipmentWhenPreparing?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type DeleteBoxesMutationVariables = Exact<{
  labelIdentifiers: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteBoxesMutation = { __typename?: 'Mutation', deleteBoxes?: { __typename: 'BoxesResult', invalidBoxLabelIdentifiers: Array<string>, updatedBoxes: Array<{ __typename?: 'Box', labelIdentifier: string, deletedOn?: any | null }> } | { __typename: 'InsufficientPermissionError', name: string } | null };

export type OrganisationBasicFieldsFragment = { __typename?: 'Organisation', id: string, name: string };

export type BaseBasicFieldsFragment = { __typename?: 'Base', id: string, name: string };

export type UserBasicFieldsFragment = { __typename?: 'User', id: string, name?: string | null };

export type ProductBasicFieldsFragment = { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null };

export type SizeBasicFieldsFragment = { __typename?: 'Size', id: string, label: string };

export type LocationBasicFieldsFragment = { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null };

export type TagBasicFieldsFragment = { __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType };

export type TagOptionsFragment = { __typename?: 'Tag', color?: string | null, value: string, label: string };

export type DistroEventFieldsFragment = { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null };

export type BaseOrgFieldsFragment = { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } };

export type HistoryFieldsFragment = { __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null };

export type SizeRangeFieldsFragment = { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> };

export type BoxBasicFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null };

export type BoxFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null };

export type BoxWithSizeTagProductFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, lastModifiedOn?: any | null, size?: { __typename?: 'Size', id: string, label: string } | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null };

export type TransferAgreementFieldsFragment = { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type ProductFieldsFragment = { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } };

export type ShipmentDetailFieldsFragment = { __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type ShipmentFieldsFragment = { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type UpdateShipmentWhenReceivingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  receivedShipmentDetailUpdateInputs?: InputMaybe<Array<ShipmentDetailUpdateInput> | ShipmentDetailUpdateInput>;
  lostBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type UpdateShipmentWhenReceivingMutation = { __typename?: 'Mutation', updateShipmentWhenReceiving?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type OrganisationAndBasesQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganisationAndBasesQuery = { __typename?: 'Query', bases: Array<{ __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }> };

export type BoxDetailsQueryVariables = Exact<{
  labelIdentifier: Scalars['String']['input'];
}>;


export type BoxDetailsQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type GetBoxLabelIdentifierForQrCodeQueryVariables = Exact<{
  qrCode: Scalars['String']['input'];
}>;


export type GetBoxLabelIdentifierForQrCodeQuery = { __typename?: 'Query', qrCode: { __typename: 'InsufficientPermissionError', permissionName: string } | { __typename: 'QrCode', code: string, box?: { __typename: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null } | { __typename: 'InsufficientPermissionError', permissionName: string } | { __typename: 'UnauthorizedForBaseError', organisationName: string, baseName: string } | null } | { __typename: 'ResourceDoesNotExistError', resourceName: string } };

export type CheckIfQrExistsInDbQueryVariables = Exact<{
  qrCode: Scalars['String']['input'];
}>;


export type CheckIfQrExistsInDbQuery = { __typename?: 'Query', qrExists?: boolean | null };

export type ShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShipmentsQuery = { __typename?: 'Query', shipments: Array<{ __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type BoxByLabelIdentifierQueryVariables = Exact<{
  labelIdentifier: Scalars['String']['input'];
}>;


export type BoxByLabelIdentifierQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null, shipments: Array<{ __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type ShipmentByIdWithProductsAndLocationsQueryVariables = Exact<{
  shipmentId: Scalars['ID']['input'];
  baseId: Scalars['ID']['input'];
}>;


export type ShipmentByIdWithProductsAndLocationsQuery = { __typename?: 'Query', shipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null, base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', color?: string | null, value: string, label: string }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type MultiBoxActionOptionsForLocationsTagsAndShipmentsQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type MultiBoxActionOptionsForLocationsTagsAndShipmentsQuery = { __typename?: 'Query', base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }> } | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, labelIdentifier: string, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } }> };

export type BaseDataQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type BaseDataQuery = { __typename?: 'Query', base?: { __typename?: 'Base', name: string, locations: Array<{ __typename?: 'ClassicLocation', name?: string | null }> } | null };

export type UpdateNumberOfItemsMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String']['input'];
  numberOfItems: Scalars['Int']['input'];
}>;


export type UpdateNumberOfItemsMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type UpdateStateMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String']['input'];
  newState: BoxState;
}>;


export type UpdateStateMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type UpdateLocationOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String']['input'];
  newLocationId: Scalars['Int']['input'];
}>;


export type UpdateLocationOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type AllProductsAndLocationsForBaseQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type AllProductsAndLocationsForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', color?: string | null, value: string, label: string }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type CreateBoxMutationVariables = Exact<{
  locationId: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
  sizeId: Scalars['Int']['input'];
  numberOfItems: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
  qrCode?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateBoxMutation = { __typename?: 'Mutation', createBox?: { __typename?: 'Box', labelIdentifier: string, qrCode?: { __typename?: 'QrCode', code: string, box?: { __typename?: 'Box', labelIdentifier: string } | { __typename?: 'InsufficientPermissionError' } | { __typename?: 'UnauthorizedForBaseError' } | null } | null } | null };

export type BoxByLabelIdentifierAndAllProductsWithBaseIdQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
  labelIdentifier: Scalars['String']['input'];
}>;


export type BoxByLabelIdentifierAndAllProductsWithBaseIdQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, tags?: Array<{ __typename?: 'Tag', color?: string | null, id: string, name: string, description?: string | null, type: TagType, value: string, label: string }> | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, size?: { __typename?: 'Size', id: string, label: string } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, box: { __typename?: 'Box', labelIdentifier: string, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', base?: { __typename?: 'Base', id: string, name: string } | null } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null } | null }>, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } } } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null, base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', color?: string | null, value: string, label: string }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type UpdateContentOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
  locationId: Scalars['Int']['input'];
  numberOfItems: Scalars['Int']['input'];
  sizeId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type UpdateContentOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type BoxesForBoxesViewQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
  filterInput?: InputMaybe<FilterBoxInput>;
}>;


export type BoxesForBoxesViewQuery = { __typename?: 'Query', boxes: { __typename?: 'BoxPage', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, elements: Array<{ __typename?: 'Box', labelIdentifier: string, numberOfItems?: number | null, state: BoxState, comment?: string | null, createdOn?: any | null, lastModifiedOn?: any | null, deletedOn?: any | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, location?: { __typename?: 'ClassicLocation', id: string, name?: string | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }> } };

export type ActionOptionsForBoxesViewQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type ActionOptionsForBoxesViewQuery = { __typename?: 'Query', base?: { __typename?: 'Base', id: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, seq?: number | null, name?: string | null }>, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, description?: string | null, type: TagType }> | null } | null, shipments: Array<{ __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } }> };

export type MoveBoxesMutationVariables = Exact<{
  newLocationId: Scalars['Int']['input'];
  labelIdentifier0: Scalars['String']['input'];
}>;


export type MoveBoxesMutation = { __typename?: 'Mutation', moveBox123?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string } | { __typename?: 'DistributionSpot', id: string } | null } | null };

export type UnassignBoxesFromShipmentsMutationVariables = Exact<{
  shipment0: Scalars['ID']['input'];
  labelIdentifiers0: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UnassignBoxesFromShipmentsMutation = { __typename?: 'Mutation', unassignBoxesFromShipment1?: { __typename: 'Shipment', id: string, details: Array<{ __typename: 'ShipmentDetail', id: string, removedOn?: any | null, removedBy?: { __typename: 'User', id: string } | null, box: { __typename: 'Box', labelIdentifier: string, state: BoxState, lastModifiedOn?: any | null, shipmentDetail?: { __typename: 'ShipmentDetail', id: string } | null } }> } | null };

export type CreateDistributionEventMutationVariables = Exact<{
  distributionSpotId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  plannedStartDateTime: Scalars['Datetime']['input'];
  plannedEndDateTime: Scalars['Datetime']['input'];
}>;


export type CreateDistributionEventMutation = { __typename?: 'Mutation', createDistributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any } | null };

export type DistributionSpotQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DistributionSpotQuery = { __typename?: 'Query', distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null };

export type CreateDistributionSpotMutationVariables = Exact<{
  baseId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  comment: Scalars['String']['input'];
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
}>;


export type CreateDistributionSpotMutation = { __typename?: 'Mutation', createDistributionSpot?: { __typename?: 'DistributionSpot', id: string } | null };

export type RemoveEntryFromPackingListMutationVariables = Exact<{
  packingListEntryId: Scalars['ID']['input'];
}>;


export type RemoveEntryFromPackingListMutation = { __typename?: 'Mutation', removePackingListEntryFromDistributionEvent?: { __typename?: 'DistributionEvent', id: string } | null };

export type RemoveAllPackingListEntriesFromDistributionEventForProductMutationVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
  productId: Scalars['ID']['input'];
}>;


export type RemoveAllPackingListEntriesFromDistributionEventForProductMutation = { __typename?: 'Mutation', removeAllPackingListEntriesFromDistributionEventForProduct?: boolean | null };

export type UpdateSelectedProductsForDistributionEventPackingListMutationVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
  productIdsToAdd: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  productIdsToRemove: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateSelectedProductsForDistributionEventPackingListMutation = { __typename?: 'Mutation', updateSelectedProductsForDistributionEventPackingList?: { __typename?: 'DistributionEvent', id: string } | null };

export type UpdatePackingListEntryMutationVariables = Exact<{
  packingListEntryId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
}>;


export type UpdatePackingListEntryMutation = { __typename?: 'Mutation', updatePackingListEntry?: { __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null } | null };

export type AddToPackingListMutationVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
  productId: Scalars['Int']['input'];
  sizeId: Scalars['Int']['input'];
  numberOfItems: Scalars['Int']['input'];
}>;


export type AddToPackingListMutation = { __typename?: 'Mutation', addPackingListEntryToDistributionEvent?: { __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null } | null };

export type RemoveItemsFromUnboxedItemsCollectionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
}>;


export type RemoveItemsFromUnboxedItemsCollectionMutation = { __typename?: 'Mutation', removeItemsFromUnboxedItemsCollection?: { __typename?: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null, product?: { __typename?: 'Product', name: string } | null } | null };

export type DownloadDistributionEventsStatisticsQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type DownloadDistributionEventsStatisticsQuery = { __typename?: 'Query', base?: { __typename?: 'Base', id: string, distributionEventsStatistics: Array<{ __typename?: 'DistributionEventsStatistics', productName: string, sizeLabel: string, genderLabel: string, categoryLabel: string, inflow: number, outflow: number, earliestPossibleDistroDate: string, latestPossibleDistroDate: string, potentiallyInvolvedDistributionSpots: string, involvedDistributionEventIds: string, distroEventTrackingGroupId: string, productId: string, sizeId: string }> } | null };

export type AllProductsForPackingListQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type AllProductsForPackingListQuery = { __typename?: 'Query', base?: { __typename?: 'Base', products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', id: string, name: string }, sizeRange: { __typename?: 'SizeRange', sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type DistroSpotsForBaseIdQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type DistroSpotsForBaseIdQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionSpots: Array<{ __typename?: 'DistributionSpot', id: string, name?: string | null, latitude?: number | null, longitude?: number | null, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any, plannedEndDateTime: any }> }> } | null };

export type DistributionEventsForBaseQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type DistributionEventsForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type AssignBoxToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
}>;


export type AssignBoxToDistributionEventMutation = { __typename?: 'Mutation', assignBoxToDistributionEvent?: { __typename?: 'Box', id: string, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null } | null };

export type UnassignBoxFromDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
}>;


export type UnassignBoxFromDistributionEventMutation = { __typename?: 'Mutation', unassignBoxFromDistributionEvent?: { __typename?: 'Box', id: string } | null };

export type MoveItemsToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID']['input'];
  distributionEventId: Scalars['ID']['input'];
  numberOfItems: Scalars['Int']['input'];
}>;


export type MoveItemsToDistributionEventMutation = { __typename?: 'Mutation', moveItemsFromBoxToDistributionEvent?: { __typename?: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, boxes: Array<{ __typename?: 'Box', product?: { __typename?: 'Product', name: string } | null }>, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null } | null };

export type ReturnTrackingGroupIdForDistributionEventQueryVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
}>;


export type ReturnTrackingGroupIdForDistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', distributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string } | null } | null };

export type PackingListEntriesForDistributionEventQueryVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
}>;


export type PackingListEntriesForDistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, packingListEntries: Array<{ __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, matchingPackedItemsCollections: Array<{ __typename: 'Box', labelIdentifier: string, numberOfItems?: number | null } | { __typename: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null }> }> } | null };

export type ChangeDistributionEventStateMutationVariables = Exact<{
  distributionEventId: Scalars['ID']['input'];
  newState: DistributionEventState;
}>;


export type ChangeDistributionEventStateMutation = { __typename?: 'Mutation', changeDistributionEventState?: { __typename: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState } | null };

export type DistributionEventsTrackingGroupQueryVariables = Exact<{
  trackingGroupId: Scalars['ID']['input'];
}>;


export type DistributionEventsTrackingGroupQuery = { __typename?: 'Query', distributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string, distributionEventsTrackingEntries: Array<{ __typename?: 'DistributionEventsTrackingEntry', id: string, numberOfItems: number, flowDirection: DistributionEventTrackingFlowDirection, product: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', id: string, name: string } }, size: { __typename?: 'Size', id: string, label: string } }>, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type StartDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  baseId: Scalars['ID']['input'];
}>;


export type StartDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', startDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type DistributionEventQueryVariables = Exact<{
  eventId: Scalars['ID']['input'];
}>;


export type DistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null };

export type DataForReturnTrackingOverviewForBaseQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type DataForReturnTrackingOverviewForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionEventsTrackingGroups: Array<{ __typename?: 'DistributionEventsTrackingGroup', id: string, state: DistributionEventsTrackingGroupState, createdOn: any, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> }>, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type SetReturnedNumberOfItemsForDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventsTrackingGroupId: Scalars['ID']['input'];
  productId: Scalars['ID']['input'];
  sizeId: Scalars['ID']['input'];
  numberOfReturnedItems: Scalars['Int']['input'];
}>;


export type SetReturnedNumberOfItemsForDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', setReturnedNumberOfItemsForDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingEntry', id: string } | null };

export type CompleteDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventsTrackingGroupId: Scalars['ID']['input'];
}>;


export type CompleteDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', completeDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string } | null };

export type NewShipmentFragment = { __typename?: 'Shipment', id: string };

export type AllAcceptedTransferAgreementsQueryVariables = Exact<{
  baseId: Scalars['ID']['input'];
}>;


export type AllAcceptedTransferAgreementsQuery = { __typename?: 'Query', base?: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } | null, transferAgreements: Array<{ __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type CreateShipmentMutationVariables = Exact<{
  sourceBaseId: Scalars['Int']['input'];
  targetBaseId: Scalars['Int']['input'];
  transferAgreementId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateShipmentMutation = { __typename?: 'Mutation', createShipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type AllOrganisationsAndBasesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllOrganisationsAndBasesQuery = { __typename?: 'Query', organisations: Array<{ __typename?: 'Organisation', id: string, name: string, bases?: Array<{ __typename?: 'Base', id: string, name: string }> | null }> };

export type CreateTransferAgreementMutationVariables = Exact<{
  initiatingOrganisationId: Scalars['Int']['input'];
  partnerOrganisationId: Scalars['Int']['input'];
  type: TransferAgreementType;
  validFrom?: InputMaybe<Scalars['Date']['input']>;
  validUntil?: InputMaybe<Scalars['Date']['input']>;
  initiatingOrganisationBaseIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  partnerOrganisationBaseIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTransferAgreementMutation = { __typename?: 'Mutation', createTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type NewTransferAgreementFragment = { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null };

export type ShipmentByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ShipmentByIdQuery = { __typename?: 'Query', shipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type RemoveBoxFromShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  removedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type RemoveBoxFromShipmentMutation = { __typename?: 'Mutation', updateShipmentWhenPreparing?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type SendShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SendShipmentMutation = { __typename?: 'Mutation', sendShipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type CancelShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CancelShipmentMutation = { __typename?: 'Mutation', cancelShipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type LostShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type LostShipmentMutation = { __typename?: 'Mutation', markShipmentAsLost?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type StartReceivingShipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type StartReceivingShipmentMutation = { __typename?: 'Mutation', startReceivingShipment?: { __typename?: 'Shipment', id: string, labelIdentifier: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, sourceQuantity?: number | null, targetQuantity?: number | null, createdOn: any, removedOn?: any | null, lostOn?: any | null, receivedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, comment?: string | null, lastModifiedOn?: any | null, location?: { __typename?: 'ClassicLocation', id: string, base?: { __typename?: 'Base', id: string } | null } | { __typename?: 'DistributionSpot', id: string, base?: { __typename?: 'Base', id: string } | null } | null, shipmentDetail?: { __typename?: 'ShipmentDetail', id: string, shipment: { __typename?: 'Shipment', id: string } } | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, deletedOn?: any | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, sourceSize?: { __typename?: 'Size', id: string, label: string } | null, targetSize?: { __typename?: 'Size', id: string, label: string } | null, sourceLocation?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, removedBy?: { __typename?: 'User', id: string, name?: string | null } | null, lostBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement?: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType } | null, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type TransferAgreementsQueryVariables = Exact<{ [key: string]: never; }>;


export type TransferAgreementsQuery = { __typename?: 'Query', transferAgreements: Array<{ __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type AcceptTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AcceptTransferAgreementMutation = { __typename?: 'Mutation', acceptTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type RejectTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RejectTransferAgreementMutation = { __typename?: 'Mutation', rejectTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type CancelTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CancelTransferAgreementMutation = { __typename?: 'Mutation', cancelTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };
