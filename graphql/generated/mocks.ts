import { Base, BasicDimensionInfo, Beneficiary, BeneficiaryCreationInput, BeneficiaryDemographicsData, BeneficiaryDemographicsDimensions, BeneficiaryDemographicsResult, BeneficiaryPage, BeneficiaryUpdateInput, Box, BoxAssignTagInput, BoxCreationInput, BoxMoveInput, BoxPage, BoxUpdateInput, BoxesResult, BoxesStillAssignedToProductError, ClassicLocation, CreatedBoxDataDimensions, CreatedBoxesData, CreatedBoxesResult, CustomProductCreationInput, CustomProductEditInput, DataCube, DeletedLocationError, DeletedTagError, DimensionInfo, DistributionEvent, DistributionEventCreationInput, DistributionEventsStatistics, DistributionEventsTrackingEntry, DistributionEventsTrackingGroup, DistributionSpot, DistributionSpotCreationInput, EmptyNameError, FilterBaseInput, FilterBeneficiaryInput, FilterBoxInput, FilterProductInput, HistoryEntry, InsufficientPermissionError, InvalidPriceError, ItemsCollection, Location, Metrics, MovedBoxDataDimensions, MovedBoxesData, MovedBoxesResult, Mutation, Organisation, PackingListEntry, PackingListEntryInput, PageInfo, PaginationInput, Product, ProductCategory, ProductDimensionInfo, ProductPage, ProductTypeMismatchError, QrCode, Query, ResourceDoesNotExistError, Shipment, ShipmentCreationInput, ShipmentDetail, ShipmentDetailUpdateInput, ShipmentWhenPreparingUpdateInput, ShipmentWhenReceivingUpdateInput, Size, SizeRange, StandardProduct, StandardProductAlreadyEnabledForBaseError, StandardProductEnableInput, StandardProductInstantiationEditInput, StandardProductPage, StockOverview, StockOverviewData, StockOverviewDataDimensions, StockOverviewResult, Tag, TagCreationInput, TagDimensionInfo, TagOperationInput, TagTypeMismatchError, TagUpdateInput, TargetDimensionInfo, TopProductsCheckedOutData, TopProductsCheckedOutResult, TopProductsDimensions, TopProductsDonatedData, TopProductsDonatedResult, Transaction, TransferAgreement, TransferAgreementCreationInput, UnauthorizedForBaseError, UnboxedItemsCollection, Unit, User, BoxState, DistributionEventState, DistributionEventTrackingFlowDirection, DistributionEventsTrackingGroupState, HumanGender, Language, PackingListEntryState, ProductGender, ProductType, ProductTypeFilter, ShipmentState, TagType, TaggableResourceType, TargetType, TransferAgreementState, TransferAgreementType } from './types';

export const aBase = (overrides?: Partial<Base>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Base' } & Base => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Base');
    return {
        __typename: 'Base',
        beneficiaries: overrides && overrides.hasOwnProperty('beneficiaries') ? overrides.beneficiaries! : relationshipsToOmit.has('BeneficiaryPage') ? {} as BeneficiaryPage : aBeneficiaryPage({}, relationshipsToOmit),
        currencyName: overrides && overrides.hasOwnProperty('currencyName') ? overrides.currencyName! : 'adipiscor',
        deletedOn: overrides && overrides.hasOwnProperty('deletedOn') ? overrides.deletedOn! : "2024-08-12T22:30:40.521Z",
        distributionEvents: overrides && overrides.hasOwnProperty('distributionEvents') ? overrides.distributionEvents! : [relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit)],
        distributionEventsBeforeReturnedFromDistributionState: overrides && overrides.hasOwnProperty('distributionEventsBeforeReturnedFromDistributionState') ? overrides.distributionEventsBeforeReturnedFromDistributionState! : [relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit)],
        distributionEventsInReturnedFromDistributionState: overrides && overrides.hasOwnProperty('distributionEventsInReturnedFromDistributionState') ? overrides.distributionEventsInReturnedFromDistributionState! : [relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit)],
        distributionEventsStatistics: overrides && overrides.hasOwnProperty('distributionEventsStatistics') ? overrides.distributionEventsStatistics! : [relationshipsToOmit.has('DistributionEventsStatistics') ? {} as DistributionEventsStatistics : aDistributionEventsStatistics({}, relationshipsToOmit)],
        distributionEventsTrackingGroups: overrides && overrides.hasOwnProperty('distributionEventsTrackingGroups') ? overrides.distributionEventsTrackingGroups! : [relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit)],
        distributionSpots: overrides && overrides.hasOwnProperty('distributionSpots') ? overrides.distributionSpots! : [relationshipsToOmit.has('DistributionSpot') ? {} as DistributionSpot : aDistributionSpot({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'd2c09614-f162-4af5-9c68-7e9dcc9c4b54',
        locations: overrides && overrides.hasOwnProperty('locations') ? overrides.locations! : [relationshipsToOmit.has('ClassicLocation') ? {} as ClassicLocation : aClassicLocation({}, relationshipsToOmit)],
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'articulus',
        organisation: overrides && overrides.hasOwnProperty('organisation') ? overrides.organisation! : relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit),
        products: overrides && overrides.hasOwnProperty('products') ? overrides.products! : [relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit)],
        tags: overrides && overrides.hasOwnProperty('tags') ? overrides.tags! : [relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit)],
    };
};

export const aBasicDimensionInfo = (overrides?: Partial<BasicDimensionInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BasicDimensionInfo' } & BasicDimensionInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BasicDimensionInfo');
    return {
        __typename: 'BasicDimensionInfo',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 8638,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'aggredior',
    };
};

export const aBeneficiary = (overrides?: Partial<Beneficiary>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Beneficiary' } & Beneficiary => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Beneficiary');
    return {
        __typename: 'Beneficiary',
        active: overrides && overrides.hasOwnProperty('active') ? overrides.active! : true,
        age: overrides && overrides.hasOwnProperty('age') ? overrides.age! : 2949,
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'unde',
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-02-05T15:38:46.072Z",
        dateOfBirth: overrides && overrides.hasOwnProperty('dateOfBirth') ? overrides.dateOfBirth! : "2024-04-09T17:01:24.202Z",
        dateOfSignature: overrides && overrides.hasOwnProperty('dateOfSignature') ? overrides.dateOfSignature! : "2024-11-16T06:08:51.661Z",
        familyHead: overrides && overrides.hasOwnProperty('familyHead') ? overrides.familyHead! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        firstName: overrides && overrides.hasOwnProperty('firstName') ? overrides.firstName! : 'caries',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : HumanGender.Diverse,
        groupIdentifier: overrides && overrides.hasOwnProperty('groupIdentifier') ? overrides.groupIdentifier! : 'caecus',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '537aea0b-6f67-4fe5-9597-6d687f0fa50a',
        isVolunteer: overrides && overrides.hasOwnProperty('isVolunteer') ? overrides.isVolunteer! : true,
        languages: overrides && overrides.hasOwnProperty('languages') ? overrides.languages! : [Language.Ar],
        lastModifiedBy: overrides && overrides.hasOwnProperty('lastModifiedBy') ? overrides.lastModifiedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        lastModifiedOn: overrides && overrides.hasOwnProperty('lastModifiedOn') ? overrides.lastModifiedOn! : "2024-08-13T16:43:05.460Z",
        lastName: overrides && overrides.hasOwnProperty('lastName') ? overrides.lastName! : 'deripio',
        registered: overrides && overrides.hasOwnProperty('registered') ? overrides.registered! : false,
        signature: overrides && overrides.hasOwnProperty('signature') ? overrides.signature! : 'apto',
        signed: overrides && overrides.hasOwnProperty('signed') ? overrides.signed! : true,
        tags: overrides && overrides.hasOwnProperty('tags') ? overrides.tags! : [relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit)],
        tokens: overrides && overrides.hasOwnProperty('tokens') ? overrides.tokens! : 4416,
        transactions: overrides && overrides.hasOwnProperty('transactions') ? overrides.transactions! : [relationshipsToOmit.has('Transaction') ? {} as Transaction : aTransaction({}, relationshipsToOmit)],
    };
};

export const aBeneficiaryCreationInput = (overrides?: Partial<BeneficiaryCreationInput>, _relationshipsToOmit: Set<string> = new Set()): BeneficiaryCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryCreationInput');
    return {
        baseId: overrides && overrides.hasOwnProperty('baseId') ? overrides.baseId! : 823,
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'ars',
        dateOfBirth: overrides && overrides.hasOwnProperty('dateOfBirth') ? overrides.dateOfBirth! : "2024-02-09T05:48:03.136Z",
        dateOfSignature: overrides && overrides.hasOwnProperty('dateOfSignature') ? overrides.dateOfSignature! : "2024-08-26T05:22:03.125Z",
        familyHeadId: overrides && overrides.hasOwnProperty('familyHeadId') ? overrides.familyHeadId! : 3477,
        firstName: overrides && overrides.hasOwnProperty('firstName') ? overrides.firstName! : 'perferendis',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : HumanGender.Diverse,
        groupIdentifier: overrides && overrides.hasOwnProperty('groupIdentifier') ? overrides.groupIdentifier! : 'aurum',
        isVolunteer: overrides && overrides.hasOwnProperty('isVolunteer') ? overrides.isVolunteer! : true,
        languages: overrides && overrides.hasOwnProperty('languages') ? overrides.languages! : [Language.Ar],
        lastName: overrides && overrides.hasOwnProperty('lastName') ? overrides.lastName! : 'subvenio',
        registered: overrides && overrides.hasOwnProperty('registered') ? overrides.registered! : true,
        signature: overrides && overrides.hasOwnProperty('signature') ? overrides.signature! : 'deporto',
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [6644],
    };
};

export const aBeneficiaryDemographicsData = (overrides?: Partial<BeneficiaryDemographicsData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BeneficiaryDemographicsData' } & BeneficiaryDemographicsData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryDemographicsData');
    return {
        __typename: 'BeneficiaryDemographicsData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('BeneficiaryDemographicsDimensions') ? {} as BeneficiaryDemographicsDimensions : aBeneficiaryDemographicsDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('BeneficiaryDemographicsResult') ? {} as BeneficiaryDemographicsResult : aBeneficiaryDemographicsResult({}, relationshipsToOmit)],
    };
};

export const aBeneficiaryDemographicsDimensions = (overrides?: Partial<BeneficiaryDemographicsDimensions>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BeneficiaryDemographicsDimensions' } & BeneficiaryDemographicsDimensions => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryDemographicsDimensions');
    return {
        __typename: 'BeneficiaryDemographicsDimensions',
        tag: overrides && overrides.hasOwnProperty('tag') ? overrides.tag! : [relationshipsToOmit.has('TagDimensionInfo') ? {} as TagDimensionInfo : aTagDimensionInfo({}, relationshipsToOmit)],
    };
};

export const aBeneficiaryDemographicsResult = (overrides?: Partial<BeneficiaryDemographicsResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BeneficiaryDemographicsResult' } & BeneficiaryDemographicsResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryDemographicsResult');
    return {
        __typename: 'BeneficiaryDemographicsResult',
        age: overrides && overrides.hasOwnProperty('age') ? overrides.age! : 6960,
        count: overrides && overrides.hasOwnProperty('count') ? overrides.count! : 6728,
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-05-02T20:11:29.772Z",
        deletedOn: overrides && overrides.hasOwnProperty('deletedOn') ? overrides.deletedOn! : "2024-05-20T21:11:28.155Z",
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : HumanGender.Diverse,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [2718],
    };
};

export const aBeneficiaryPage = (overrides?: Partial<BeneficiaryPage>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BeneficiaryPage' } & BeneficiaryPage => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryPage');
    return {
        __typename: 'BeneficiaryPage',
        elements: overrides && overrides.hasOwnProperty('elements') ? overrides.elements! : [relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit)],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : relationshipsToOmit.has('PageInfo') ? {} as PageInfo : aPageInfo({}, relationshipsToOmit),
        totalCount: overrides && overrides.hasOwnProperty('totalCount') ? overrides.totalCount! : 7683,
    };
};

