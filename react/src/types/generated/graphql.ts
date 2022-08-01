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
  beneficiaries: BeneficiaryPage;
  boxPlaces: Array<BoxPlace>;
  currencyName?: Maybe<Scalars['String']>;
  distributionEvents: Array<DistributionEvent>;
  distributionSpots: Array<DistributionSpot>;
  id: Scalars['ID'];
  /**  List of all [`Locations`]({{Types.Location}}) present in this base  */
  locations: Array<Location>;
  name: Scalars['String'];
  organisation: Organisation;
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
  tags: Array<Tag>;
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
  baseId?: InputMaybe<Scalars['Int']>;
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
  id: Scalars['ID'];
  /**  The number of items the box contains.  */
  items?: Maybe<Scalars['Int']>;
  /**  Sequence of numbers for identifying the box, usually written on box label  */
  labelIdentifier: Scalars['String'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  place?: Maybe<BoxPlace>;
  product?: Maybe<Product>;
  qrCode?: Maybe<QrCode>;
  size: Size;
  state: BoxState;
  tags: Array<Tag>;
};

/** GraphQL input types for mutations **only**. */
export type BoxCreationInput = {
  comment?: InputMaybe<Scalars['String']>;
  items?: InputMaybe<Scalars['Int']>;
  locationId: Scalars['Int'];
  productId: Scalars['Int'];
  qrCode?: InputMaybe<Scalars['String']>;
  sizeId: Scalars['Int'];
};

