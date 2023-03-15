export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Datetime: any;
};

/**
 * Representation of a base.
 * The base is managed by a specific [`Organisation`]({{Types.Organisation}}).
 */
export type Base = {
  __typename?: 'Base';
  /**  List of all [`Beneficiaries`]({{Types.Beneficiary}}) registered in this base  */
  beneficiaries?: Maybe<BeneficiaryPage>;
  currencyName?: Maybe<Scalars['String']>;
  distributionEvents: Array<DistributionEvent>;
  distributionEventsBeforeReturnedFromDistributionState: Array<DistributionEvent>;
  distributionEventsInReturnedFromDistributionState: Array<DistributionEvent>;
  distributionEventsStatistics: Array<DistributionEventsStatistics>;
  distributionEventsTrackingGroups: Array<DistributionEventsTrackingGroup>;
  distributionSpots: Array<DistributionSpot>;
  id: Scalars['ID'];
  /**  List of all undeleted [`ClassicLocations`]({{Types.ClassicLocation}}) present in this base  */
  locations: Array<ClassicLocation>;
  name: Scalars['String'];
  organisation: Organisation;
  /**  List of all undeleted [`Products`]({{Types.Product}}) registered in this base  */
  products: Array<Product>;
  /**  List of all [`Tags`]({{Types.Tag}}) registered in this base. Optionally filter for a [`resource type`]({{Types.TaggableResourceType}})  */
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
export type BaseTagsArgs = {
  resourceType?: InputMaybe<TaggableResourceType>;
};

/**
 * Representation of a beneficiary.
 * The beneficiary is registered in a specific [`Base`]({{Types.Base}}).
 */
export type Beneficiary = {
  __typename?: 'Beneficiary';
  active: Scalars['Boolean'];
  /**  If dateOfBirth is not set, age will be null.  */
  age?: Maybe<Scalars['Int']>;
  base?: Maybe<Base>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']>;
  dateOfBirth?: Maybe<Scalars['Date']>;
  dateOfSignature?: Maybe<Scalars['Date']>;
  /**  Null if this beneficiary is the family head  */
  familyHead?: Maybe<Beneficiary>;
  firstName: Scalars['String'];
  gender?: Maybe<HumanGender>;
  /**  All members of a family have the same group identifier  */
  groupIdentifier: Scalars['String'];
  id: Scalars['ID'];
  isVolunteer: Scalars['Boolean'];
  languages?: Maybe<Array<Language>>;
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  lastName: Scalars['String'];
  registered: Scalars['Boolean'];
  signature?: Maybe<Scalars['String']>;
  signed: Scalars['Boolean'];
  tags?: Maybe<Array<Tag>>;
  /**  Number of tokens the beneficiary holds (sum of all transaction values)  */
  tokens?: Maybe<Scalars['Int']>;
  /**  List of all [`Transactions`]({{Types.Transaction}}) that this beneficiary executed  */
  transactions?: Maybe<Array<Transaction>>;
};

export type BeneficiaryCreationInput = {
  baseId: Scalars['Int'];
  comment?: InputMaybe<Scalars['String']>;
  dateOfBirth: Scalars['Date'];
  dateOfSignature?: InputMaybe<Scalars['Date']>;
  familyHeadId?: InputMaybe<Scalars['Int']>;
  firstName: Scalars['String'];
  gender: HumanGender;
  groupIdentifier: Scalars['String'];
  isVolunteer: Scalars['Boolean'];
  languages?: InputMaybe<Array<Language>>;
  lastName: Scalars['String'];
  registered: Scalars['Boolean'];
  signature?: InputMaybe<Scalars['String']>;
};

/** Utility type holding a page of [`Beneficiaries`]({{Types.Beneficiary}}). */
export type BeneficiaryPage = {
  __typename?: 'BeneficiaryPage';
  elements?: Maybe<Array<Beneficiary>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type BeneficiaryUpdateInput = {
  comment?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['Date']>;
  dateOfSignature?: InputMaybe<Scalars['Date']>;
  familyHeadId?: InputMaybe<Scalars['Int']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<HumanGender>;
  groupIdentifier?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  isVolunteer?: InputMaybe<Scalars['Boolean']>;
  languages?: InputMaybe<Array<Language>>;
  lastName?: InputMaybe<Scalars['String']>;
  registered?: InputMaybe<Scalars['Boolean']>;
  signature?: InputMaybe<Scalars['String']>;
};

/** Representation of a box storing items of a [`Product`]({{Types.Product}}) in a [`Location`]({{Types.Location}}) */
export type Box = ItemsCollection & {
  __typename?: 'Box';
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']>;
  distributionEvent?: Maybe<DistributionEvent>;
  history?: Maybe<Array<HistoryEntry>>;
  id: Scalars['ID'];
  /**  Sequence of numbers for identifying the box, usually written on box label  */
  labelIdentifier: Scalars['String'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  location?: Maybe<Location>;
  numberOfItems?: Maybe<Scalars['Int']>;
  product?: Maybe<Product>;
  qrCode?: Maybe<QrCode>;
  size: Size;
  state: BoxState;
  tags?: Maybe<Array<Tag>>;
};

/** GraphQL input types for mutations **only**. */
export type BoxCreationInput = {
  comment?: InputMaybe<Scalars['String']>;
  locationId: Scalars['Int'];
  numberOfItems?: InputMaybe<Scalars['Int']>;
  productId: Scalars['Int'];
  qrCode?: InputMaybe<Scalars['String']>;
  sizeId: Scalars['Int'];
  tagIds?: InputMaybe<Array<Scalars['Int']>>;
};

/** Utility type holding a page of [`Boxes`]({{Types.Box}}). */
export type BoxPage = {
  __typename?: 'BoxPage';
  elements: Array<Box>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** Classificators for [`Box`]({{Types.Box}}) state. */
export enum BoxState {
  Donated = 'Donated',
  InStock = 'InStock',
  Lost = 'Lost',
  MarkedForShipment = 'MarkedForShipment',
  Received = 'Received',
  Scrap = 'Scrap'
}

export type BoxUpdateInput = {
  comment?: InputMaybe<Scalars['String']>;
  labelIdentifier: Scalars['String'];
  locationId?: InputMaybe<Scalars['Int']>;
  numberOfItems?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  sizeId?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<BoxState>;
  tagIds?: InputMaybe<Array<Scalars['Int']>>;
};

/**
 * Representation of a classic physical location used to store [`Boxes`]({{Types.Box}}) (e.g. a warehouse).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
export type ClassicLocation = Location & {
  __typename?: 'ClassicLocation';
  base?: Maybe<Base>;
  /**  List of all the [`Boxes`]({{Types.Box}}) in this classic location  */
  boxes?: Maybe<BoxPage>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']>;
  /**  Default state for boxes in this classic location */
  defaultBoxState?: Maybe<BoxState>;
  id: Scalars['ID'];
  isShop: Scalars['Boolean'];
  isStockroom: Scalars['Boolean'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  name?: Maybe<Scalars['String']>;
  seq?: Maybe<Scalars['Int']>;
};


/**
 * Representation of a classic physical location used to store [`Boxes`]({{Types.Box}}) (e.g. a warehouse).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
export type ClassicLocationBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

/** TODO: Add description here once specs are final/confirmed */
export type DistributionEvent = {
  __typename?: 'DistributionEvent';
  boxes: Array<Box>;
  distributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  distributionSpot?: Maybe<DistributionSpot>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  packingListEntries: Array<PackingListEntry>;
  plannedEndDateTime: Scalars['Datetime'];
  plannedStartDateTime: Scalars['Datetime'];
  state: DistributionEventState;
  unboxedItemsCollections: Array<UnboxedItemsCollection>;
};

export type DistributionEventCreationInput = {
  distributionSpotId: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  plannedEndDateTime?: InputMaybe<Scalars['Datetime']>;
  plannedStartDateTime: Scalars['Datetime'];
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
  categoryLabel: Scalars['String'];
  distroEventTrackingGroupId: Scalars['String'];
  earliestPossibleDistroDate: Scalars['String'];
  genderLabel: Scalars['String'];
  inflow: Scalars['Int'];
  involvedDistributionEventIds: Scalars['String'];
  latestPossibleDistroDate: Scalars['String'];
  outflow: Scalars['Int'];
  potentiallyInvolvedDistributionSpots: Scalars['String'];
  productId: Scalars['String'];
  productName: Scalars['String'];
  sizeId: Scalars['String'];
  sizeLabel: Scalars['String'];
};

/** TODO: Add description here once specs are final/confirmed */
export type DistributionEventsTrackingEntry = {
  __typename?: 'DistributionEventsTrackingEntry';
  dateTimeOfTracking: Scalars['Datetime'];
  distributionEventsTrackingGroup: DistributionEventsTrackingGroup;
  flowDirection: DistributionEventTrackingFlowDirection;
  id: Scalars['ID'];
  numberOfItems: Scalars['Int'];
  product: Product;
  size: Size;
};

/** TODO: Add description here once specs are final/confirmed */
export type DistributionEventsTrackingGroup = {
  __typename?: 'DistributionEventsTrackingGroup';
  createdOn: Scalars['Datetime'];
  distributionEvents: Array<DistributionEvent>;
  distributionEventsTrackingEntries: Array<DistributionEventsTrackingEntry>;
  id: Scalars['ID'];
  state: DistributionEventsTrackingGroupState;
};

export enum DistributionEventsTrackingGroupState {
  Completed = 'Completed',
  InProgress = 'InProgress'
}

/** TODO: Add description here once specs are final/confirmed */
export type DistributionSpot = Location & {
  __typename?: 'DistributionSpot';
  base?: Maybe<Base>;
  boxes?: Maybe<BoxPage>;
  comment: Scalars['String'];
  distributionEvents: Array<DistributionEvent>;
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
};


/** TODO: Add description here once specs are final/confirmed */
export type DistributionSpotBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

export type DistributionSpotCreationInput = {
  baseId: Scalars['Int'];
  comment: Scalars['String'];
  latitude?: InputMaybe<Scalars['Float']>;
  longitude?: InputMaybe<Scalars['Float']>;
  name?: InputMaybe<Scalars['String']>;
};

/**
 * Optional filter values when retrieving [`Beneficiaries`]({{Types.Beneficiary}}).
 * If several fields are defined (not null), they are combined into a filter expression using logical AND (i.e. the filter returns only elements for which *all* fields are true).
 */
export type FilterBeneficiaryInput = {
  active?: InputMaybe<Scalars['Boolean']>;
  /**  Filter for all beneficiaries who were created on this date (incl.), or later.  */
  createdFrom?: InputMaybe<Scalars['Date']>;
  /**  Filter for all beneficiaries who were created on this date (incl.), or earlier.  */
  createdUntil?: InputMaybe<Scalars['Date']>;
  isVolunteer?: InputMaybe<Scalars['Boolean']>;
  /** Filter for all beneficiaries where pattern is (case-insensitive) part of first name, last name, or comment, or where pattern matches the group identifier */
  pattern?: InputMaybe<Scalars['String']>;
  registered?: InputMaybe<Scalars['Boolean']>;
};

/**
 * Optional filter values when retrieving [`Boxes`]({{Types.Box}}).
 * If several fields are defined (not null), they are combined into a filter expression using logical AND (i.e. the filter returns only elements for which *all* fields are true).
 */
export type FilterBoxInput = {
  /**  Filter for all boxes that who were last modified on this date (incl.), or later.  */
  lastModifiedFrom?: InputMaybe<Scalars['Date']>;
  /**  Filter for all boxes that who were last modified on this date (incl.), or earlier.  */
  lastModifiedUntil?: InputMaybe<Scalars['Date']>;
  productCategoryId?: InputMaybe<Scalars['Int']>;
  productGender?: InputMaybe<ProductGender>;
  /**  Filter for all boxes that have *one* of the specified states.  */
  states?: InputMaybe<Array<BoxState>>;
};

export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  changeDate?: Maybe<Scalars['Datetime']>;
  changes: Scalars['String'];
  id: Scalars['ID'];
  user?: Maybe<User>;
};

export enum HumanGender {
  Diverse = 'Diverse',
  Female = 'Female',
  Male = 'Male'
}

export type ItemsCollection = {
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID'];
  location?: Maybe<Location>;
  numberOfItems?: Maybe<Scalars['Int']>;
  product?: Maybe<Product>;
  size: Size;
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
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};


export type LocationBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};

export type Metrics = {
  __typename?: 'Metrics';
  /**
   * Return number of boxes, and contained items, moved by client's organisation in optional date range. Sorted by product category.
   * See `numberOfFamiliesServed` about using the `after` and `before` parameters.
   */
  movedStockOverview?: Maybe<Array<Maybe<StockOverview>>>;
  /**  Like `numberOfFamiliesServed` but add up all members of served families  */
  numberOfBeneficiariesServed?: Maybe<Scalars['Int']>;
  /**
   * Return number of families served by client's organisation in optional date range.
   * If `after` *and* `before` are specified, construct date range for filtering.
   * If one of `after` or `before` is specified, construct half-open date range.
   * If none is specified, the result is an all-time number.
   */
  numberOfFamiliesServed?: Maybe<Scalars['Int']>;
  /**
   * Return number of sales performed by client's organisation in optional date range.
   * See `numberOfFamiliesServed` about using the `after` and `before` parameters.
   */
  numberOfSales?: Maybe<Scalars['Int']>;
  /** Return number of boxes, and number of contained items, managed by client's organisation. */
  stockOverview?: Maybe<StockOverview>;
};


export type MetricsMovedStockOverviewArgs = {
  after?: InputMaybe<Scalars['Date']>;
  before?: InputMaybe<Scalars['Date']>;
};


export type MetricsNumberOfBeneficiariesServedArgs = {
  after?: InputMaybe<Scalars['Date']>;
  before?: InputMaybe<Scalars['Date']>;
};


export type MetricsNumberOfFamiliesServedArgs = {
  after?: InputMaybe<Scalars['Date']>;
  before?: InputMaybe<Scalars['Date']>;
};


export type MetricsNumberOfSalesArgs = {
  after?: InputMaybe<Scalars['Date']>;
  before?: InputMaybe<Scalars['Date']>;
};

/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type Mutation = {
  __typename?: 'Mutation';
  acceptTransferAgreement?: Maybe<TransferAgreement>;
  addPackingListEntryToDistributionEvent?: Maybe<PackingListEntry>;
  assignBoxToDistributionEvent?: Maybe<Box>;
  assignTag?: Maybe<TaggableResource>;
  cancelShipment?: Maybe<Shipment>;
  cancelTransferAgreement?: Maybe<TransferAgreement>;
  changeDistributionEventState?: Maybe<DistributionEvent>;
  completeDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  createBeneficiary?: Maybe<Beneficiary>;
  createBox?: Maybe<Box>;
  createDistributionEvent?: Maybe<DistributionEvent>;
  createDistributionSpot?: Maybe<DistributionSpot>;
  createQrCode?: Maybe<QrCode>;
  createShipment?: Maybe<Shipment>;
  createTag?: Maybe<Tag>;
  createTransferAgreement?: Maybe<TransferAgreement>;
  deleteTag?: Maybe<Tag>;
  markShipmentAsLost?: Maybe<Shipment>;
  moveItemsFromBoxToDistributionEvent?: Maybe<UnboxedItemsCollection>;
  moveItemsFromReturnTrackingGroupToBox?: Maybe<DistributionEventsTrackingEntry>;
  rejectTransferAgreement?: Maybe<TransferAgreement>;
  removeAllPackingListEntriesFromDistributionEventForProduct?: Maybe<Scalars['Boolean']>;
  removeItemsFromUnboxedItemsCollection?: Maybe<UnboxedItemsCollection>;
  removePackingListEntryFromDistributionEvent?: Maybe<DistributionEvent>;
  sendShipment?: Maybe<Shipment>;
  setReturnedNumberOfItemsForDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingEntry>;
  startDistributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  startReceivingShipment?: Maybe<Shipment>;
  unassignBoxFromDistributionEvent?: Maybe<Box>;
  unassignTag?: Maybe<TaggableResource>;
  updateBeneficiary?: Maybe<Beneficiary>;
  updateBox?: Maybe<Box>;
  updatePackingListEntry?: Maybe<PackingListEntry>;
  updateSelectedProductsForDistributionEventPackingList?: Maybe<DistributionEvent>;
  updateShipmentWhenPreparing?: Maybe<Shipment>;
  updateShipmentWhenReceiving?: Maybe<Shipment>;
  updateTag?: Maybe<Tag>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationAcceptTransferAgreementArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationAddPackingListEntryToDistributionEventArgs = {
  creationInput: PackingListEntryInput;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationAssignBoxToDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationAssignTagArgs = {
  assignmentInput?: InputMaybe<TagOperationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCancelShipmentArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCancelTransferAgreementArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationChangeDistributionEventStateArgs = {
  distributionEventId: Scalars['ID'];
  newState: DistributionEventState;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCompleteDistributionEventsTrackingGroupArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateBeneficiaryArgs = {
  creationInput?: InputMaybe<BeneficiaryCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateBoxArgs = {
  creationInput?: InputMaybe<BoxCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateDistributionEventArgs = {
  creationInput?: InputMaybe<DistributionEventCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateDistributionSpotArgs = {
  creationInput?: InputMaybe<DistributionSpotCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateQrCodeArgs = {
  boxLabelIdentifier?: InputMaybe<Scalars['String']>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateShipmentArgs = {
  creationInput?: InputMaybe<ShipmentCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateTagArgs = {
  creationInput?: InputMaybe<TagCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationCreateTransferAgreementArgs = {
  creationInput?: InputMaybe<TransferAgreementCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationDeleteTagArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMarkShipmentAsLostArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMoveItemsFromBoxToDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMoveItemsFromReturnTrackingGroupToBoxArgs = {
  distributionEventsTrackingGroupId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
  productId: Scalars['ID'];
  sizeId: Scalars['ID'];
  targetBoxLabelIdentifier: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationRejectTransferAgreementArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationRemoveAllPackingListEntriesFromDistributionEventForProductArgs = {
  distributionEventId: Scalars['ID'];
  productId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationRemoveItemsFromUnboxedItemsCollectionArgs = {
  id: Scalars['ID'];
  numberOfItems: Scalars['Int'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationRemovePackingListEntryFromDistributionEventArgs = {
  packingListEntryId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationSendShipmentArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationSetReturnedNumberOfItemsForDistributionEventsTrackingGroupArgs = {
  distributionEventsTrackingGroupId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
  productId: Scalars['ID'];
  sizeId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationStartDistributionEventsTrackingGroupArgs = {
  baseId: Scalars['ID'];
  distributionEventIds: Array<Scalars['ID']>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationStartReceivingShipmentArgs = {
  id: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUnassignBoxFromDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUnassignTagArgs = {
  unassignmentInput?: InputMaybe<TagOperationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateBeneficiaryArgs = {
  updateInput?: InputMaybe<BeneficiaryUpdateInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateBoxArgs = {
  updateInput?: InputMaybe<BoxUpdateInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdatePackingListEntryArgs = {
  numberOfItems: Scalars['Int'];
  packingListEntryId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateSelectedProductsForDistributionEventPackingListArgs = {
  distributionEventId: Scalars['ID'];
  productIdsToAdd: Array<Scalars['ID']>;
  productIdsToRemove: Array<Scalars['ID']>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateShipmentWhenPreparingArgs = {
  updateInput?: InputMaybe<ShipmentWhenPreparingUpdateInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateShipmentWhenReceivingArgs = {
  updateInput?: InputMaybe<ShipmentWhenReceivingUpdateInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationUpdateTagArgs = {
  updateInput?: InputMaybe<TagUpdateInput>;
};

/** Representation of an organisation. */
export type Organisation = {
  __typename?: 'Organisation';
  /**  List of all [`Bases`]({{Types.Base}}) managed by this organisation  */
  bases?: Maybe<Array<Base>>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** TODO: Add description here once specs are final/confirmed */
export type PackingListEntry = {
  __typename?: 'PackingListEntry';
  id: Scalars['ID'];
  matchingPackedItemsCollections: Array<ItemsCollection>;
  numberOfItems: Scalars['Int'];
  product?: Maybe<Product>;
  size?: Maybe<Size>;
  state: PackingListEntryState;
};

export type PackingListEntryInput = {
  distributionEventId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
  productId: Scalars['Int'];
  sizeId: Scalars['Int'];
};

/** TODO: Add description here once specs are final/confirmed */
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
  endCursor: Scalars['String'];
  /**  If true, a next page is available.  */
  hasNextPage: Scalars['Boolean'];
  /**  If true, a previous page is available.  */
  hasPreviousPage: Scalars['Boolean'];
  /** An identifier for the first element on the page. The client shall use it for the [`PaginationInput.before`]({{Types.PaginationInput}}) field */
  startCursor: Scalars['String'];
};

/**
 * Optional input for queries/fields that return a page of elements.
 * The specified fields must be either none OR `first` OR `after, first` OR `before, last`. Other combinations result in unexpected behavior and/or errors.
 * The default page size (`first` and `last`, resp.) is 50.
 * This format is inspired by https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
 */
export type PaginationInput = {
  /** Indicate requesting paginating of the first X elements after this cursor. By default, the first relevant element of the database. See also [`PageInfo.endCursor`]({{Types.PageInfo}}) */
  after?: InputMaybe<Scalars['String']>;
  /** Indicate requesting paginating of the last X elements before this cursor. See also [`PageInfo.startCursor`]({{Types.PageInfo}}) */
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/**
 * Representation of a product, containing information about [`ProductCategory`]({{Types.ProductCategory}}), size, and [`ProductGender`]({{Types.ProductGender}}).
 * The product is registered in a specific [`Base`]({{Types.Base}}).
 */
export type Product = {
  __typename?: 'Product';
  base?: Maybe<Base>;
  category: ProductCategory;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']>;
  gender?: Maybe<ProductGender>;
  id: Scalars['ID'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  name: Scalars['String'];
  price?: Maybe<Scalars['Float']>;
  sizeRange: SizeRange;
};

/** Representation of a product category. */
export type ProductCategory = {
  __typename?: 'ProductCategory';
  /**  Non-clothing categories don't have a product gender.  */
  hasGender: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  /**  List of all products registered in bases the client is authorized to view.  */
  products?: Maybe<ProductPage>;
  sizeRanges?: Maybe<Array<Maybe<SizeRange>>>;
};


/** Representation of a product category. */
export type ProductCategoryProductsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
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
  totalCount: Scalars['Int'];
};

/** Representation of a QR code, possibly associated with a [`Box`]({{Types.Box}}). */
export type QrCode = {
  __typename?: 'QrCode';
  /**  [`Box`]({{Types.Box}}) associated with the QR code (`null` if none associated)  */
  box?: Maybe<Box>;
  code: Scalars['String'];
  createdOn?: Maybe<Scalars['Datetime']>;
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  base?: Maybe<Base>;
  /**  Return all [`Bases`]({{Types.Base}}) that the client is authorized to view.  */
  bases: Array<Base>;
  /**  Return all [`Beneficiaries`]({{Types.Beneficiary}}) that the client is authorized to view.  */
  beneficiaries: BeneficiaryPage;
  beneficiary?: Maybe<Beneficiary>;
  box?: Maybe<Box>;
  distributionEvent?: Maybe<DistributionEvent>;
  distributionEventsTrackingGroup?: Maybe<DistributionEventsTrackingGroup>;
  distributionSpot?: Maybe<DistributionSpot>;
  /**  Return all [`DistributionSpots`]({{Types.DistributionSpot}}) that the client is authorized to view.  */
  distributionSpots: Array<DistributionSpot>;
  location?: Maybe<ClassicLocation>;
  /**  Return all [`ClassicLocations`]({{Types.ClassicLocation}}) that the client is authorized to view.  */
  locations: Array<ClassicLocation>;
  /**  Return various metrics about stock and beneficiaries for client's organisation.  */
  metrics?: Maybe<Metrics>;
  organisation?: Maybe<Organisation>;
  /**  Return all [`Organisations`]({{Types.Organisation}}) that the client is authorized to view.  */
  organisations: Array<Organisation>;
  packingListEntry?: Maybe<PackingListEntry>;
  product?: Maybe<Product>;
  /**  Return all [`ProductCategories`]({{Types.ProductCategory}}) that the client is authorized to view.  */
  productCategories: Array<ProductCategory>;
  productCategory?: Maybe<ProductCategory>;
  /**  Return all [`Products`]({{Types.Product}}) that the client is authorized to view.  */
  products: ProductPage;
  qrCode?: Maybe<QrCode>;
  qrExists?: Maybe<Scalars['Boolean']>;
  shipment?: Maybe<Shipment>;
  /**  Return all [`Shipments`]({{Types.Shipment}}) that the client is authorized to view.  */
  shipments: Array<Shipment>;
  tag?: Maybe<Tag>;
  /** Return all [`Tags`]({{Types.Tag}}) that the client is authorized to view. Optionally filter for tags of certain type. */
  tags: Array<Tag>;
  transferAgreement?: Maybe<TransferAgreement>;
  /**
   * Return all [`TransferAgreements`]({{Types.TransferAgreement}}) that the client is authorized to view.
   * Without any arguments, return transfer agreements that involve client's organisation,
   * regardless of agreement state. Optionally filter for agreements of certain state(s).
   */
  transferAgreements: Array<TransferAgreement>;
  user?: Maybe<User>;
  /**  Return all [`Users`]({{Types.User}}) that the client is authorized to view.  */
  users: Array<User>;
};


export type QueryBaseArgs = {
  id: Scalars['ID'];
};


export type QueryBeneficiariesArgs = {
  filterInput?: InputMaybe<FilterBeneficiaryInput>;
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryBeneficiaryArgs = {
  id: Scalars['ID'];
};


export type QueryBoxArgs = {
  labelIdentifier: Scalars['String'];
};


export type QueryDistributionEventArgs = {
  id: Scalars['ID'];
};


export type QueryDistributionEventsTrackingGroupArgs = {
  id: Scalars['ID'];
};


export type QueryDistributionSpotArgs = {
  id: Scalars['ID'];
};


export type QueryLocationArgs = {
  id: Scalars['ID'];
};


export type QueryMetricsArgs = {
  organisationId?: InputMaybe<Scalars['ID']>;
};


export type QueryOrganisationArgs = {
  id: Scalars['ID'];
};


export type QueryPackingListEntryArgs = {
  id: Scalars['ID'];
};


export type QueryProductArgs = {
  id: Scalars['ID'];
};


export type QueryProductCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryProductsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryQrCodeArgs = {
  qrCode: Scalars['String'];
};


export type QueryQrExistsArgs = {
  qrCode?: InputMaybe<Scalars['String']>;
};


export type QueryShipmentArgs = {
  id: Scalars['ID'];
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryTagsArgs = {
  tagType?: InputMaybe<TagType>;
};


export type QueryTransferAgreementArgs = {
  id: Scalars['ID'];
};


export type QueryTransferAgreementsArgs = {
  states?: InputMaybe<Array<TransferAgreementState>>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

export type Shipment = {
  __typename?: 'Shipment';
  canceledBy?: Maybe<User>;
  canceledOn?: Maybe<Scalars['Datetime']>;
  completedBy?: Maybe<User>;
  completedOn?: Maybe<Scalars['Datetime']>;
  details: Array<ShipmentDetail>;
  id: Scalars['ID'];
  receivingStartedBy?: Maybe<User>;
  receivingStartedOn?: Maybe<Scalars['Datetime']>;
  sentBy?: Maybe<User>;
  sentOn?: Maybe<Scalars['Datetime']>;
  sourceBase: Base;
  startedBy: User;
  startedOn: Scalars['Datetime'];
  state?: Maybe<ShipmentState>;
  targetBase: Base;
  transferAgreement: TransferAgreement;
};

export type ShipmentCreationInput = {
  sourceBaseId: Scalars['Int'];
  targetBaseId: Scalars['Int'];
  transferAgreementId: Scalars['Int'];
};

export type ShipmentDetail = {
  __typename?: 'ShipmentDetail';
  box: Box;
  createdBy: User;
  createdOn: Scalars['Datetime'];
  deletedBy?: Maybe<User>;
  deletedOn?: Maybe<Scalars['Datetime']>;
  id: Scalars['ID'];
  shipment: Shipment;
  sourceLocation?: Maybe<ClassicLocation>;
  sourceProduct?: Maybe<Product>;
  targetLocation?: Maybe<ClassicLocation>;
  targetProduct?: Maybe<Product>;
};

export type ShipmentDetailUpdateInput = {
  id: Scalars['ID'];
  targetLocationId: Scalars['Int'];
  targetProductId: Scalars['Int'];
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
  id: Scalars['ID'];
  preparedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  removedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  targetBaseId?: InputMaybe<Scalars['Int']>;
};

export type ShipmentWhenReceivingUpdateInput = {
  id: Scalars['ID'];
  lostBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  receivedShipmentDetailUpdateInputs?: InputMaybe<Array<ShipmentDetailUpdateInput>>;
};

/** Representation of product size. */
export type Size = {
  __typename?: 'Size';
  id: Scalars['ID'];
  label: Scalars['String'];
};

/** Representation of group of sizes. */
export type SizeRange = {
  __typename?: 'SizeRange';
  id: Scalars['ID'];
  label: Scalars['String'];
  productCategory?: Maybe<Array<ProductCategory>>;
  sizes: Array<Size>;
};

export type StockOverview = {
  __typename?: 'StockOverview';
  numberOfBoxes?: Maybe<Scalars['Int']>;
  numberOfItems?: Maybe<Scalars['Int']>;
  productCategoryName?: Maybe<Scalars['String']>;
};

/** Representation of a tag. */
export type Tag = {
  __typename?: 'Tag';
  base: Base;
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  taggedResources?: Maybe<Array<TaggableResource>>;
  type: TagType;
};

export type TagCreationInput = {
  baseId: Scalars['Int'];
  color: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  type: TagType;
};

export type TagOperationInput = {
  id: Scalars['ID'];
  resourceId: Scalars['ID'];
  resourceType: TaggableResourceType;
};

/** Classificators for [`Tag`]({{Types.Tag}}) type. */
export enum TagType {
  All = 'All',
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

export type TagUpdateInput = {
  color?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<TagType>;
};

/**  Union for resources that tags can be applied to.  */
export type TaggableResource = Beneficiary | Box;

/** Classificator for resources that a [`Tag`]({{Types.Tag}}) can be applied to (according to [`TaggableResource`]({{Types.TaggableResource}})). */
export enum TaggableResourceType {
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

/** Representation of a transaction executed by a beneficiary (spending or receiving tokens). */
export type Transaction = {
  __typename?: 'Transaction';
  beneficiary: Beneficiary;
  /**  Number of transferred products  */
  count?: Maybe<Scalars['Int']>;
  createdBy?: Maybe<User>;
  createdOn: Scalars['Datetime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  product?: Maybe<Product>;
  /**  Value of the transaction  */
  tokens?: Maybe<Scalars['Int']>;
};

export type TransferAgreement = {
  __typename?: 'TransferAgreement';
  acceptedBy?: Maybe<User>;
  acceptedOn?: Maybe<Scalars['Datetime']>;
  comment?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  requestedBy: User;
  requestedOn: Scalars['Datetime'];
  shipments: Array<Shipment>;
  /**  List of all bases of the source organisation included in the agreement  */
  sourceBases?: Maybe<Array<Base>>;
  sourceOrganisation: Organisation;
  state?: Maybe<TransferAgreementState>;
  /**  List of all bases of the target organisation included in the agreement  */
  targetBases?: Maybe<Array<Base>>;
  targetOrganisation: Organisation;
  terminatedBy?: Maybe<User>;
  terminatedOn?: Maybe<Scalars['Datetime']>;
  type: TransferAgreementType;
  validFrom: Scalars['Datetime'];
  validUntil?: Maybe<Scalars['Datetime']>;
};

export type TransferAgreementCreationInput = {
  comment?: InputMaybe<Scalars['String']>;
  initiatingOrganisationBaseIds: Array<Scalars['Int']>;
  initiatingOrganisationId: Scalars['Int'];
  partnerOrganisationBaseIds?: InputMaybe<Array<Scalars['Int']>>;
  partnerOrganisationId: Scalars['Int'];
  timezone?: InputMaybe<Scalars['String']>;
  type: TransferAgreementType;
  validFrom?: InputMaybe<Scalars['Date']>;
  validUntil?: InputMaybe<Scalars['Date']>;
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

export type UnboxedItemsCollection = ItemsCollection & {
  __typename?: 'UnboxedItemsCollection';
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
  numberOfItems?: Maybe<Scalars['Int']>;
  product?: Maybe<Product>;
  size: Size;
};

/**
 * Representation of a user signed up for the web application.
 * The user is a member of a specific [`Organisation`]({{Types.Organisation}}).
 */
export type User = {
  __typename?: 'User';
  /**  List of all [`Bases`]({{Types.Base}}) this user can access  */
  bases?: Maybe<Array<Maybe<Base>>>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastAction?: Maybe<Scalars['Datetime']>;
  lastLogin?: Maybe<Scalars['Datetime']>;
  name?: Maybe<Scalars['String']>;
  organisation?: Maybe<Organisation>;
  validFirstDay?: Maybe<Scalars['Date']>;
  validLastDay?: Maybe<Scalars['Date']>;
};

export type BasesQueryVariables = Exact<{ [key: string]: never; }>;


export type BasesQuery = { __typename?: 'Query', bases: Array<{ __typename?: 'Base', id: string, name: string }> };

export type OrganisationBasicFieldsFragment = { __typename?: 'Organisation', id: string, name: string };

export type BaseBasicFieldsFragment = { __typename?: 'Base', id: string, name: string };

export type UserBasicFieldsFragment = { __typename?: 'User', id: string, name?: string | null };

export type ProductBasicFieldsFragment = { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null };

export type SizeFieldsFragment = { __typename?: 'Size', id: string, label: string };

export type TagFieldsFragment = { __typename?: 'Tag', id: string, name: string, color?: string | null };

export type TagOptionsFragment = { __typename?: 'Tag', color?: string | null, value: string, label: string };

export type DistroEventFieldsFragment = { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null };

export type BaseOrgFieldsFragment = { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } };

export type HistoryFieldsFragment = { __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null };

export type SizeRangeFieldsFragment = { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> };

export type BoxFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null };

export type BoxWithoutLocationFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null };

export type BoxWithSizeTagProductFieldsFragment = { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, size: { __typename?: 'Size', id: string, label: string }, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null };

export type TransferAgreementFieldsFragment = { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type ProductFieldsFragment = { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } };

export type ShipmentDetailFieldsFragment = { __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type ShipmentFieldsFragment = { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null };

export type BoxDetailsQueryVariables = Exact<{
  labelIdentifier: Scalars['String'];
}>;


export type BoxDetailsQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type GetBoxLabelIdentifierForQrCodeQueryVariables = Exact<{
  qrCode: Scalars['String'];
}>;


export type GetBoxLabelIdentifierForQrCodeQuery = { __typename?: 'Query', qrCode?: { __typename?: 'QrCode', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null } | null };

export type CheckIfQrExistsInDbQueryVariables = Exact<{
  qrCode: Scalars['String'];
}>;


export type CheckIfQrExistsInDbQuery = { __typename?: 'Query', qrExists?: boolean | null };

export type BaseDataQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type BaseDataQuery = { __typename?: 'Query', base?: { __typename?: 'Base', name: string, locations: Array<{ __typename?: 'ClassicLocation', name?: string | null }> } | null };

export type BoxByLabelIdentifierQueryVariables = Exact<{
  labelIdentifier: Scalars['String'];
}>;


export type BoxByLabelIdentifierQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null, size: { __typename?: 'Size', id: string, label: string }, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type UpdateNumberOfItemsMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  numberOfItems: Scalars['Int'];
}>;


export type UpdateNumberOfItemsMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type UpdateStateMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  newState: BoxState;
}>;


export type UpdateStateMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type UpdateLocationOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  newLocationId: Scalars['Int'];
}>;


export type UpdateLocationOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null, location?: { __typename: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | { __typename: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, distributionEventsBeforeReturnedFromDistributionState: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null }> } | null } | null, size: { __typename?: 'Size', id: string, label: string }, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null };

export type AllProductsAndLocationsForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type AllProductsAndLocationsForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', color?: string | null, value: string, label: string }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, seq?: number | null }>, products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type CreateBoxMutationVariables = Exact<{
  locationId: Scalars['Int'];
  productId: Scalars['Int'];
  sizeId: Scalars['Int'];
  numberOfItems: Scalars['Int'];
  comment?: InputMaybe<Scalars['String']>;
  tagIds?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
  qrCode?: InputMaybe<Scalars['String']>;
}>;


export type CreateBoxMutation = { __typename?: 'Mutation', createBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type BoxByLabelIdentifierAndAllProductsWithBaseIdQueryVariables = Exact<{
  baseId: Scalars['ID'];
  labelIdentifier: Scalars['String'];
}>;


export type BoxByLabelIdentifierAndAllProductsWithBaseIdQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, tags?: Array<{ __typename?: 'Tag', color?: string | null, id: string, name: string, value: string, label: string }> | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null } | null, base?: { __typename?: 'Base', tags?: Array<{ __typename?: 'Tag', color?: string | null, value: string, label: string }> | null, locations: Array<{ __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null }>, products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type UpdateContentOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  productId: Scalars['Int'];
  locationId: Scalars['Int'];
  numberOfItems: Scalars['Int'];
  sizeId: Scalars['Int'];
  comment?: InputMaybe<Scalars['String']>;
  tagIds?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type UpdateContentOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type BoxesForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type BoxesForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', locations: Array<{ __typename?: 'ClassicLocation', name?: string | null, boxes?: { __typename?: 'BoxPage', totalCount: number, elements: Array<{ __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }> } | null }> } | null };

export type CreateDistributionEventMutationVariables = Exact<{
  distributionSpotId: Scalars['Int'];
  name: Scalars['String'];
  plannedStartDateTime: Scalars['Datetime'];
  plannedEndDateTime: Scalars['Datetime'];
}>;


export type CreateDistributionEventMutation = { __typename?: 'Mutation', createDistributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any } | null };

export type DistributionSpotQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DistributionSpotQuery = { __typename?: 'Query', distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null };

export type CreateDistributionSpotMutationVariables = Exact<{
  baseId: Scalars['Int'];
  name: Scalars['String'];
  comment: Scalars['String'];
  latitude?: InputMaybe<Scalars['Float']>;
  longitude?: InputMaybe<Scalars['Float']>;
}>;


export type CreateDistributionSpotMutation = { __typename?: 'Mutation', createDistributionSpot?: { __typename?: 'DistributionSpot', id: string } | null };

export type RemoveEntryFromPackingListMutationVariables = Exact<{
  packingListEntryId: Scalars['ID'];
}>;


export type RemoveEntryFromPackingListMutation = { __typename?: 'Mutation', removePackingListEntryFromDistributionEvent?: { __typename?: 'DistributionEvent', id: string } | null };

export type RemoveAllPackingListEntriesFromDistributionEventForProductMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  productId: Scalars['ID'];
}>;


export type RemoveAllPackingListEntriesFromDistributionEventForProductMutation = { __typename?: 'Mutation', removeAllPackingListEntriesFromDistributionEventForProduct?: boolean | null };

export type UpdateSelectedProductsForDistributionEventPackingListMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  productIdsToAdd: Array<Scalars['ID']> | Scalars['ID'];
  productIdsToRemove: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type UpdateSelectedProductsForDistributionEventPackingListMutation = { __typename?: 'Mutation', updateSelectedProductsForDistributionEventPackingList?: { __typename?: 'DistributionEvent', id: string } | null };

export type UpdatePackingListEntryMutationVariables = Exact<{
  packingListEntryId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
}>;


export type UpdatePackingListEntryMutation = { __typename?: 'Mutation', updatePackingListEntry?: { __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null } | null };

export type AddToPackingListMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  productId: Scalars['Int'];
  sizeId: Scalars['Int'];
  numberOfItems: Scalars['Int'];
}>;


export type AddToPackingListMutation = { __typename?: 'Mutation', addPackingListEntryToDistributionEvent?: { __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null } | null };

export type RemoveItemsFromUnboxedItemsCollectionMutationVariables = Exact<{
  id: Scalars['ID'];
  numberOfItems: Scalars['Int'];
}>;


export type RemoveItemsFromUnboxedItemsCollectionMutation = { __typename?: 'Mutation', removeItemsFromUnboxedItemsCollection?: { __typename?: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null, product?: { __typename?: 'Product', name: string } | null } | null };

export type DownloadDistributionEventsStatisticsQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DownloadDistributionEventsStatisticsQuery = { __typename?: 'Query', base?: { __typename?: 'Base', id: string, distributionEventsStatistics: Array<{ __typename?: 'DistributionEventsStatistics', productName: string, sizeLabel: string, genderLabel: string, categoryLabel: string, inflow: number, outflow: number, earliestPossibleDistroDate: string, latestPossibleDistroDate: string, potentiallyInvolvedDistributionSpots: string, involvedDistributionEventIds: string, distroEventTrackingGroupId: string, productId: string, sizeId: string }> } | null };

export type AllProductsForPackingListQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type AllProductsForPackingListQuery = { __typename?: 'Query', base?: { __typename?: 'Base', products: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', id: string, name: string }, sizeRange: { __typename?: 'SizeRange', sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } | null };

export type DistroSpotsForBaseIdQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DistroSpotsForBaseIdQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionSpots: Array<{ __typename?: 'DistributionSpot', id: string, name?: string | null, latitude?: number | null, longitude?: number | null, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any, plannedEndDateTime: any }> }> } | null };

export type DistributionEventsForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DistributionEventsForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type AssignBoxToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
}>;


export type AssignBoxToDistributionEventMutation = { __typename?: 'Mutation', assignBoxToDistributionEvent?: { __typename?: 'Box', id: string, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null } | null };

export type UnassignBoxFromDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
}>;


export type UnassignBoxFromDistributionEventMutation = { __typename?: 'Mutation', unassignBoxFromDistributionEvent?: { __typename?: 'Box', id: string } | null };

export type MoveItemsToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
}>;


export type MoveItemsToDistributionEventMutation = { __typename?: 'Mutation', moveItemsFromBoxToDistributionEvent?: { __typename?: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, boxes: Array<{ __typename?: 'Box', product?: { __typename?: 'Product', name: string } | null }>, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null } | null };

export type ReturnTrackingGroupIdForDistributionEventQueryVariables = Exact<{
  distributionEventId: Scalars['ID'];
}>;


export type ReturnTrackingGroupIdForDistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', distributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string } | null } | null };

export type PackingListEntriesForDistributionEventQueryVariables = Exact<{
  distributionEventId: Scalars['ID'];
}>;


export type PackingListEntriesForDistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, packingListEntries: Array<{ __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, matchingPackedItemsCollections: Array<{ __typename: 'Box', labelIdentifier: string, numberOfItems?: number | null } | { __typename: 'UnboxedItemsCollection', id: string, numberOfItems?: number | null }> }> } | null };

export type ChangeDistributionEventStateMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  newState: DistributionEventState;
}>;


export type ChangeDistributionEventStateMutation = { __typename?: 'Mutation', changeDistributionEventState?: { __typename: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState } | null };

export type DistributionEventsTrackingGroupQueryVariables = Exact<{
  trackingGroupId: Scalars['ID'];
}>;


export type DistributionEventsTrackingGroupQuery = { __typename?: 'Query', distributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string, distributionEventsTrackingEntries: Array<{ __typename?: 'DistributionEventsTrackingEntry', id: string, numberOfItems: number, flowDirection: DistributionEventTrackingFlowDirection, product: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', id: string, name: string } }, size: { __typename?: 'Size', id: string, label: string } }>, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, state: DistributionEventState, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type StartDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventIds: Array<Scalars['ID']> | Scalars['ID'];
  baseId: Scalars['ID'];
}>;


export type StartDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', startDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type DistributionEventQueryVariables = Exact<{
  eventId: Scalars['ID'];
}>;


export type DistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null };

export type DataForReturnTrackingOverviewForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DataForReturnTrackingOverviewForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionEventsTrackingGroups: Array<{ __typename?: 'DistributionEventsTrackingGroup', id: string, state: DistributionEventsTrackingGroupState, createdOn: any, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> }>, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type SetReturnedNumberOfItemsForDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventsTrackingGroupId: Scalars['ID'];
  productId: Scalars['ID'];
  sizeId: Scalars['ID'];
  numberOfReturnedItems: Scalars['Int'];
}>;


export type SetReturnedNumberOfItemsForDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', setReturnedNumberOfItemsForDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingEntry', id: string } | null };

export type CompleteDistributionEventsTrackingGroupMutationVariables = Exact<{
  distributionEventsTrackingGroupId: Scalars['ID'];
}>;


export type CompleteDistributionEventsTrackingGroupMutation = { __typename?: 'Mutation', completeDistributionEventsTrackingGroup?: { __typename?: 'DistributionEventsTrackingGroup', id: string } | null };

export type AllAcceptedTransferAgreementsQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type AllAcceptedTransferAgreementsQuery = { __typename?: 'Query', base?: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } } | null, transferAgreements: Array<{ __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type CreateShipmentMutationVariables = Exact<{
  sourceBaseId: Scalars['Int'];
  targetBaseId: Scalars['Int'];
  transferAgreementId: Scalars['Int'];
}>;


export type CreateShipmentMutation = { __typename?: 'Mutation', createShipment?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type NewShipmentFragment = { __typename?: 'Shipment', id: string };

export type AllOrganisationsAndBasesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllOrganisationsAndBasesQuery = { __typename?: 'Query', organisations: Array<{ __typename?: 'Organisation', id: string, name: string, bases?: Array<{ __typename?: 'Base', id: string, name: string }> | null }> };

export type CreateTransferAgreementMutationVariables = Exact<{
  initiatingOrganisationId: Scalars['Int'];
  partnerOrganisationId: Scalars['Int'];
  type: TransferAgreementType;
  validFrom?: InputMaybe<Scalars['Date']>;
  validUntil?: InputMaybe<Scalars['Date']>;
  timezone?: InputMaybe<Scalars['String']>;
  initiatingOrganisationBaseIds: Array<Scalars['Int']> | Scalars['Int'];
  partnerOrganisationBaseIds?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
  comment?: InputMaybe<Scalars['String']>;
}>;


export type CreateTransferAgreementMutation = { __typename?: 'Mutation', createTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type NewTransferAgreementFragment = { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType };

export type ShipmentByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ShipmentByIdQuery = { __typename?: 'Query', shipment?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type UpdateShipmentWhenPreparingMutationVariables = Exact<{
  id: Scalars['ID'];
  removedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  preparedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type UpdateShipmentWhenPreparingMutation = { __typename?: 'Mutation', updateShipmentWhenPreparing?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type UpdateShipmentWhenReceivingMutationVariables = Exact<{
  id: Scalars['ID'];
  receivedShipmentDetailUpdateInputs?: InputMaybe<Array<ShipmentDetailUpdateInput> | ShipmentDetailUpdateInput>;
  lostBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type UpdateShipmentWhenReceivingMutation = { __typename?: 'Mutation', updateShipmentWhenReceiving?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type SendShipmentMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type SendShipmentMutation = { __typename?: 'Mutation', sendShipment?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type CancelShipmentMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CancelShipmentMutation = { __typename?: 'Mutation', cancelShipment?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type LostShipmentMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type LostShipmentMutation = { __typename?: 'Mutation', markShipmentAsLost?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, location?: { __typename?: 'ClassicLocation', defaultBoxState?: BoxState | null, id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', id: string, name: string } | null } | null, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type StartReceivingShipmentMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type StartReceivingShipmentMutation = { __typename?: 'Mutation', startReceivingShipment?: { __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type ShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShipmentsQuery = { __typename?: 'Query', shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, startedOn: any, sentOn?: any | null, receivingStartedOn?: any | null, completedOn?: any | null, canceledOn?: any | null, details: Array<{ __typename?: 'ShipmentDetail', id: string, createdOn: any, deletedOn?: any | null, box: { __typename?: 'Box', labelIdentifier: string, state: BoxState, numberOfItems?: number | null, comment?: string | null, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size: { __typename?: 'Size', id: string, label: string }, tags?: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> | null, history?: Array<{ __typename?: 'HistoryEntry', id: string, changes: string, changeDate?: any | null, user?: { __typename?: 'User', id: string, name?: string | null } | null }> | null }, sourceProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, targetProduct?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', id: string, label: string, sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, createdBy: { __typename?: 'User', id: string, name?: string | null }, deletedBy?: { __typename?: 'User', id: string, name?: string | null } | null }>, sourceBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, targetBase: { __typename?: 'Base', id: string, name: string, organisation: { __typename?: 'Organisation', id: string, name: string } }, transferAgreement: { __typename?: 'TransferAgreement', id: string, comment?: string | null, type: TransferAgreementType }, startedBy: { __typename?: 'User', id: string, name?: string | null }, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null, receivingStartedBy?: { __typename?: 'User', id: string, name?: string | null } | null, completedBy?: { __typename?: 'User', id: string, name?: string | null } | null, canceledBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type TransferAgreementsQueryVariables = Exact<{ [key: string]: never; }>;


export type TransferAgreementsQuery = { __typename?: 'Query', transferAgreements: Array<{ __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type AcceptTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type AcceptTransferAgreementMutation = { __typename?: 'Mutation', acceptTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type RejectTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type RejectTransferAgreementMutation = { __typename?: 'Mutation', rejectTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };

export type CancelTransferAgreementMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CancelTransferAgreementMutation = { __typename?: 'Mutation', cancelTransferAgreement?: { __typename?: 'TransferAgreement', id: string, type: TransferAgreementType, state?: TransferAgreementState | null, comment?: string | null, validFrom: any, validUntil?: any | null, requestedOn: any, acceptedOn?: any | null, terminatedOn?: any | null, sourceOrganisation: { __typename?: 'Organisation', id: string, name: string }, sourceBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, targetOrganisation: { __typename?: 'Organisation', id: string, name: string }, targetBases?: Array<{ __typename?: 'Base', id: string, name: string }> | null, shipments: Array<{ __typename?: 'Shipment', id: string, state?: ShipmentState | null, sourceBase: { __typename?: 'Base', id: string, name: string }, targetBase: { __typename?: 'Base', id: string, name: string } }>, requestedBy: { __typename?: 'User', id: string, name?: string | null }, acceptedBy?: { __typename?: 'User', id: string, name?: string | null } | null, terminatedBy?: { __typename?: 'User', id: string, name?: string | null } | null } | null };