export const aBeneficiaryUpdateInput = (overrides?: Partial<BeneficiaryUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): BeneficiaryUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BeneficiaryUpdateInput');
    return {
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'coepi',
        dateOfBirth: overrides && overrides.hasOwnProperty('dateOfBirth') ? overrides.dateOfBirth! : "2023-12-20T06:13:25.016Z",
        dateOfSignature: overrides && overrides.hasOwnProperty('dateOfSignature') ? overrides.dateOfSignature! : "2024-11-09T14:41:06.573Z",
        familyHeadId: overrides && overrides.hasOwnProperty('familyHeadId') ? overrides.familyHeadId! : 6803,
        firstName: overrides && overrides.hasOwnProperty('firstName') ? overrides.firstName! : 'aggredior',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : HumanGender.Diverse,
        groupIdentifier: overrides && overrides.hasOwnProperty('groupIdentifier') ? overrides.groupIdentifier! : 'sed',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '3a12d50f-f523-43a2-962b-3b1de53c0fc1',
        isVolunteer: overrides && overrides.hasOwnProperty('isVolunteer') ? overrides.isVolunteer! : false,
        languages: overrides && overrides.hasOwnProperty('languages') ? overrides.languages! : [Language.Ar],
        lastName: overrides && overrides.hasOwnProperty('lastName') ? overrides.lastName! : 'bestia',
        registered: overrides && overrides.hasOwnProperty('registered') ? overrides.registered! : false,
        signature: overrides && overrides.hasOwnProperty('signature') ? overrides.signature! : 'non',
    };
};

export const aBox = (overrides?: Partial<Box>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Box' } & Box => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Box');
    return {
        __typename: 'Box',
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'bene',
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-04-07T05:39:32.926Z",
        deletedOn: overrides && overrides.hasOwnProperty('deletedOn') ? overrides.deletedOn! : "2024-10-23T16:36:35.391Z",
        displayUnit: overrides && overrides.hasOwnProperty('displayUnit') ? overrides.displayUnit! : relationshipsToOmit.has('Unit') ? {} as Unit : aUnit({}, relationshipsToOmit),
        distributionEvent: overrides && overrides.hasOwnProperty('distributionEvent') ? overrides.distributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        history: overrides && overrides.hasOwnProperty('history') ? overrides.history! : [relationshipsToOmit.has('HistoryEntry') ? {} as HistoryEntry : aHistoryEntry({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f97c22ed-1900-48bd-b22f-2baa2aa293c4',
        labelIdentifier: overrides && overrides.hasOwnProperty('labelIdentifier') ? overrides.labelIdentifier! : 'reiciendis',
        lastModifiedBy: overrides && overrides.hasOwnProperty('lastModifiedBy') ? overrides.lastModifiedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        lastModifiedOn: overrides && overrides.hasOwnProperty('lastModifiedOn') ? overrides.lastModifiedOn! : "2024-05-22T15:00:30.276Z",
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : relationshipsToOmit.has('Location') ? {} as Location : aLocation({}, relationshipsToOmit),
        measureValue: overrides && overrides.hasOwnProperty('measureValue') ? overrides.measureValue! : 7.8,
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 5288,
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        qrCode: overrides && overrides.hasOwnProperty('qrCode') ? overrides.qrCode! : relationshipsToOmit.has('QrCode') ? {} as QrCode : aQrCode({}, relationshipsToOmit),
        shipmentDetail: overrides && overrides.hasOwnProperty('shipmentDetail') ? overrides.shipmentDetail! : relationshipsToOmit.has('ShipmentDetail') ? {} as ShipmentDetail : aShipmentDetail({}, relationshipsToOmit),
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : BoxState.Donated,
        tags: overrides && overrides.hasOwnProperty('tags') ? overrides.tags! : [relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit)],
    };
};

export const aBoxAssignTagInput = (overrides?: Partial<BoxAssignTagInput>, _relationshipsToOmit: Set<string> = new Set()): BoxAssignTagInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxAssignTagInput');
    return {
        labelIdentifiers: overrides && overrides.hasOwnProperty('labelIdentifiers') ? overrides.labelIdentifiers! : ['textilis'],
        tagId: overrides && overrides.hasOwnProperty('tagId') ? overrides.tagId! : 5436,
    };
};

export const aBoxCreationInput = (overrides?: Partial<BoxCreationInput>, _relationshipsToOmit: Set<string> = new Set()): BoxCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxCreationInput');
    return {
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'texo',
        displayUnitId: overrides && overrides.hasOwnProperty('displayUnitId') ? overrides.displayUnitId! : 2591,
        locationId: overrides && overrides.hasOwnProperty('locationId') ? overrides.locationId! : 9649,
        measureValue: overrides && overrides.hasOwnProperty('measureValue') ? overrides.measureValue! : 9.9,
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 6543,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 3707,
        qrCode: overrides && overrides.hasOwnProperty('qrCode') ? overrides.qrCode! : 'uter',
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 2058,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [4237],
    };
};

export const aBoxMoveInput = (overrides?: Partial<BoxMoveInput>, _relationshipsToOmit: Set<string> = new Set()): BoxMoveInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxMoveInput');
    return {
        labelIdentifiers: overrides && overrides.hasOwnProperty('labelIdentifiers') ? overrides.labelIdentifiers! : ['arca'],
        locationId: overrides && overrides.hasOwnProperty('locationId') ? overrides.locationId! : 9816,
    };
};

export const aBoxPage = (overrides?: Partial<BoxPage>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BoxPage' } & BoxPage => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxPage');
    return {
        __typename: 'BoxPage',
        elements: overrides && overrides.hasOwnProperty('elements') ? overrides.elements! : [relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit)],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : relationshipsToOmit.has('PageInfo') ? {} as PageInfo : aPageInfo({}, relationshipsToOmit),
        totalCount: overrides && overrides.hasOwnProperty('totalCount') ? overrides.totalCount! : 4760,
    };
};

export const aBoxUpdateInput = (overrides?: Partial<BoxUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): BoxUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxUpdateInput');
    return {
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'itaque',
        displayUnitId: overrides && overrides.hasOwnProperty('displayUnitId') ? overrides.displayUnitId! : 6260,
        labelIdentifier: overrides && overrides.hasOwnProperty('labelIdentifier') ? overrides.labelIdentifier! : 'vis',
        locationId: overrides && overrides.hasOwnProperty('locationId') ? overrides.locationId! : 221,
        measureValue: overrides && overrides.hasOwnProperty('measureValue') ? overrides.measureValue! : 5,
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 5618,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 318,
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 8951,
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : BoxState.Donated,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [1463],
        tagIdsToBeAdded: overrides && overrides.hasOwnProperty('tagIdsToBeAdded') ? overrides.tagIdsToBeAdded! : [9756],
    };
};

export const aBoxesResult = (overrides?: Partial<BoxesResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BoxesResult' } & BoxesResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxesResult');
    return {
        __typename: 'BoxesResult',
        invalidBoxLabelIdentifiers: overrides && overrides.hasOwnProperty('invalidBoxLabelIdentifiers') ? overrides.invalidBoxLabelIdentifiers! : ['color'],
        updatedBoxes: overrides && overrides.hasOwnProperty('updatedBoxes') ? overrides.updatedBoxes! : [relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit)],
    };
};

export const aBoxesStillAssignedToProductError = (overrides?: Partial<BoxesStillAssignedToProductError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'BoxesStillAssignedToProductError' } & BoxesStillAssignedToProductError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('BoxesStillAssignedToProductError');
    return {
        __typename: 'BoxesStillAssignedToProductError',
        labelIdentifiers: overrides && overrides.hasOwnProperty('labelIdentifiers') ? overrides.labelIdentifiers! : ['brevis'],
    };
};

export const aClassicLocation = (overrides?: Partial<ClassicLocation>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ClassicLocation' } & ClassicLocation => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ClassicLocation');
    return {
        __typename: 'ClassicLocation',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        boxes: overrides && overrides.hasOwnProperty('boxes') ? overrides.boxes! : relationshipsToOmit.has('BoxPage') ? {} as BoxPage : aBoxPage({}, relationshipsToOmit),
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2023-12-09T17:53:55.811Z",
        defaultBoxState: overrides && overrides.hasOwnProperty('defaultBoxState') ? overrides.defaultBoxState! : BoxState.Donated,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'a793c78a-d27a-42d5-8ffe-28553bfac781',
        isShop: overrides && overrides.hasOwnProperty('isShop') ? overrides.isShop! : false,
        isStockroom: overrides && overrides.hasOwnProperty('isStockroom') ? overrides.isStockroom! : false,
        lastModifiedBy: overrides && overrides.hasOwnProperty('lastModifiedBy') ? overrides.lastModifiedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        lastModifiedOn: overrides && overrides.hasOwnProperty('lastModifiedOn') ? overrides.lastModifiedOn! : "2024-01-22T08:47:48.766Z",
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'absconditus',
        seq: overrides && overrides.hasOwnProperty('seq') ? overrides.seq! : 6969,
    };
};

export const aCreatedBoxDataDimensions = (overrides?: Partial<CreatedBoxDataDimensions>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'CreatedBoxDataDimensions' } & CreatedBoxDataDimensions => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('CreatedBoxDataDimensions');
    return {
        __typename: 'CreatedBoxDataDimensions',
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : [relationshipsToOmit.has('ProductDimensionInfo') ? {} as ProductDimensionInfo : aProductDimensionInfo({}, relationshipsToOmit)],
        tag: overrides && overrides.hasOwnProperty('tag') ? overrides.tag! : [relationshipsToOmit.has('TagDimensionInfo') ? {} as TagDimensionInfo : aTagDimensionInfo({}, relationshipsToOmit)],
    };
};

export const aCreatedBoxesData = (overrides?: Partial<CreatedBoxesData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'CreatedBoxesData' } & CreatedBoxesData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('CreatedBoxesData');
    return {
        __typename: 'CreatedBoxesData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('CreatedBoxDataDimensions') ? {} as CreatedBoxDataDimensions : aCreatedBoxDataDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('CreatedBoxesResult') ? {} as CreatedBoxesResult : aCreatedBoxesResult({}, relationshipsToOmit)],
    };
};

export const aCreatedBoxesResult = (overrides?: Partial<CreatedBoxesResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'CreatedBoxesResult' } & CreatedBoxesResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('CreatedBoxesResult');
    return {
        __typename: 'CreatedBoxesResult',
        boxesCount: overrides && overrides.hasOwnProperty('boxesCount') ? overrides.boxesCount! : 1333,
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 9273,
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2023-12-13T10:38:33.048Z",
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        itemsCount: overrides && overrides.hasOwnProperty('itemsCount') ? overrides.itemsCount! : 8915,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 3581,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [8329],
    };
};

export const aCustomProductCreationInput = (overrides?: Partial<CustomProductCreationInput>, _relationshipsToOmit: Set<string> = new Set()): CustomProductCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('CustomProductCreationInput');
    return {
        baseId: overrides && overrides.hasOwnProperty('baseId') ? overrides.baseId! : 0,
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 651,
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'audio',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        inShop: overrides && overrides.hasOwnProperty('inShop') ? overrides.inShop! : true,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'pel',
        price: overrides && overrides.hasOwnProperty('price') ? overrides.price! : 482,
        sizeRangeId: overrides && overrides.hasOwnProperty('sizeRangeId') ? overrides.sizeRangeId! : 2482,
    };
};