/** Utility type holding a page of [`Boxes`]({{Types.Box}}). */
export type BoxPage = {
  __typename?: 'BoxPage';
  elements: Array<Box>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type BoxPlace = {
  base?: Maybe<Base>;
  boxes?: Maybe<BoxPage>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};


export type BoxPlaceBoxesArgs = {
  filterInput?: InputMaybe<FilterBoxInput>;
  paginationInput?: InputMaybe<PaginationInput>;
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
  items?: InputMaybe<Scalars['Int']>;
  labelIdentifier: Scalars['String'];
  locationId?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  sizeId?: InputMaybe<Scalars['Int']>;
};

/** TODO: Add description here once specs are final/confirmed */
export type DistributionEvent = {
  __typename?: 'DistributionEvent';
  boxes: Array<Box>;
  distributionSpot?: Maybe<DistributionSpot>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  packingListEntries: Array<PackingListEntry>;
  plannedEndDateTime: Scalars['Datetime'];
  plannedStartDateTime: Scalars['Datetime'];
  state: DistributionEventState;
  unboxedItemsCollections?: Maybe<Array<UnboxedItemsCollection>>;
};

export type DistributionEventCreationInput = {
  distributionSpotId: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  plannedEndDateTime?: InputMaybe<Scalars['Datetime']>;
  plannedStartDateTime?: InputMaybe<Scalars['Datetime']>;
};

/** TODO: Add description here once specs are final/confirmed */
export enum DistributionEventState {
  Completed = 'Completed',
  OnDistro = 'OnDistro',
  Packing = 'Packing',
  Planning = 'Planning',
  Returned = 'Returned'
}

/** TODO: Add description here once specs are final/confirmed */
export type DistributionSpot = BoxPlace & {
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

export enum HumanGender {
  Diverse = 'Diverse',
  Female = 'Female',
  Male = 'Male'
}

export type ItemsCollection = {
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID'];
  items?: Maybe<Scalars['Int']>;
  place?: Maybe<BoxPlace>;
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

/**
 * Representation of a physical location used to store [`Boxes`]({{Types.Box}}).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
export type Location = BoxPlace & {
  __typename?: 'Location';
  base?: Maybe<Base>;
  /**  List of all the [`Boxes`]({{Types.Box}}) in this location  */
  boxes?: Maybe<BoxPage>;
  createdBy?: Maybe<User>;
  createdOn?: Maybe<Scalars['Datetime']>;
  /**  Default state for boxes in this location  */
  defaultBoxState?: Maybe<BoxState>;
  id: Scalars['ID'];
  isShop: Scalars['Boolean'];
  isStockroom: Scalars['Boolean'];
  lastModifiedBy?: Maybe<User>;
  lastModifiedOn?: Maybe<Scalars['Datetime']>;
  name?: Maybe<Scalars['String']>;
};


/**
 * Representation of a physical location used to store [`Boxes`]({{Types.Box}}).
 * The location is part of a specific [`Base`]({{Types.Base}}).
 */
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
  cancelShipment?: Maybe<Shipment>;
  cancelTransferAgreement?: Maybe<TransferAgreement>;
  changeDistributionEventState?: Maybe<DistributionEvent>;
  createBeneficiary?: Maybe<Beneficiary>;
  createBox?: Maybe<Box>;
  createDistributionEvent?: Maybe<DistributionEvent>;
  createDistributionSpot?: Maybe<DistributionSpot>;
  createQrCode?: Maybe<QrCode>;
  createShipment?: Maybe<Shipment>;
  createTransferAgreement?: Maybe<TransferAgreement>;
  markDistributionEventAsComplete?: Maybe<DistributionEvent>;
  moveBoxFromDistributionEventToLocation?: Maybe<DistributionEvent>;
  moveBoxToDistributionEvent?: Maybe<Box>;
  moveItemsFromBoxToDistributionEvent?: Maybe<UnboxedItemsCollection>;
  moveItemsFromDistributionEventToBox?: Maybe<DistributionEvent>;
  rejectTransferAgreement?: Maybe<TransferAgreement>;
  removePackingListEntryFromDistributionEvent?: Maybe<DistributionEvent>;
  sendShipment?: Maybe<Shipment>;
  updateBeneficiary?: Maybe<Beneficiary>;
  updateBox?: Maybe<Box>;
  updateShipment?: Maybe<Shipment>;
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
  creationInput: PacklistEntryInput;
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
export type MutationCreateTransferAgreementArgs = {
  creationInput?: InputMaybe<TransferAgreementCreationInput>;
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMarkDistributionEventAsCompleteArgs = {
  distributionEventId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMoveBoxFromDistributionEventToLocationArgs = {
  boxLabelIdentifier: Scalars['ID'];
  locationId: Scalars['ID'];
};


/**
 * Naming convention:
 * - input argument: creationInput/updateInput
 * - input type: <Resource>CreationInput/UpdateInput
 */
export type MutationMoveBoxToDistributionEventArgs = {
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
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
export type MutationMoveItemsFromDistributionEventToBoxArgs = {
  boxLabelIdentifier: Scalars['ID'];
  unboxedItemsCollectionId: Scalars['ID'];
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
export type MutationUpdateShipmentArgs = {
  updateInput?: InputMaybe<ShipmentUpdateInput>;
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

/** TODO: Add description here once specs are final/confirmed */
export enum PackingListEntryState {
  NotStarted = 'NotStarted',
  Packed = 'Packed',
  PackingInProgress = 'PackingInProgress'
}

export type PacklistEntryInput = {
  distributionEventId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
  productId: Scalars['Int'];
  sizeId: Scalars['Int'];
};

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
  distributionSpot?: Maybe<DistributionSpot>;
  /**  Return all [`DistributionSpots`]({{Types.DistributionSpot}}) that the client is authorized to view.  */
  distributionSpots: Array<DistributionSpot>;
  location?: Maybe<Location>;
  /**  Return all [`Locations`]({{Types.Location}}) that the client is authorized to view.  */
  locations: Array<Location>;
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
  sentBy?: Maybe<User>;
  sentOn?: Maybe<Scalars['Datetime']>;
  sourceBase?: Maybe<Base>;
  startedBy: User;
  startedOn: Scalars['Datetime'];
  state?: Maybe<ShipmentState>;
  targetBase?: Maybe<Base>;
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
  sourceLocation?: Maybe<Location>;
  sourceProduct?: Maybe<Product>;
  targetLocation?: Maybe<Location>;
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
  Sent = 'Sent'
}

export type ShipmentUpdateInput = {
  id: Scalars['ID'];
  lostBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  preparedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  receivedShipmentDetailUpdateInputs?: InputMaybe<Array<ShipmentDetailUpdateInput>>;
  removedBoxLabelIdentifiers?: InputMaybe<Array<Scalars['String']>>;
  targetBaseId?: InputMaybe<Scalars['Int']>;
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
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  taggedResources: Array<TaggableResource>;
  type: TagType;
};

/** Classificators for [`Tag`]({{Types.Tag}}) type. */
export enum TagType {
  All = 'All',
  Beneficiary = 'Beneficiary',
  Box = 'Box'
}

/**  Union for resources that tags can be applied to.  */
export type TaggableResource = Beneficiary | Box;

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
  sourceBaseIds?: InputMaybe<Array<Scalars['Int']>>;
  targetBaseIds?: InputMaybe<Array<Scalars['Int']>>;
  targetOrganisationId: Scalars['Int'];
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
  Unidirectional = 'Unidirectional'
}

export type UnboxedItemsCollection = ItemsCollection & {
  __typename?: 'UnboxedItemsCollection';
  distributionEvent?: Maybe<DistributionEvent>;
  id: Scalars['ID'];
  items?: Maybe<Scalars['Int']>;
  label?: Maybe<Scalars['String']>;
  place?: Maybe<BoxPlace>;
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
  email: Scalars['String'];
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

export type GetBoxLabelIdentifierForQrCodeQueryVariables = Exact<{
  qrCode: Scalars['String'];
}>;


export type GetBoxLabelIdentifierForQrCodeQuery = { __typename?: 'Query', qrCode?: { __typename?: 'QrCode', box?: { __typename?: 'Box', id: string, labelIdentifier: string } | null } | null };

export type BaseDataQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type BaseDataQuery = { __typename?: 'Query', base?: { __typename?: 'Base', name: string, locations: Array<{ __typename?: 'Location', name?: string | null }> } | null };

export type BoxByLabelIdentifierQueryVariables = Exact<{
  labelIdentifier: Scalars['String'];
}>;


export type BoxByLabelIdentifierQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, items?: number | null, size: { __typename?: 'Size', id: string, label: string }, product?: { __typename?: 'Product', name: string, gender?: ProductGender | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, place?: { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | { __typename?: 'Location', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | null } | null };

export type UpdateNumberOfItemsMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  numberOfItems: Scalars['Int'];
}>;


export type UpdateNumberOfItemsMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type UpdateLocationOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  newLocationId: Scalars['Int'];
}>;


export type UpdateLocationOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string, items?: number | null, size: { __typename?: 'Size', id: string, label: string }, product?: { __typename?: 'Product', name: string, gender?: ProductGender | null, id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, place?: { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | { __typename?: 'Location', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | null } | null };

export type BoxByLabelIdentifierAndAllProductsQueryVariables = Exact<{
  labelIdentifier: Scalars['String'];
}>;


export type BoxByLabelIdentifierAndAllProductsQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, items?: number | null, size: { __typename?: 'Size', id: string, label: string }, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, sizeRange: { __typename?: 'SizeRange', sizes: Array<{ __typename?: 'Size', id: string, label: string }> } } | null, place?: { __typename?: 'DistributionSpot', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | { __typename?: 'Location', id: string, name?: string | null, base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', id: string, name?: string | null }> } | null } | null } | null, products: { __typename?: 'ProductPage', elements: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, category: { __typename?: 'ProductCategory', name: string }, sizeRange: { __typename?: 'SizeRange', label: string } }> } };

export type UpdateContentOfBoxMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['String'];
  productId: Scalars['Int'];
  numberOfItems: Scalars['Int'];
  sizeId: Scalars['Int'];
}>;


export type UpdateContentOfBoxMutation = { __typename?: 'Mutation', updateBox?: { __typename?: 'Box', labelIdentifier: string } | null };

export type BoxesForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type BoxesForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', locations: Array<{ __typename?: 'Location', name?: string | null, boxes?: { __typename?: 'BoxPage', totalCount: number, elements: Array<{ __typename?: 'Box', labelIdentifier: string, state: BoxState, items?: number | null, size: { __typename?: 'Size', id: string, label: string }, product?: { __typename?: 'Product', gender?: ProductGender | null, name: string } | null, tags: Array<{ __typename?: 'Tag', name: string, id: string }>, place?: { __typename?: 'DistributionSpot', name?: string | null } | { __typename?: 'Location', name?: string | null } | null }> } | null }> } | null };

export type DistributionSpotQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DistributionSpotQuery = { __typename?: 'Query', distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null };

export type CreateDistributionEventMutationVariables = Exact<{
  distributionSpotId: Scalars['Int'];
  name: Scalars['String'];
  plannedStartDateTime: Scalars['Datetime'];
  plannedEndDateTime: Scalars['Datetime'];
}>;


export type CreateDistributionEventMutation = { __typename?: 'Mutation', createDistributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any } | null };

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

export type AddToPackingListMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  productId: Scalars['Int'];
  sizeId: Scalars['Int'];
  numberOfItems: Scalars['Int'];
}>;


export type AddToPackingListMutation = { __typename?: 'Mutation', addPackingListEntryToDistributionEvent?: { __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null } | null };

export type AllProductsAndSizesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllProductsAndSizesQuery = { __typename?: 'Query', products: { __typename?: 'ProductPage', elements: Array<{ __typename?: 'Product', id: string, name: string, gender?: ProductGender | null, sizeRange: { __typename?: 'SizeRange', sizes: Array<{ __typename?: 'Size', id: string, label: string }> } }> } };

export type DistroSpotsForBaseIdQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DistroSpotsForBaseIdQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionSpots: Array<{ __typename?: 'DistributionSpot', id: string, name?: string | null, latitude?: number | null, longitude?: number | null, distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any }> }> } | null };

export type DistributionEventsForBaseQueryVariables = Exact<{
  baseId: Scalars['ID'];
}>;


export type DistributionEventsForBaseQuery = { __typename?: 'Query', base?: { __typename?: 'Base', distributionEvents: Array<{ __typename?: 'DistributionEvent', id: string, name?: string | null, plannedStartDateTime: any, plannedEndDateTime: any, state: DistributionEventState, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null }> } | null };

export type MoveBoxToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
}>;


export type MoveBoxToDistributionEventMutation = { __typename?: 'Mutation', moveBoxToDistributionEvent?: { __typename?: 'Box', id: string, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, distributionSpot?: { __typename?: 'DistributionSpot', name?: string | null } | null } | null } | null };

export type MoveItemsToDistributionEventMutationVariables = Exact<{
  boxLabelIdentifier: Scalars['ID'];
  distributionEventId: Scalars['ID'];
  numberOfItems: Scalars['Int'];
}>;


export type MoveItemsToDistributionEventMutation = { __typename?: 'Mutation', moveItemsFromBoxToDistributionEvent?: { __typename?: 'UnboxedItemsCollection', id: string, items?: number | null, distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, boxes: Array<{ __typename?: 'Box', product?: { __typename?: 'Product', name: string } | null }>, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null } | null };

export type PackingListEntriesForDistributionEventQueryVariables = Exact<{
  distributionEventId: Scalars['ID'];
}>;


export type PackingListEntriesForDistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, packingListEntries: Array<{ __typename?: 'PackingListEntry', id: string, numberOfItems: number, product?: { __typename?: 'Product', id: string, name: string, gender?: ProductGender | null } | null, size?: { __typename?: 'Size', id: string, label: string } | null, matchingPackedItemsCollections: Array<{ __typename: 'Box', labelIdentifier: string, numberOfItems?: number | null } | { __typename: 'UnboxedItemsCollection', numberOfItems?: number | null }> }> } | null };

export type ChangeDistributionEventStateMutationVariables = Exact<{
  distributionEventId: Scalars['ID'];
  newState: DistributionEventState;
}>;


export type ChangeDistributionEventStateMutation = { __typename?: 'Mutation', changeDistributionEventState?: { __typename: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState } | null };

export type BoxDetailsQueryVariables = Exact<{
  labelIdentifier: Scalars['String'];
}>;


export type BoxDetailsQuery = { __typename?: 'Query', box?: { __typename?: 'Box', labelIdentifier: string, items?: number | null, product?: { __typename?: 'Product', id: string, name: string } | null, size: { __typename?: 'Size', id: string, label: string } } | null };

export type DistributionEventQueryVariables = Exact<{
  eventId: Scalars['ID'];
}>;


export type DistributionEventQuery = { __typename?: 'Query', distributionEvent?: { __typename?: 'DistributionEvent', id: string, name?: string | null, state: DistributionEventState, plannedStartDateTime: any, plannedEndDateTime: any, distributionSpot?: { __typename?: 'DistributionSpot', id: string, name?: string | null } | null } | null };