export const aCustomProductEditInput = (overrides?: Partial<CustomProductEditInput>, _relationshipsToOmit: Set<string> = new Set()): CustomProductEditInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('CustomProductEditInput');
    return {
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 7304,
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'alias',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'c7482a4b-7b5c-4295-bd64-70dadbb394d4',
        inShop: overrides && overrides.hasOwnProperty('inShop') ? overrides.inShop! : true,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'vitiosus',
        price: overrides && overrides.hasOwnProperty('price') ? overrides.price! : 6711,
        sizeRangeId: overrides && overrides.hasOwnProperty('sizeRangeId') ? overrides.sizeRangeId! : 9718,
    };
};

export const aDataCube = (overrides?: Partial<DataCube>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DataCube' } & DataCube => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DataCube');
    return {
        __typename: 'DataCube',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('BeneficiaryDemographicsDimensions') ? {} as BeneficiaryDemographicsDimensions : aBeneficiaryDemographicsDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('BeneficiaryDemographicsResult') ? {} as BeneficiaryDemographicsResult : aBeneficiaryDemographicsResult({}, relationshipsToOmit)],
    };
};

export const aDeletedLocationError = (overrides?: Partial<DeletedLocationError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DeletedLocationError' } & DeletedLocationError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DeletedLocationError');
    return {
        __typename: 'DeletedLocationError',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'iure',
    };
};

export const aDeletedTagError = (overrides?: Partial<DeletedTagError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DeletedTagError' } & DeletedTagError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DeletedTagError');
    return {
        __typename: 'DeletedTagError',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'damno',
    };
};

export const aDimensionInfo = (overrides?: Partial<DimensionInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DimensionInfo' } & DimensionInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DimensionInfo');
    return {
        __typename: 'DimensionInfo',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 5499,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'temperantia',
    };
};

export const aDistributionEvent = (overrides?: Partial<DistributionEvent>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DistributionEvent' } & DistributionEvent => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionEvent');
    return {
        __typename: 'DistributionEvent',
        boxes: overrides && overrides.hasOwnProperty('boxes') ? overrides.boxes! : [relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit)],
        distributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('distributionEventsTrackingGroup') ? overrides.distributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit),
        distributionSpot: overrides && overrides.hasOwnProperty('distributionSpot') ? overrides.distributionSpot! : relationshipsToOmit.has('DistributionSpot') ? {} as DistributionSpot : aDistributionSpot({}, relationshipsToOmit),
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '85c586d5-132c-4800-b2c1-b457b3fa0e74',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'vesica',
        packingListEntries: overrides && overrides.hasOwnProperty('packingListEntries') ? overrides.packingListEntries! : [relationshipsToOmit.has('PackingListEntry') ? {} as PackingListEntry : aPackingListEntry({}, relationshipsToOmit)],
        plannedEndDateTime: overrides && overrides.hasOwnProperty('plannedEndDateTime') ? overrides.plannedEndDateTime! : "2024-09-03T14:22:18.723Z",
        plannedStartDateTime: overrides && overrides.hasOwnProperty('plannedStartDateTime') ? overrides.plannedStartDateTime! : "2024-11-18T07:46:52.350Z",
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : DistributionEventState.Completed,
        unboxedItemsCollections: overrides && overrides.hasOwnProperty('unboxedItemsCollections') ? overrides.unboxedItemsCollections! : [relationshipsToOmit.has('UnboxedItemsCollection') ? {} as UnboxedItemsCollection : anUnboxedItemsCollection({}, relationshipsToOmit)],
    };
};

export const aDistributionEventCreationInput = (overrides?: Partial<DistributionEventCreationInput>, _relationshipsToOmit: Set<string> = new Set()): DistributionEventCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionEventCreationInput');
    return {
        distributionSpotId: overrides && overrides.hasOwnProperty('distributionSpotId') ? overrides.distributionSpotId! : 8272,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'subvenio',
        plannedEndDateTime: overrides && overrides.hasOwnProperty('plannedEndDateTime') ? overrides.plannedEndDateTime! : "2023-12-28T16:36:20.561Z",
        plannedStartDateTime: overrides && overrides.hasOwnProperty('plannedStartDateTime') ? overrides.plannedStartDateTime! : "2024-09-19T17:43:15.348Z",
    };
};

export const aDistributionEventsStatistics = (overrides?: Partial<DistributionEventsStatistics>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DistributionEventsStatistics' } & DistributionEventsStatistics => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionEventsStatistics');
    return {
        __typename: 'DistributionEventsStatistics',
        categoryLabel: overrides && overrides.hasOwnProperty('categoryLabel') ? overrides.categoryLabel! : 'cresco',
        distroEventTrackingGroupId: overrides && overrides.hasOwnProperty('distroEventTrackingGroupId') ? overrides.distroEventTrackingGroupId! : 'aer',
        earliestPossibleDistroDate: overrides && overrides.hasOwnProperty('earliestPossibleDistroDate') ? overrides.earliestPossibleDistroDate! : 'deorsum',
        genderLabel: overrides && overrides.hasOwnProperty('genderLabel') ? overrides.genderLabel! : 'pecus',
        inflow: overrides && overrides.hasOwnProperty('inflow') ? overrides.inflow! : 6410,
        involvedDistributionEventIds: overrides && overrides.hasOwnProperty('involvedDistributionEventIds') ? overrides.involvedDistributionEventIds! : 'abutor',
        latestPossibleDistroDate: overrides && overrides.hasOwnProperty('latestPossibleDistroDate') ? overrides.latestPossibleDistroDate! : 'anser',
        outflow: overrides && overrides.hasOwnProperty('outflow') ? overrides.outflow! : 7826,
        potentiallyInvolvedDistributionSpots: overrides && overrides.hasOwnProperty('potentiallyInvolvedDistributionSpots') ? overrides.potentiallyInvolvedDistributionSpots! : 'degenero',
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 'conatus',
        productName: overrides && overrides.hasOwnProperty('productName') ? overrides.productName! : 'caterva',
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 'varius',
        sizeLabel: overrides && overrides.hasOwnProperty('sizeLabel') ? overrides.sizeLabel! : 'vestigium',
    };
};

export const aDistributionEventsTrackingEntry = (overrides?: Partial<DistributionEventsTrackingEntry>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DistributionEventsTrackingEntry' } & DistributionEventsTrackingEntry => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionEventsTrackingEntry');
    return {
        __typename: 'DistributionEventsTrackingEntry',
        dateTimeOfTracking: overrides && overrides.hasOwnProperty('dateTimeOfTracking') ? overrides.dateTimeOfTracking! : "2024-11-12T03:46:26.233Z",
        distributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('distributionEventsTrackingGroup') ? overrides.distributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit),
        flowDirection: overrides && overrides.hasOwnProperty('flowDirection') ? overrides.flowDirection! : DistributionEventTrackingFlowDirection.BackToBox,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '99615e80-cbe1-40a9-81dc-dc9eb084c126',
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 3147,
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
    };
};

export const aDistributionEventsTrackingGroup = (overrides?: Partial<DistributionEventsTrackingGroup>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DistributionEventsTrackingGroup' } & DistributionEventsTrackingGroup => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionEventsTrackingGroup');
    return {
        __typename: 'DistributionEventsTrackingGroup',
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-04-26T09:03:32.051Z",
        distributionEvents: overrides && overrides.hasOwnProperty('distributionEvents') ? overrides.distributionEvents! : [relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit)],
        distributionEventsTrackingEntries: overrides && overrides.hasOwnProperty('distributionEventsTrackingEntries') ? overrides.distributionEventsTrackingEntries! : [relationshipsToOmit.has('DistributionEventsTrackingEntry') ? {} as DistributionEventsTrackingEntry : aDistributionEventsTrackingEntry({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '6c1c252c-2174-419e-8909-5eef6f9b1e6f',
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : DistributionEventsTrackingGroupState.Completed,
    };
};

export const aDistributionSpot = (overrides?: Partial<DistributionSpot>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'DistributionSpot' } & DistributionSpot => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionSpot');
    return {
        __typename: 'DistributionSpot',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        boxes: overrides && overrides.hasOwnProperty('boxes') ? overrides.boxes! : relationshipsToOmit.has('BoxPage') ? {} as BoxPage : aBoxPage({}, relationshipsToOmit),
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'benigne',
        distributionEvents: overrides && overrides.hasOwnProperty('distributionEvents') ? overrides.distributionEvents! : [relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'a2bcf19b-0243-40aa-a5d4-da6facfb5e77',
        latitude: overrides && overrides.hasOwnProperty('latitude') ? overrides.latitude! : 6.9,
        longitude: overrides && overrides.hasOwnProperty('longitude') ? overrides.longitude! : 1.1,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'utique',
    };
};

export const aDistributionSpotCreationInput = (overrides?: Partial<DistributionSpotCreationInput>, _relationshipsToOmit: Set<string> = new Set()): DistributionSpotCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('DistributionSpotCreationInput');
    return {
        baseId: overrides && overrides.hasOwnProperty('baseId') ? overrides.baseId! : 4453,
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'quis',
        latitude: overrides && overrides.hasOwnProperty('latitude') ? overrides.latitude! : 7.7,
        longitude: overrides && overrides.hasOwnProperty('longitude') ? overrides.longitude! : 1.9,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'depopulo',
    };
};

export const anEmptyNameError = (overrides?: Partial<EmptyNameError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'EmptyNameError' } & EmptyNameError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('EmptyNameError');
    return {
        __typename: 'EmptyNameError',
        _: overrides && overrides.hasOwnProperty('_') ? overrides._! : false,
    };
};

export const aFilterBaseInput = (overrides?: Partial<FilterBaseInput>, _relationshipsToOmit: Set<string> = new Set()): FilterBaseInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('FilterBaseInput');
    return {
        includeDeleted: overrides && overrides.hasOwnProperty('includeDeleted') ? overrides.includeDeleted! : true,
    };
};

export const aFilterBeneficiaryInput = (overrides?: Partial<FilterBeneficiaryInput>, _relationshipsToOmit: Set<string> = new Set()): FilterBeneficiaryInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('FilterBeneficiaryInput');
    return {
        active: overrides && overrides.hasOwnProperty('active') ? overrides.active! : false,
        createdFrom: overrides && overrides.hasOwnProperty('createdFrom') ? overrides.createdFrom! : "2024-02-20T16:55:44.314Z",
        createdUntil: overrides && overrides.hasOwnProperty('createdUntil') ? overrides.createdUntil! : "2024-05-12T16:48:16.896Z",
        isVolunteer: overrides && overrides.hasOwnProperty('isVolunteer') ? overrides.isVolunteer! : false,
        pattern: overrides && overrides.hasOwnProperty('pattern') ? overrides.pattern! : 'vorago',
        registered: overrides && overrides.hasOwnProperty('registered') ? overrides.registered! : true,
    };
};

export const aFilterBoxInput = (overrides?: Partial<FilterBoxInput>, _relationshipsToOmit: Set<string> = new Set()): FilterBoxInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('FilterBoxInput');
    return {
        lastModifiedFrom: overrides && overrides.hasOwnProperty('lastModifiedFrom') ? overrides.lastModifiedFrom! : "2024-06-07T13:14:52.123Z",
        lastModifiedUntil: overrides && overrides.hasOwnProperty('lastModifiedUntil') ? overrides.lastModifiedUntil! : "2024-02-29T22:14:21.946Z",
        productCategoryId: overrides && overrides.hasOwnProperty('productCategoryId') ? overrides.productCategoryId! : 5955,
        productGender: overrides && overrides.hasOwnProperty('productGender') ? overrides.productGender! : ProductGender.Boy,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 8848,
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 6963,
        states: overrides && overrides.hasOwnProperty('states') ? overrides.states! : [BoxState.Donated],
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [7410],
    };
};

export const aFilterProductInput = (overrides?: Partial<FilterProductInput>, _relationshipsToOmit: Set<string> = new Set()): FilterProductInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('FilterProductInput');
    return {
        includeDeleted: overrides && overrides.hasOwnProperty('includeDeleted') ? overrides.includeDeleted! : false,
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : ProductTypeFilter.All,
    };
};

export const aHistoryEntry = (overrides?: Partial<HistoryEntry>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'HistoryEntry' } & HistoryEntry => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('HistoryEntry');
    return {
        __typename: 'HistoryEntry',
        changeDate: overrides && overrides.hasOwnProperty('changeDate') ? overrides.changeDate! : "2024-10-09T01:38:08.254Z",
        changes: overrides && overrides.hasOwnProperty('changes') ? overrides.changes! : 'molestiae',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '42b8d330-1522-4bcb-a39f-38265dc40fd6',
        user: overrides && overrides.hasOwnProperty('user') ? overrides.user! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
    };
};

export const anInsufficientPermissionError = (overrides?: Partial<InsufficientPermissionError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'InsufficientPermissionError' } & InsufficientPermissionError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('InsufficientPermissionError');
    return {
        __typename: 'InsufficientPermissionError',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'advenio',
    };
};

export const anInvalidPriceError = (overrides?: Partial<InvalidPriceError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'InvalidPriceError' } & InvalidPriceError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('InvalidPriceError');
    return {
        __typename: 'InvalidPriceError',
        value: overrides && overrides.hasOwnProperty('value') ? overrides.value! : 9579,
    };
};

export const anItemsCollection = (overrides?: Partial<ItemsCollection>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ItemsCollection' } & ItemsCollection => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ItemsCollection');
    return {
        __typename: 'ItemsCollection',
        distributionEvent: overrides && overrides.hasOwnProperty('distributionEvent') ? overrides.distributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'b2971d31-2892-40e8-a0bc-f97b78629d3f',
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : relationshipsToOmit.has('Location') ? {} as Location : aLocation({}, relationshipsToOmit),
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 8,
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
    };
};

export const aLocation = (overrides?: Partial<Location>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Location' } & Location => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Location');
    return {
        __typename: 'Location',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        boxes: overrides && overrides.hasOwnProperty('boxes') ? overrides.boxes! : relationshipsToOmit.has('BoxPage') ? {} as BoxPage : aBoxPage({}, relationshipsToOmit),
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'afe52c08-ad42-41df-a93d-4264c80b41fe',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'sublime',
    };
};

export const aMetrics = (overrides?: Partial<Metrics>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Metrics' } & Metrics => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Metrics');
    return {
        __typename: 'Metrics',
        numberOfBeneficiariesServed: overrides && overrides.hasOwnProperty('numberOfBeneficiariesServed') ? overrides.numberOfBeneficiariesServed! : 2499,
        numberOfFamiliesServed: overrides && overrides.hasOwnProperty('numberOfFamiliesServed') ? overrides.numberOfFamiliesServed! : 3667,
        numberOfSales: overrides && overrides.hasOwnProperty('numberOfSales') ? overrides.numberOfSales! : 1069,
        stockOverview: overrides && overrides.hasOwnProperty('stockOverview') ? overrides.stockOverview! : relationshipsToOmit.has('StockOverview') ? {} as StockOverview : aStockOverview({}, relationshipsToOmit),
    };
};

export const aMovedBoxDataDimensions = (overrides?: Partial<MovedBoxDataDimensions>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'MovedBoxDataDimensions' } & MovedBoxDataDimensions => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('MovedBoxDataDimensions');
    return {
        __typename: 'MovedBoxDataDimensions',
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        dimension: overrides && overrides.hasOwnProperty('dimension') ? overrides.dimension! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        tag: overrides && overrides.hasOwnProperty('tag') ? overrides.tag! : [relationshipsToOmit.has('TagDimensionInfo') ? {} as TagDimensionInfo : aTagDimensionInfo({}, relationshipsToOmit)],
        target: overrides && overrides.hasOwnProperty('target') ? overrides.target! : [relationshipsToOmit.has('TargetDimensionInfo') ? {} as TargetDimensionInfo : aTargetDimensionInfo({}, relationshipsToOmit)],
    };
};

export const aMovedBoxesData = (overrides?: Partial<MovedBoxesData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'MovedBoxesData' } & MovedBoxesData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('MovedBoxesData');
    return {
        __typename: 'MovedBoxesData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('MovedBoxDataDimensions') ? {} as MovedBoxDataDimensions : aMovedBoxDataDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('MovedBoxesResult') ? {} as MovedBoxesResult : aMovedBoxesResult({}, relationshipsToOmit)],
    };
};

export const aMovedBoxesResult = (overrides?: Partial<MovedBoxesResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'MovedBoxesResult' } & MovedBoxesResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('MovedBoxesResult');
    return {
        __typename: 'MovedBoxesResult',
        absoluteMeasureValue: overrides && overrides.hasOwnProperty('absoluteMeasureValue') ? overrides.absoluteMeasureValue! : 6.1,
        boxesCount: overrides && overrides.hasOwnProperty('boxesCount') ? overrides.boxesCount! : 9496,
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 2352,
        dimensionId: overrides && overrides.hasOwnProperty('dimensionId') ? overrides.dimensionId! : 216,
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        itemsCount: overrides && overrides.hasOwnProperty('itemsCount') ? overrides.itemsCount! : 3121,
        movedOn: overrides && overrides.hasOwnProperty('movedOn') ? overrides.movedOn! : "2024-02-10T13:38:27.559Z",
        organisationName: overrides && overrides.hasOwnProperty('organisationName') ? overrides.organisationName! : 'callide',
        productName: overrides && overrides.hasOwnProperty('productName') ? overrides.productName! : 'ea',
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 4590,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [785],
        targetId: overrides && overrides.hasOwnProperty('targetId') ? overrides.targetId! : '33ea5d80-6ccd-41a8-931e-29d248df611b',
    };
};

export const aMutation = (overrides?: Partial<Mutation>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Mutation' } & Mutation => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Mutation');
    return {
        __typename: 'Mutation',
        acceptTransferAgreement: overrides && overrides.hasOwnProperty('acceptTransferAgreement') ? overrides.acceptTransferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
        addPackingListEntryToDistributionEvent: overrides && overrides.hasOwnProperty('addPackingListEntryToDistributionEvent') ? overrides.addPackingListEntryToDistributionEvent! : relationshipsToOmit.has('PackingListEntry') ? {} as PackingListEntry : aPackingListEntry({}, relationshipsToOmit),
        assignBoxToDistributionEvent: overrides && overrides.hasOwnProperty('assignBoxToDistributionEvent') ? overrides.assignBoxToDistributionEvent! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        assignTag: overrides && overrides.hasOwnProperty('assignTag') ? overrides.assignTag! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        assignTagToBoxes: overrides && overrides.hasOwnProperty('assignTagToBoxes') ? overrides.assignTagToBoxes! : relationshipsToOmit.has('BoxesResult') ? {} as BoxesResult : aBoxesResult({}, relationshipsToOmit),
        cancelShipment: overrides && overrides.hasOwnProperty('cancelShipment') ? overrides.cancelShipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        cancelTransferAgreement: overrides && overrides.hasOwnProperty('cancelTransferAgreement') ? overrides.cancelTransferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
        changeDistributionEventState: overrides && overrides.hasOwnProperty('changeDistributionEventState') ? overrides.changeDistributionEventState! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        completeDistributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('completeDistributionEventsTrackingGroup') ? overrides.completeDistributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit),
        createBeneficiary: overrides && overrides.hasOwnProperty('createBeneficiary') ? overrides.createBeneficiary! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        createBox: overrides && overrides.hasOwnProperty('createBox') ? overrides.createBox! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        createCustomProduct: overrides && overrides.hasOwnProperty('createCustomProduct') ? overrides.createCustomProduct! : relationshipsToOmit.has('EmptyNameError') ? {} as EmptyNameError : anEmptyNameError({}, relationshipsToOmit),
        createDistributionEvent: overrides && overrides.hasOwnProperty('createDistributionEvent') ? overrides.createDistributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        createDistributionSpot: overrides && overrides.hasOwnProperty('createDistributionSpot') ? overrides.createDistributionSpot! : relationshipsToOmit.has('DistributionSpot') ? {} as DistributionSpot : aDistributionSpot({}, relationshipsToOmit),
        createQrCode: overrides && overrides.hasOwnProperty('createQrCode') ? overrides.createQrCode! : relationshipsToOmit.has('QrCode') ? {} as QrCode : aQrCode({}, relationshipsToOmit),
        createShipment: overrides && overrides.hasOwnProperty('createShipment') ? overrides.createShipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        createTag: overrides && overrides.hasOwnProperty('createTag') ? overrides.createTag! : relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit),
        createTransferAgreement: overrides && overrides.hasOwnProperty('createTransferAgreement') ? overrides.createTransferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
        deactivateBeneficiary: overrides && overrides.hasOwnProperty('deactivateBeneficiary') ? overrides.deactivateBeneficiary! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        deleteBoxes: overrides && overrides.hasOwnProperty('deleteBoxes') ? overrides.deleteBoxes! : relationshipsToOmit.has('BoxesResult') ? {} as BoxesResult : aBoxesResult({}, relationshipsToOmit),
        deleteProduct: overrides && overrides.hasOwnProperty('deleteProduct') ? overrides.deleteProduct! : relationshipsToOmit.has('BoxesStillAssignedToProductError') ? {} as BoxesStillAssignedToProductError : aBoxesStillAssignedToProductError({}, relationshipsToOmit),
        deleteTag: overrides && overrides.hasOwnProperty('deleteTag') ? overrides.deleteTag! : relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit),
        disableStandardProduct: overrides && overrides.hasOwnProperty('disableStandardProduct') ? overrides.disableStandardProduct! : relationshipsToOmit.has('BoxesStillAssignedToProductError') ? {} as BoxesStillAssignedToProductError : aBoxesStillAssignedToProductError({}, relationshipsToOmit),
        editCustomProduct: overrides && overrides.hasOwnProperty('editCustomProduct') ? overrides.editCustomProduct! : relationshipsToOmit.has('EmptyNameError') ? {} as EmptyNameError : anEmptyNameError({}, relationshipsToOmit),
        editStandardProductInstantiation: overrides && overrides.hasOwnProperty('editStandardProductInstantiation') ? overrides.editStandardProductInstantiation! : relationshipsToOmit.has('InsufficientPermissionError') ? {} as InsufficientPermissionError : anInsufficientPermissionError({}, relationshipsToOmit),
        enableStandardProduct: overrides && overrides.hasOwnProperty('enableStandardProduct') ? overrides.enableStandardProduct! : relationshipsToOmit.has('InsufficientPermissionError') ? {} as InsufficientPermissionError : anInsufficientPermissionError({}, relationshipsToOmit),
        markShipmentAsLost: overrides && overrides.hasOwnProperty('markShipmentAsLost') ? overrides.markShipmentAsLost! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        moveBoxesToLocation: overrides && overrides.hasOwnProperty('moveBoxesToLocation') ? overrides.moveBoxesToLocation! : relationshipsToOmit.has('BoxesResult') ? {} as BoxesResult : aBoxesResult({}, relationshipsToOmit),
        moveItemsFromBoxToDistributionEvent: overrides && overrides.hasOwnProperty('moveItemsFromBoxToDistributionEvent') ? overrides.moveItemsFromBoxToDistributionEvent! : relationshipsToOmit.has('UnboxedItemsCollection') ? {} as UnboxedItemsCollection : anUnboxedItemsCollection({}, relationshipsToOmit),
        moveItemsFromReturnTrackingGroupToBox: overrides && overrides.hasOwnProperty('moveItemsFromReturnTrackingGroupToBox') ? overrides.moveItemsFromReturnTrackingGroupToBox! : relationshipsToOmit.has('DistributionEventsTrackingEntry') ? {} as DistributionEventsTrackingEntry : aDistributionEventsTrackingEntry({}, relationshipsToOmit),
        moveNotDeliveredBoxesInStock: overrides && overrides.hasOwnProperty('moveNotDeliveredBoxesInStock') ? overrides.moveNotDeliveredBoxesInStock! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        rejectTransferAgreement: overrides && overrides.hasOwnProperty('rejectTransferAgreement') ? overrides.rejectTransferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
        removeAllPackingListEntriesFromDistributionEventForProduct: overrides && overrides.hasOwnProperty('removeAllPackingListEntriesFromDistributionEventForProduct') ? overrides.removeAllPackingListEntriesFromDistributionEventForProduct! : true,
        removeItemsFromUnboxedItemsCollection: overrides && overrides.hasOwnProperty('removeItemsFromUnboxedItemsCollection') ? overrides.removeItemsFromUnboxedItemsCollection! : relationshipsToOmit.has('UnboxedItemsCollection') ? {} as UnboxedItemsCollection : anUnboxedItemsCollection({}, relationshipsToOmit),
        removePackingListEntryFromDistributionEvent: overrides && overrides.hasOwnProperty('removePackingListEntryFromDistributionEvent') ? overrides.removePackingListEntryFromDistributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        sendShipment: overrides && overrides.hasOwnProperty('sendShipment') ? overrides.sendShipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        setReturnedNumberOfItemsForDistributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('setReturnedNumberOfItemsForDistributionEventsTrackingGroup') ? overrides.setReturnedNumberOfItemsForDistributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingEntry') ? {} as DistributionEventsTrackingEntry : aDistributionEventsTrackingEntry({}, relationshipsToOmit),
        startDistributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('startDistributionEventsTrackingGroup') ? overrides.startDistributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit),
        startReceivingShipment: overrides && overrides.hasOwnProperty('startReceivingShipment') ? overrides.startReceivingShipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        unassignBoxFromDistributionEvent: overrides && overrides.hasOwnProperty('unassignBoxFromDistributionEvent') ? overrides.unassignBoxFromDistributionEvent! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        unassignTag: overrides && overrides.hasOwnProperty('unassignTag') ? overrides.unassignTag! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        unassignTagFromBoxes: overrides && overrides.hasOwnProperty('unassignTagFromBoxes') ? overrides.unassignTagFromBoxes! : relationshipsToOmit.has('BoxesResult') ? {} as BoxesResult : aBoxesResult({}, relationshipsToOmit),
        updateBeneficiary: overrides && overrides.hasOwnProperty('updateBeneficiary') ? overrides.updateBeneficiary! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        updateBox: overrides && overrides.hasOwnProperty('updateBox') ? overrides.updateBox! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        updatePackingListEntry: overrides && overrides.hasOwnProperty('updatePackingListEntry') ? overrides.updatePackingListEntry! : relationshipsToOmit.has('PackingListEntry') ? {} as PackingListEntry : aPackingListEntry({}, relationshipsToOmit),
        updateSelectedProductsForDistributionEventPackingList: overrides && overrides.hasOwnProperty('updateSelectedProductsForDistributionEventPackingList') ? overrides.updateSelectedProductsForDistributionEventPackingList! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        updateShipmentWhenPreparing: overrides && overrides.hasOwnProperty('updateShipmentWhenPreparing') ? overrides.updateShipmentWhenPreparing! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        updateShipmentWhenReceiving: overrides && overrides.hasOwnProperty('updateShipmentWhenReceiving') ? overrides.updateShipmentWhenReceiving! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        updateTag: overrides && overrides.hasOwnProperty('updateTag') ? overrides.updateTag! : relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit),
    };
};

export const anOrganisation = (overrides?: Partial<Organisation>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Organisation' } & Organisation => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Organisation');
    return {
        __typename: 'Organisation',
        bases: overrides && overrides.hasOwnProperty('bases') ? overrides.bases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '9ebedf6d-18d3-4338-89e9-aa0e95f805c9',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'arto',
    };
};

export const aPackingListEntry = (overrides?: Partial<PackingListEntry>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'PackingListEntry' } & PackingListEntry => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('PackingListEntry');
    return {
        __typename: 'PackingListEntry',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '2c93130f-1e8b-4fbe-a404-8344f6fe4245',
        matchingPackedItemsCollections: overrides && overrides.hasOwnProperty('matchingPackedItemsCollections') ? overrides.matchingPackedItemsCollections! : [relationshipsToOmit.has('ItemsCollection') ? {} as ItemsCollection : anItemsCollection({}, relationshipsToOmit)],
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 812,
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : PackingListEntryState.NotStarted,
    };
};

export const aPackingListEntryInput = (overrides?: Partial<PackingListEntryInput>, _relationshipsToOmit: Set<string> = new Set()): PackingListEntryInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('PackingListEntryInput');
    return {
        distributionEventId: overrides && overrides.hasOwnProperty('distributionEventId') ? overrides.distributionEventId! : '1f5f275f-0bf5-4cf0-b92f-1cbb08811bb1',
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 3554,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 41,
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 1260,
    };
};

export const aPageInfo = (overrides?: Partial<PageInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'PageInfo' } & PageInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('PageInfo');
    return {
        __typename: 'PageInfo',
        endCursor: overrides && overrides.hasOwnProperty('endCursor') ? overrides.endCursor! : 'tabgo',
        hasNextPage: overrides && overrides.hasOwnProperty('hasNextPage') ? overrides.hasNextPage! : true,
        hasPreviousPage: overrides && overrides.hasOwnProperty('hasPreviousPage') ? overrides.hasPreviousPage! : false,
        startCursor: overrides && overrides.hasOwnProperty('startCursor') ? overrides.startCursor! : 'tripudio',
    };
};

export const aPaginationInput = (overrides?: Partial<PaginationInput>, _relationshipsToOmit: Set<string> = new Set()): PaginationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('PaginationInput');
    return {
        after: overrides && overrides.hasOwnProperty('after') ? overrides.after! : 'provident',
        before: overrides && overrides.hasOwnProperty('before') ? overrides.before! : 'campana',
        first: overrides && overrides.hasOwnProperty('first') ? overrides.first! : 171,
        last: overrides && overrides.hasOwnProperty('last') ? overrides.last! : 3719,
    };
};

export const aProduct = (overrides?: Partial<Product>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Product' } & Product => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Product');
    return {
        __typename: 'Product',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : relationshipsToOmit.has('ProductCategory') ? {} as ProductCategory : aProductCategory({}, relationshipsToOmit),
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'colligo',
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-09-14T02:49:44.462Z",
        deletedOn: overrides && overrides.hasOwnProperty('deletedOn') ? overrides.deletedOn! : "2024-01-02T10:37:09.523Z",
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '8983bd3e-5f2a-444b-80e8-1249ed54ed80',
        inShop: overrides && overrides.hasOwnProperty('inShop') ? overrides.inShop! : false,
        lastModifiedBy: overrides && overrides.hasOwnProperty('lastModifiedBy') ? overrides.lastModifiedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        lastModifiedOn: overrides && overrides.hasOwnProperty('lastModifiedOn') ? overrides.lastModifiedOn! : "2024-04-16T16:54:15.968Z",
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'curo',
        price: overrides && overrides.hasOwnProperty('price') ? overrides.price! : 5,
        sizeRange: overrides && overrides.hasOwnProperty('sizeRange') ? overrides.sizeRange! : relationshipsToOmit.has('SizeRange') ? {} as SizeRange : aSizeRange({}, relationshipsToOmit),
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : ProductType.Custom,
    };
};

export const aProductCategory = (overrides?: Partial<ProductCategory>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ProductCategory' } & ProductCategory => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ProductCategory');
    return {
        __typename: 'ProductCategory',
        hasGender: overrides && overrides.hasOwnProperty('hasGender') ? overrides.hasGender! : false,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '494182d1-c050-4feb-a99a-f58e25e154e8',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'theca',
        products: overrides && overrides.hasOwnProperty('products') ? overrides.products! : relationshipsToOmit.has('ProductPage') ? {} as ProductPage : aProductPage({}, relationshipsToOmit),
    };
};

export const aProductDimensionInfo = (overrides?: Partial<ProductDimensionInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ProductDimensionInfo' } & ProductDimensionInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ProductDimensionInfo');
    return {
        __typename: 'ProductDimensionInfo',
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 8983,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'adamo',
    };
};

export const aProductPage = (overrides?: Partial<ProductPage>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ProductPage' } & ProductPage => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ProductPage');
    return {
        __typename: 'ProductPage',
        elements: overrides && overrides.hasOwnProperty('elements') ? overrides.elements! : [relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit)],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : relationshipsToOmit.has('PageInfo') ? {} as PageInfo : aPageInfo({}, relationshipsToOmit),
        totalCount: overrides && overrides.hasOwnProperty('totalCount') ? overrides.totalCount! : 7390,
    };
};

export const aProductTypeMismatchError = (overrides?: Partial<ProductTypeMismatchError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ProductTypeMismatchError' } & ProductTypeMismatchError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ProductTypeMismatchError');
    return {
        __typename: 'ProductTypeMismatchError',
        expectedType: overrides && overrides.hasOwnProperty('expectedType') ? overrides.expectedType! : ProductType.Custom,
    };
};

export const aQrCode = (overrides?: Partial<QrCode>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'QrCode' } & QrCode => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('QrCode');
    return {
        __typename: 'QrCode',
        box: overrides && overrides.hasOwnProperty('box') ? overrides.box! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        code: overrides && overrides.hasOwnProperty('code') ? overrides.code! : 'solus',
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-02-01T13:23:32.857Z",
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f6064180-7a3e-4559-9e8f-48be11ada995',
    };
};

export const aQuery = (overrides?: Partial<Query>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Query' } & Query => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Query');
    return {
        __typename: 'Query',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        bases: overrides && overrides.hasOwnProperty('bases') ? overrides.bases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        beneficiaries: overrides && overrides.hasOwnProperty('beneficiaries') ? overrides.beneficiaries! : relationshipsToOmit.has('BeneficiaryPage') ? {} as BeneficiaryPage : aBeneficiaryPage({}, relationshipsToOmit),
        beneficiary: overrides && overrides.hasOwnProperty('beneficiary') ? overrides.beneficiary! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        beneficiaryDemographics: overrides && overrides.hasOwnProperty('beneficiaryDemographics') ? overrides.beneficiaryDemographics! : relationshipsToOmit.has('BeneficiaryDemographicsData') ? {} as BeneficiaryDemographicsData : aBeneficiaryDemographicsData({}, relationshipsToOmit),
        box: overrides && overrides.hasOwnProperty('box') ? overrides.box! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        boxes: overrides && overrides.hasOwnProperty('boxes') ? overrides.boxes! : relationshipsToOmit.has('BoxPage') ? {} as BoxPage : aBoxPage({}, relationshipsToOmit),
        createdBoxes: overrides && overrides.hasOwnProperty('createdBoxes') ? overrides.createdBoxes! : relationshipsToOmit.has('CreatedBoxesData') ? {} as CreatedBoxesData : aCreatedBoxesData({}, relationshipsToOmit),
        distributionEvent: overrides && overrides.hasOwnProperty('distributionEvent') ? overrides.distributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        distributionEventsTrackingGroup: overrides && overrides.hasOwnProperty('distributionEventsTrackingGroup') ? overrides.distributionEventsTrackingGroup! : relationshipsToOmit.has('DistributionEventsTrackingGroup') ? {} as DistributionEventsTrackingGroup : aDistributionEventsTrackingGroup({}, relationshipsToOmit),
        distributionSpot: overrides && overrides.hasOwnProperty('distributionSpot') ? overrides.distributionSpot! : relationshipsToOmit.has('DistributionSpot') ? {} as DistributionSpot : aDistributionSpot({}, relationshipsToOmit),
        distributionSpots: overrides && overrides.hasOwnProperty('distributionSpots') ? overrides.distributionSpots! : [relationshipsToOmit.has('DistributionSpot') ? {} as DistributionSpot : aDistributionSpot({}, relationshipsToOmit)],
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : relationshipsToOmit.has('ClassicLocation') ? {} as ClassicLocation : aClassicLocation({}, relationshipsToOmit),
        locations: overrides && overrides.hasOwnProperty('locations') ? overrides.locations! : [relationshipsToOmit.has('ClassicLocation') ? {} as ClassicLocation : aClassicLocation({}, relationshipsToOmit)],
        metrics: overrides && overrides.hasOwnProperty('metrics') ? overrides.metrics! : relationshipsToOmit.has('Metrics') ? {} as Metrics : aMetrics({}, relationshipsToOmit),
        movedBoxes: overrides && overrides.hasOwnProperty('movedBoxes') ? overrides.movedBoxes! : relationshipsToOmit.has('MovedBoxesData') ? {} as MovedBoxesData : aMovedBoxesData({}, relationshipsToOmit),
        organisation: overrides && overrides.hasOwnProperty('organisation') ? overrides.organisation! : relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit),
        organisations: overrides && overrides.hasOwnProperty('organisations') ? overrides.organisations! : [relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit)],
        packingListEntry: overrides && overrides.hasOwnProperty('packingListEntry') ? overrides.packingListEntry! : relationshipsToOmit.has('PackingListEntry') ? {} as PackingListEntry : aPackingListEntry({}, relationshipsToOmit),
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        productCategories: overrides && overrides.hasOwnProperty('productCategories') ? overrides.productCategories! : [relationshipsToOmit.has('ProductCategory') ? {} as ProductCategory : aProductCategory({}, relationshipsToOmit)],
        productCategory: overrides && overrides.hasOwnProperty('productCategory') ? overrides.productCategory! : relationshipsToOmit.has('ProductCategory') ? {} as ProductCategory : aProductCategory({}, relationshipsToOmit),
        products: overrides && overrides.hasOwnProperty('products') ? overrides.products! : relationshipsToOmit.has('ProductPage') ? {} as ProductPage : aProductPage({}, relationshipsToOmit),
        qrCode: overrides && overrides.hasOwnProperty('qrCode') ? overrides.qrCode! : relationshipsToOmit.has('InsufficientPermissionError') ? {} as InsufficientPermissionError : anInsufficientPermissionError({}, relationshipsToOmit),
        qrExists: overrides && overrides.hasOwnProperty('qrExists') ? overrides.qrExists! : true,
        shipment: overrides && overrides.hasOwnProperty('shipment') ? overrides.shipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        shipments: overrides && overrides.hasOwnProperty('shipments') ? overrides.shipments! : [relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit)],
        standardProduct: overrides && overrides.hasOwnProperty('standardProduct') ? overrides.standardProduct! : relationshipsToOmit.has('InsufficientPermissionError') ? {} as InsufficientPermissionError : anInsufficientPermissionError({}, relationshipsToOmit),
        standardProducts: overrides && overrides.hasOwnProperty('standardProducts') ? overrides.standardProducts! : relationshipsToOmit.has('InsufficientPermissionError') ? {} as InsufficientPermissionError : anInsufficientPermissionError({}, relationshipsToOmit),
        stockOverview: overrides && overrides.hasOwnProperty('stockOverview') ? overrides.stockOverview! : relationshipsToOmit.has('StockOverviewData') ? {} as StockOverviewData : aStockOverviewData({}, relationshipsToOmit),
        tag: overrides && overrides.hasOwnProperty('tag') ? overrides.tag! : relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit),
        tags: overrides && overrides.hasOwnProperty('tags') ? overrides.tags! : [relationshipsToOmit.has('Tag') ? {} as Tag : aTag({}, relationshipsToOmit)],
        topProductsCheckedOut: overrides && overrides.hasOwnProperty('topProductsCheckedOut') ? overrides.topProductsCheckedOut! : relationshipsToOmit.has('TopProductsCheckedOutData') ? {} as TopProductsCheckedOutData : aTopProductsCheckedOutData({}, relationshipsToOmit),
        topProductsDonated: overrides && overrides.hasOwnProperty('topProductsDonated') ? overrides.topProductsDonated! : relationshipsToOmit.has('TopProductsDonatedData') ? {} as TopProductsDonatedData : aTopProductsDonatedData({}, relationshipsToOmit),
        transferAgreement: overrides && overrides.hasOwnProperty('transferAgreement') ? overrides.transferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
        transferAgreements: overrides && overrides.hasOwnProperty('transferAgreements') ? overrides.transferAgreements! : [relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit)],
        user: overrides && overrides.hasOwnProperty('user') ? overrides.user! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        users: overrides && overrides.hasOwnProperty('users') ? overrides.users! : [relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit)],
    };
};

export const aResourceDoesNotExistError = (overrides?: Partial<ResourceDoesNotExistError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ResourceDoesNotExistError' } & ResourceDoesNotExistError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ResourceDoesNotExistError');
    return {
        __typename: 'ResourceDoesNotExistError',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '1019b0a3-6819-4b2d-ac44-992054d19d0d',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'appello',
    };
};

export const aShipment = (overrides?: Partial<Shipment>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Shipment' } & Shipment => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Shipment');
    return {
        __typename: 'Shipment',
        canceledBy: overrides && overrides.hasOwnProperty('canceledBy') ? overrides.canceledBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        canceledOn: overrides && overrides.hasOwnProperty('canceledOn') ? overrides.canceledOn! : "2024-06-13T00:32:44.442Z",
        completedBy: overrides && overrides.hasOwnProperty('completedBy') ? overrides.completedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        completedOn: overrides && overrides.hasOwnProperty('completedOn') ? overrides.completedOn! : "2024-09-24T12:28:35.169Z",
        details: overrides && overrides.hasOwnProperty('details') ? overrides.details! : [relationshipsToOmit.has('ShipmentDetail') ? {} as ShipmentDetail : aShipmentDetail({}, relationshipsToOmit)],
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '2517db8a-e0ed-4d9c-a43f-05f6b51d5239',
        labelIdentifier: overrides && overrides.hasOwnProperty('labelIdentifier') ? overrides.labelIdentifier! : 'pecus',
        receivingStartedBy: overrides && overrides.hasOwnProperty('receivingStartedBy') ? overrides.receivingStartedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        receivingStartedOn: overrides && overrides.hasOwnProperty('receivingStartedOn') ? overrides.receivingStartedOn! : "2024-07-22T09:24:11.492Z",
        sentBy: overrides && overrides.hasOwnProperty('sentBy') ? overrides.sentBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        sentOn: overrides && overrides.hasOwnProperty('sentOn') ? overrides.sentOn! : "2024-06-02T16:49:51.543Z",
        sourceBase: overrides && overrides.hasOwnProperty('sourceBase') ? overrides.sourceBase! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        startedBy: overrides && overrides.hasOwnProperty('startedBy') ? overrides.startedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        startedOn: overrides && overrides.hasOwnProperty('startedOn') ? overrides.startedOn! : "2024-12-03T15:53:44.442Z",
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : ShipmentState.Canceled,
        targetBase: overrides && overrides.hasOwnProperty('targetBase') ? overrides.targetBase! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        transferAgreement: overrides && overrides.hasOwnProperty('transferAgreement') ? overrides.transferAgreement! : relationshipsToOmit.has('TransferAgreement') ? {} as TransferAgreement : aTransferAgreement({}, relationshipsToOmit),
    };
};

export const aShipmentCreationInput = (overrides?: Partial<ShipmentCreationInput>, _relationshipsToOmit: Set<string> = new Set()): ShipmentCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ShipmentCreationInput');
    return {
        sourceBaseId: overrides && overrides.hasOwnProperty('sourceBaseId') ? overrides.sourceBaseId! : 9669,
        targetBaseId: overrides && overrides.hasOwnProperty('targetBaseId') ? overrides.targetBaseId! : 7792,
        transferAgreementId: overrides && overrides.hasOwnProperty('transferAgreementId') ? overrides.transferAgreementId! : 9387,
    };
};

export const aShipmentDetail = (overrides?: Partial<ShipmentDetail>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'ShipmentDetail' } & ShipmentDetail => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ShipmentDetail');
    return {
        __typename: 'ShipmentDetail',
        box: overrides && overrides.hasOwnProperty('box') ? overrides.box! : relationshipsToOmit.has('Box') ? {} as Box : aBox({}, relationshipsToOmit),
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-06-25T17:50:45.656Z",
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'bef2ab71-8eec-4cf3-8d2d-b94cff0380c5',
        lostBy: overrides && overrides.hasOwnProperty('lostBy') ? overrides.lostBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        lostOn: overrides && overrides.hasOwnProperty('lostOn') ? overrides.lostOn! : "2024-03-14T22:37:29.583Z",
        receivedBy: overrides && overrides.hasOwnProperty('receivedBy') ? overrides.receivedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        receivedOn: overrides && overrides.hasOwnProperty('receivedOn') ? overrides.receivedOn! : "2024-10-23T00:55:18.947Z",
        removedBy: overrides && overrides.hasOwnProperty('removedBy') ? overrides.removedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        removedOn: overrides && overrides.hasOwnProperty('removedOn') ? overrides.removedOn! : "2024-01-16T20:31:27.813Z",
        shipment: overrides && overrides.hasOwnProperty('shipment') ? overrides.shipment! : relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit),
        sourceLocation: overrides && overrides.hasOwnProperty('sourceLocation') ? overrides.sourceLocation! : relationshipsToOmit.has('ClassicLocation') ? {} as ClassicLocation : aClassicLocation({}, relationshipsToOmit),
        sourceProduct: overrides && overrides.hasOwnProperty('sourceProduct') ? overrides.sourceProduct! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        sourceQuantity: overrides && overrides.hasOwnProperty('sourceQuantity') ? overrides.sourceQuantity! : 3205,
        sourceSize: overrides && overrides.hasOwnProperty('sourceSize') ? overrides.sourceSize! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
        targetLocation: overrides && overrides.hasOwnProperty('targetLocation') ? overrides.targetLocation! : relationshipsToOmit.has('ClassicLocation') ? {} as ClassicLocation : aClassicLocation({}, relationshipsToOmit),
        targetProduct: overrides && overrides.hasOwnProperty('targetProduct') ? overrides.targetProduct! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        targetQuantity: overrides && overrides.hasOwnProperty('targetQuantity') ? overrides.targetQuantity! : 7936,
        targetSize: overrides && overrides.hasOwnProperty('targetSize') ? overrides.targetSize! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
    };
};

export const aShipmentDetailUpdateInput = (overrides?: Partial<ShipmentDetailUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): ShipmentDetailUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ShipmentDetailUpdateInput');
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'e05bb81e-2bf2-41cf-94f5-3b5be515eaed',
        targetLocationId: overrides && overrides.hasOwnProperty('targetLocationId') ? overrides.targetLocationId! : 2694,
        targetProductId: overrides && overrides.hasOwnProperty('targetProductId') ? overrides.targetProductId! : 9731,
        targetQuantity: overrides && overrides.hasOwnProperty('targetQuantity') ? overrides.targetQuantity! : 6874,
        targetSizeId: overrides && overrides.hasOwnProperty('targetSizeId') ? overrides.targetSizeId! : 9386,
    };
};

export const aShipmentWhenPreparingUpdateInput = (overrides?: Partial<ShipmentWhenPreparingUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): ShipmentWhenPreparingUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ShipmentWhenPreparingUpdateInput');
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '2f828028-1749-45bf-b92c-336850052d25',
        preparedBoxLabelIdentifiers: overrides && overrides.hasOwnProperty('preparedBoxLabelIdentifiers') ? overrides.preparedBoxLabelIdentifiers! : ['ipsa'],
        removedBoxLabelIdentifiers: overrides && overrides.hasOwnProperty('removedBoxLabelIdentifiers') ? overrides.removedBoxLabelIdentifiers! : ['utilis'],
        targetBaseId: overrides && overrides.hasOwnProperty('targetBaseId') ? overrides.targetBaseId! : 9448,
    };
};

export const aShipmentWhenReceivingUpdateInput = (overrides?: Partial<ShipmentWhenReceivingUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): ShipmentWhenReceivingUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('ShipmentWhenReceivingUpdateInput');
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '025af6ce-9115-4288-9a43-3ce8792a7e29',
        lostBoxLabelIdentifiers: overrides && overrides.hasOwnProperty('lostBoxLabelIdentifiers') ? overrides.lostBoxLabelIdentifiers! : ['asporto'],
        receivedShipmentDetailUpdateInputs: overrides && overrides.hasOwnProperty('receivedShipmentDetailUpdateInputs') ? overrides.receivedShipmentDetailUpdateInputs! : [relationshipsToOmit.has('ShipmentDetailUpdateInput') ? {} as ShipmentDetailUpdateInput : aShipmentDetailUpdateInput({}, relationshipsToOmit)],
    };
};

export const aSize = (overrides?: Partial<Size>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Size' } & Size => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Size');
    return {
        __typename: 'Size',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f7e035d5-2fb7-4dd4-a13c-8ee0469a3509',
        label: overrides && overrides.hasOwnProperty('label') ? overrides.label! : 'deleo',
    };
};

export const aSizeRange = (overrides?: Partial<SizeRange>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'SizeRange' } & SizeRange => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('SizeRange');
    return {
        __typename: 'SizeRange',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'dcbb145b-0624-4d46-b4c7-e586402cd300',
        label: overrides && overrides.hasOwnProperty('label') ? overrides.label! : 'suscipit',
        sizes: overrides && overrides.hasOwnProperty('sizes') ? overrides.sizes! : [relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit)],
        units: overrides && overrides.hasOwnProperty('units') ? overrides.units! : [relationshipsToOmit.has('Unit') ? {} as Unit : aUnit({}, relationshipsToOmit)],
    };
};

export const aStandardProduct = (overrides?: Partial<StandardProduct>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StandardProduct' } & StandardProduct => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StandardProduct');
    return {
        __typename: 'StandardProduct',
        addedBy: overrides && overrides.hasOwnProperty('addedBy') ? overrides.addedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        addedOn: overrides && overrides.hasOwnProperty('addedOn') ? overrides.addedOn! : "2024-05-24T21:14:11.153Z",
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : relationshipsToOmit.has('ProductCategory') ? {} as ProductCategory : aProductCategory({}, relationshipsToOmit),
        deprecatedBy: overrides && overrides.hasOwnProperty('deprecatedBy') ? overrides.deprecatedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        deprecatedOn: overrides && overrides.hasOwnProperty('deprecatedOn') ? overrides.deprecatedOn! : "2023-12-30T17:55:18.250Z",
        enabledForBases: overrides && overrides.hasOwnProperty('enabledForBases') ? overrides.enabledForBases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '901016f2-8c8c-4ad6-81c6-2e8cdc89df6b',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'fuga',
        precededByProduct: overrides && overrides.hasOwnProperty('precededByProduct') ? overrides.precededByProduct! : relationshipsToOmit.has('StandardProduct') ? {} as StandardProduct : aStandardProduct({}, relationshipsToOmit),
        sizeRange: overrides && overrides.hasOwnProperty('sizeRange') ? overrides.sizeRange! : relationshipsToOmit.has('SizeRange') ? {} as SizeRange : aSizeRange({}, relationshipsToOmit),
        supercededByProduct: overrides && overrides.hasOwnProperty('supercededByProduct') ? overrides.supercededByProduct! : relationshipsToOmit.has('StandardProduct') ? {} as StandardProduct : aStandardProduct({}, relationshipsToOmit),
        version: overrides && overrides.hasOwnProperty('version') ? overrides.version! : 5358,
    };
};

export const aStandardProductAlreadyEnabledForBaseError = (overrides?: Partial<StandardProductAlreadyEnabledForBaseError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StandardProductAlreadyEnabledForBaseError' } & StandardProductAlreadyEnabledForBaseError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StandardProductAlreadyEnabledForBaseError');
    return {
        __typename: 'StandardProductAlreadyEnabledForBaseError',
        existingStandardProductInstantiationId: overrides && overrides.hasOwnProperty('existingStandardProductInstantiationId') ? overrides.existingStandardProductInstantiationId! : 'cb2ac1a6-9bea-492c-984f-1460e2b735fe',
    };
};

export const aStandardProductEnableInput = (overrides?: Partial<StandardProductEnableInput>, _relationshipsToOmit: Set<string> = new Set()): StandardProductEnableInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StandardProductEnableInput');
    return {
        baseId: overrides && overrides.hasOwnProperty('baseId') ? overrides.baseId! : 4840,
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'casso',
        inShop: overrides && overrides.hasOwnProperty('inShop') ? overrides.inShop! : true,
        price: overrides && overrides.hasOwnProperty('price') ? overrides.price! : 1625,
        sizeRangeId: overrides && overrides.hasOwnProperty('sizeRangeId') ? overrides.sizeRangeId! : 1429,
        standardProductId: overrides && overrides.hasOwnProperty('standardProductId') ? overrides.standardProductId! : 912,
    };
};

export const aStandardProductInstantiationEditInput = (overrides?: Partial<StandardProductInstantiationEditInput>, _relationshipsToOmit: Set<string> = new Set()): StandardProductInstantiationEditInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StandardProductInstantiationEditInput');
    return {
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'tempora',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '29e5c252-4fd4-44dc-a84a-4d34f118871d',
        inShop: overrides && overrides.hasOwnProperty('inShop') ? overrides.inShop! : true,
        price: overrides && overrides.hasOwnProperty('price') ? overrides.price! : 7000,
        sizeRangeId: overrides && overrides.hasOwnProperty('sizeRangeId') ? overrides.sizeRangeId! : 3424,
    };
};

export const aStandardProductPage = (overrides?: Partial<StandardProductPage>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StandardProductPage' } & StandardProductPage => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StandardProductPage');
    return {
        __typename: 'StandardProductPage',
        elements: overrides && overrides.hasOwnProperty('elements') ? overrides.elements! : [relationshipsToOmit.has('StandardProduct') ? {} as StandardProduct : aStandardProduct({}, relationshipsToOmit)],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : relationshipsToOmit.has('PageInfo') ? {} as PageInfo : aPageInfo({}, relationshipsToOmit),
        totalCount: overrides && overrides.hasOwnProperty('totalCount') ? overrides.totalCount! : 1496,
    };
};

export const aStockOverview = (overrides?: Partial<StockOverview>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StockOverview' } & StockOverview => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StockOverview');
    return {
        __typename: 'StockOverview',
        numberOfBoxes: overrides && overrides.hasOwnProperty('numberOfBoxes') ? overrides.numberOfBoxes! : 6997,
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 2056,
        productCategoryName: overrides && overrides.hasOwnProperty('productCategoryName') ? overrides.productCategoryName! : 'adfero',
    };
};

export const aStockOverviewData = (overrides?: Partial<StockOverviewData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StockOverviewData' } & StockOverviewData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StockOverviewData');
    return {
        __typename: 'StockOverviewData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('StockOverviewDataDimensions') ? {} as StockOverviewDataDimensions : aStockOverviewDataDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('StockOverviewResult') ? {} as StockOverviewResult : aStockOverviewResult({}, relationshipsToOmit)],
    };
};

export const aStockOverviewDataDimensions = (overrides?: Partial<StockOverviewDataDimensions>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StockOverviewDataDimensions' } & StockOverviewDataDimensions => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StockOverviewDataDimensions');
    return {
        __typename: 'StockOverviewDataDimensions',
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        dimension: overrides && overrides.hasOwnProperty('dimension') ? overrides.dimension! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        tag: overrides && overrides.hasOwnProperty('tag') ? overrides.tag! : [relationshipsToOmit.has('TagDimensionInfo') ? {} as TagDimensionInfo : aTagDimensionInfo({}, relationshipsToOmit)],
    };
};

export const aStockOverviewResult = (overrides?: Partial<StockOverviewResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'StockOverviewResult' } & StockOverviewResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('StockOverviewResult');
    return {
        __typename: 'StockOverviewResult',
        absoluteMeasureValue: overrides && overrides.hasOwnProperty('absoluteMeasureValue') ? overrides.absoluteMeasureValue! : 9.2,
        boxState: overrides && overrides.hasOwnProperty('boxState') ? overrides.boxState! : BoxState.Donated,
        boxesCount: overrides && overrides.hasOwnProperty('boxesCount') ? overrides.boxesCount! : 3364,
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 2724,
        dimensionId: overrides && overrides.hasOwnProperty('dimensionId') ? overrides.dimensionId! : 3546,
        gender: overrides && overrides.hasOwnProperty('gender') ? overrides.gender! : ProductGender.Boy,
        itemsCount: overrides && overrides.hasOwnProperty('itemsCount') ? overrides.itemsCount! : 2496,
        locationId: overrides && overrides.hasOwnProperty('locationId') ? overrides.locationId! : 8337,
        productName: overrides && overrides.hasOwnProperty('productName') ? overrides.productName! : 'volva',
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 8714,
        tagIds: overrides && overrides.hasOwnProperty('tagIds') ? overrides.tagIds! : [5875],
    };
};

export const aTag = (overrides?: Partial<Tag>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Tag' } & Tag => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Tag');
    return {
        __typename: 'Tag',
        base: overrides && overrides.hasOwnProperty('base') ? overrides.base! : relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit),
        color: overrides && overrides.hasOwnProperty('color') ? overrides.color! : 'comburo',
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'aureus',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '6926b150-7296-4e15-bc70-c82302664d98',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'cruentus',
        taggedResources: overrides && overrides.hasOwnProperty('taggedResources') ? overrides.taggedResources! : [relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit)],
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TagType.All,
    };
};

export const aTagCreationInput = (overrides?: Partial<TagCreationInput>, _relationshipsToOmit: Set<string> = new Set()): TagCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TagCreationInput');
    return {
        baseId: overrides && overrides.hasOwnProperty('baseId') ? overrides.baseId! : 1227,
        color: overrides && overrides.hasOwnProperty('color') ? overrides.color! : 'sustineo',
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'bonus',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'antepono',
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TagType.All,
    };
};

export const aTagDimensionInfo = (overrides?: Partial<TagDimensionInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TagDimensionInfo' } & TagDimensionInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TagDimensionInfo');
    return {
        __typename: 'TagDimensionInfo',
        color: overrides && overrides.hasOwnProperty('color') ? overrides.color! : 'barba',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 688,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'cornu',
    };
};

export const aTagOperationInput = (overrides?: Partial<TagOperationInput>, _relationshipsToOmit: Set<string> = new Set()): TagOperationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TagOperationInput');
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '4ceb015f-a0c6-4064-afe5-4e823d1aefd4',
        resourceId: overrides && overrides.hasOwnProperty('resourceId') ? overrides.resourceId! : 'd4d5b328-c0ce-42b9-b24c-e07dc7901c09',
        resourceType: overrides && overrides.hasOwnProperty('resourceType') ? overrides.resourceType! : TaggableResourceType.Beneficiary,
    };
};

export const aTagTypeMismatchError = (overrides?: Partial<TagTypeMismatchError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TagTypeMismatchError' } & TagTypeMismatchError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TagTypeMismatchError');
    return {
        __typename: 'TagTypeMismatchError',
        expectedType: overrides && overrides.hasOwnProperty('expectedType') ? overrides.expectedType! : TagType.All,
    };
};

export const aTagUpdateInput = (overrides?: Partial<TagUpdateInput>, _relationshipsToOmit: Set<string> = new Set()): TagUpdateInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TagUpdateInput');
    return {
        color: overrides && overrides.hasOwnProperty('color') ? overrides.color! : 'adficio',
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'surgo',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '8fed34ac-8015-459b-9b94-f08c6f3e6780',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'totam',
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TagType.All,
    };
};

export const aTargetDimensionInfo = (overrides?: Partial<TargetDimensionInfo>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TargetDimensionInfo' } & TargetDimensionInfo => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TargetDimensionInfo');
    return {
        __typename: 'TargetDimensionInfo',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '288b9fec-2e56-4b5d-ae49-b26dce5bead5',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'decet',
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TargetType.BoxState,
    };
};

export const aTopProductsCheckedOutData = (overrides?: Partial<TopProductsCheckedOutData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TopProductsCheckedOutData' } & TopProductsCheckedOutData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TopProductsCheckedOutData');
    return {
        __typename: 'TopProductsCheckedOutData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('TopProductsDimensions') ? {} as TopProductsDimensions : aTopProductsDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('TopProductsCheckedOutResult') ? {} as TopProductsCheckedOutResult : aTopProductsCheckedOutResult({}, relationshipsToOmit)],
    };
};

export const aTopProductsCheckedOutResult = (overrides?: Partial<TopProductsCheckedOutResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TopProductsCheckedOutResult' } & TopProductsCheckedOutResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TopProductsCheckedOutResult');
    return {
        __typename: 'TopProductsCheckedOutResult',
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 2339,
        checkedOutOn: overrides && overrides.hasOwnProperty('checkedOutOn') ? overrides.checkedOutOn! : "2024-06-09T11:27:59.203Z",
        itemsCount: overrides && overrides.hasOwnProperty('itemsCount') ? overrides.itemsCount! : 6880,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 7820,
        rank: overrides && overrides.hasOwnProperty('rank') ? overrides.rank! : 4931,
    };
};

export const aTopProductsDimensions = (overrides?: Partial<TopProductsDimensions>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TopProductsDimensions' } & TopProductsDimensions => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TopProductsDimensions');
    return {
        __typename: 'TopProductsDimensions',
        category: overrides && overrides.hasOwnProperty('category') ? overrides.category! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : [relationshipsToOmit.has('ProductDimensionInfo') ? {} as ProductDimensionInfo : aProductDimensionInfo({}, relationshipsToOmit)],
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : [relationshipsToOmit.has('DimensionInfo') ? {} as DimensionInfo : aDimensionInfo({}, relationshipsToOmit)],
    };
};

export const aTopProductsDonatedData = (overrides?: Partial<TopProductsDonatedData>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TopProductsDonatedData' } & TopProductsDonatedData => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TopProductsDonatedData');
    return {
        __typename: 'TopProductsDonatedData',
        dimensions: overrides && overrides.hasOwnProperty('dimensions') ? overrides.dimensions! : relationshipsToOmit.has('TopProductsDimensions') ? {} as TopProductsDimensions : aTopProductsDimensions({}, relationshipsToOmit),
        facts: overrides && overrides.hasOwnProperty('facts') ? overrides.facts! : [relationshipsToOmit.has('TopProductsDonatedResult') ? {} as TopProductsDonatedResult : aTopProductsDonatedResult({}, relationshipsToOmit)],
    };
};

export const aTopProductsDonatedResult = (overrides?: Partial<TopProductsDonatedResult>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TopProductsDonatedResult' } & TopProductsDonatedResult => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TopProductsDonatedResult');
    return {
        __typename: 'TopProductsDonatedResult',
        categoryId: overrides && overrides.hasOwnProperty('categoryId') ? overrides.categoryId! : 8417,
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-01-02T05:16:02.390Z",
        donatedOn: overrides && overrides.hasOwnProperty('donatedOn') ? overrides.donatedOn! : "2024-03-28T01:32:02.613Z",
        itemsCount: overrides && overrides.hasOwnProperty('itemsCount') ? overrides.itemsCount! : 3232,
        productId: overrides && overrides.hasOwnProperty('productId') ? overrides.productId! : 7909,
        rank: overrides && overrides.hasOwnProperty('rank') ? overrides.rank! : 9723,
        sizeId: overrides && overrides.hasOwnProperty('sizeId') ? overrides.sizeId! : 9789,
    };
};

export const aTransaction = (overrides?: Partial<Transaction>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Transaction' } & Transaction => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Transaction');
    return {
        __typename: 'Transaction',
        beneficiary: overrides && overrides.hasOwnProperty('beneficiary') ? overrides.beneficiary! : relationshipsToOmit.has('Beneficiary') ? {} as Beneficiary : aBeneficiary({}, relationshipsToOmit),
        count: overrides && overrides.hasOwnProperty('count') ? overrides.count! : 1158,
        createdBy: overrides && overrides.hasOwnProperty('createdBy') ? overrides.createdBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        createdOn: overrides && overrides.hasOwnProperty('createdOn') ? overrides.createdOn! : "2024-10-31T02:36:42.018Z",
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'blanditiis',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'a2c968e2-20e5-46c0-b956-8dcf7c49fde5',
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        tokens: overrides && overrides.hasOwnProperty('tokens') ? overrides.tokens! : 5336,
    };
};

export const aTransferAgreement = (overrides?: Partial<TransferAgreement>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'TransferAgreement' } & TransferAgreement => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TransferAgreement');
    return {
        __typename: 'TransferAgreement',
        acceptedBy: overrides && overrides.hasOwnProperty('acceptedBy') ? overrides.acceptedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        acceptedOn: overrides && overrides.hasOwnProperty('acceptedOn') ? overrides.acceptedOn! : "2024-01-10T13:14:17.685Z",
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'compono',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '7c21fe32-159a-4a67-8bed-01020b30d9c1',
        requestedBy: overrides && overrides.hasOwnProperty('requestedBy') ? overrides.requestedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        requestedOn: overrides && overrides.hasOwnProperty('requestedOn') ? overrides.requestedOn! : "2024-06-28T13:02:53.931Z",
        shipments: overrides && overrides.hasOwnProperty('shipments') ? overrides.shipments! : [relationshipsToOmit.has('Shipment') ? {} as Shipment : aShipment({}, relationshipsToOmit)],
        sourceBases: overrides && overrides.hasOwnProperty('sourceBases') ? overrides.sourceBases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        sourceOrganisation: overrides && overrides.hasOwnProperty('sourceOrganisation') ? overrides.sourceOrganisation! : relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit),
        state: overrides && overrides.hasOwnProperty('state') ? overrides.state! : TransferAgreementState.Accepted,
        targetBases: overrides && overrides.hasOwnProperty('targetBases') ? overrides.targetBases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        targetOrganisation: overrides && overrides.hasOwnProperty('targetOrganisation') ? overrides.targetOrganisation! : relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit),
        terminatedBy: overrides && overrides.hasOwnProperty('terminatedBy') ? overrides.terminatedBy! : relationshipsToOmit.has('User') ? {} as User : aUser({}, relationshipsToOmit),
        terminatedOn: overrides && overrides.hasOwnProperty('terminatedOn') ? overrides.terminatedOn! : "2024-06-17T18:47:38.559Z",
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TransferAgreementType.Bidirectional,
        validFrom: overrides && overrides.hasOwnProperty('validFrom') ? overrides.validFrom! : "2024-09-17T19:42:25.866Z",
        validUntil: overrides && overrides.hasOwnProperty('validUntil') ? overrides.validUntil! : "2024-02-10T13:03:04.736Z",
    };
};

export const aTransferAgreementCreationInput = (overrides?: Partial<TransferAgreementCreationInput>, _relationshipsToOmit: Set<string> = new Set()): TransferAgreementCreationInput => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('TransferAgreementCreationInput');
    return {
        comment: overrides && overrides.hasOwnProperty('comment') ? overrides.comment! : 'solus',
        initiatingOrganisationBaseIds: overrides && overrides.hasOwnProperty('initiatingOrganisationBaseIds') ? overrides.initiatingOrganisationBaseIds! : [7840],
        initiatingOrganisationId: overrides && overrides.hasOwnProperty('initiatingOrganisationId') ? overrides.initiatingOrganisationId! : 1564,
        partnerOrganisationBaseIds: overrides && overrides.hasOwnProperty('partnerOrganisationBaseIds') ? overrides.partnerOrganisationBaseIds! : [6201],
        partnerOrganisationId: overrides && overrides.hasOwnProperty('partnerOrganisationId') ? overrides.partnerOrganisationId! : 1979,
        type: overrides && overrides.hasOwnProperty('type') ? overrides.type! : TransferAgreementType.Bidirectional,
        validFrom: overrides && overrides.hasOwnProperty('validFrom') ? overrides.validFrom! : "2024-11-29T17:19:47.832Z",
        validUntil: overrides && overrides.hasOwnProperty('validUntil') ? overrides.validUntil! : "2024-10-13T15:04:38.744Z",
    };
};

export const anUnauthorizedForBaseError = (overrides?: Partial<UnauthorizedForBaseError>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'UnauthorizedForBaseError' } & UnauthorizedForBaseError => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('UnauthorizedForBaseError');
    return {
        __typename: 'UnauthorizedForBaseError',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '0d29ef8d-09dc-451d-8752-b99e47dc0948',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'tamquam',
        organisationName: overrides && overrides.hasOwnProperty('organisationName') ? overrides.organisationName! : 'totus',
    };
};

export const anUnboxedItemsCollection = (overrides?: Partial<UnboxedItemsCollection>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'UnboxedItemsCollection' } & UnboxedItemsCollection => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('UnboxedItemsCollection');
    return {
        __typename: 'UnboxedItemsCollection',
        distributionEvent: overrides && overrides.hasOwnProperty('distributionEvent') ? overrides.distributionEvent! : relationshipsToOmit.has('DistributionEvent') ? {} as DistributionEvent : aDistributionEvent({}, relationshipsToOmit),
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '38181059-b649-4cdc-883e-deddf04bf054',
        label: overrides && overrides.hasOwnProperty('label') ? overrides.label! : 'venustas',
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : relationshipsToOmit.has('Location') ? {} as Location : aLocation({}, relationshipsToOmit),
        numberOfItems: overrides && overrides.hasOwnProperty('numberOfItems') ? overrides.numberOfItems! : 2679,
        product: overrides && overrides.hasOwnProperty('product') ? overrides.product! : relationshipsToOmit.has('Product') ? {} as Product : aProduct({}, relationshipsToOmit),
        size: overrides && overrides.hasOwnProperty('size') ? overrides.size! : relationshipsToOmit.has('Size') ? {} as Size : aSize({}, relationshipsToOmit),
    };
};

export const aUnit = (overrides?: Partial<Unit>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'Unit' } & Unit => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('Unit');
    return {
        __typename: 'Unit',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '26aa208d-7fdb-4321-8c28-99ba08ca21ef',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'adipisci',
        symbol: overrides && overrides.hasOwnProperty('symbol') ? overrides.symbol! : 'in',
    };
};

export const aUser = (overrides?: Partial<User>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'User' } & User => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('User');
    return {
        __typename: 'User',
        bases: overrides && overrides.hasOwnProperty('bases') ? overrides.bases! : [relationshipsToOmit.has('Base') ? {} as Base : aBase({}, relationshipsToOmit)],
        email: overrides && overrides.hasOwnProperty('email') ? overrides.email! : 'natus',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'b5756f00-51a6-422a-81a7-dc13ee6a6375',
        lastAction: overrides && overrides.hasOwnProperty('lastAction') ? overrides.lastAction! : "2024-04-15T23:48:08.325Z",
        lastLogin: overrides && overrides.hasOwnProperty('lastLogin') ? overrides.lastLogin! : "2024-01-10T07:46:04.751Z",
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'supellex',
        organisation: overrides && overrides.hasOwnProperty('organisation') ? overrides.organisation! : relationshipsToOmit.has('Organisation') ? {} as Organisation : anOrganisation({}, relationshipsToOmit),
        validFirstDay: overrides && overrides.hasOwnProperty('validFirstDay') ? overrides.validFirstDay! : "2024-06-30T13:31:15.944Z",
        validLastDay: overrides && overrides.hasOwnProperty('validLastDay') ? overrides.validLastDay! : "2024-10-11T00:51:10.928Z",
    };
};
