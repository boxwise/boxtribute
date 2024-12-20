import { delay, graphql, GraphQLResponseResolver, HttpResponse, RequestHandlerOptions } from "msw"
import { ResultOf, TadaDocumentNode, VariablesOf } from "gql.tada";
import { devCoordinator } from "./fixtures";

import { worker } from "../front/browser"
import { ORGANISATION_AND_BASES_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE, CHECK_IF_QR_EXISTS_IN_DB, MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY, ALL_SHIPMENTS_QUERY } from "../front/src/queries/queries"
import { BOXES_FOR_BOXESVIEW_QUERY, ACTION_OPTIONS_FOR_BOXESVIEW_QUERY } from "../front/src/views/Boxes/BoxesView"
import { UPDATE_BOX_MUTATION, UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, UPDATE_STATE_IN_BOX_MUTATION } from "../front/src/views/Box/BoxView"
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, UPDATE_CONTENT_OF_BOX_MUTATION } from "../front/src/views/BoxEdit/BoxEditView";
import { ALL_ORGS_AND_BASES_QUERY } from "../front/src/views/Transfers/CreateTransferAgreement/CreateTransferAgreementView";
import { ASSIGN_BOXES_TO_SHIPMENT, UNASSIGN_BOX_FROM_SHIPMENT } from "../front/src/hooks/useAssignBoxesToShipment";
import { ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY, CREATE_BOX_MUTATION } from "../front/src/views/BoxCreate/BoxCreateView";
import { SHIPMENT_BY_ID_QUERY } from "../front/src/views/Transfers/ShipmentView/ShipmentView";
import { ALL_TRANSFER_AGREEMENTS_QUERY } from "../front/src/views/Transfers/TransferAgreementOverview/TransferAgreementOverviewView";
import { ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY, ALL_BASES_OF_CURRENT_ORG_QUERY, CREATE_SHIPMENT_MUTATION } from "../front/src/views/Transfers/CreateShipment/CreateShipmentView";
import { CREATED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import { MOVED_BOXES_QUERY } from "../shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer";
import { STOCK_QUERY } from "../shared-components/statviz/components/visualizations/stock/StockDataContainer";
import { DEMOGRAPHIC_QUERY } from "../shared-components/statviz/components/visualizations/demographic/DemographicDataContainer";

// Utilities

async function baseQueryHandler<T extends TadaDocumentNode>(
  /** Query used for handler. */
  operation: T,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  await delay(100);

  return graphql.query<ResultOf<T>, VariablesOf<T>>(
    operation.definitions[0]["name"].value,
    resolver,
    options
  )
}

async function baseMutationHandler<T extends TadaDocumentNode>(
  /** Mutation used for handler. */
  operation: T,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  await delay(100);

  return graphql.mutation<ResultOf<T>, VariablesOf<T>>(
    operation.definitions[0]["name"].value,
    resolver,
    options
  )
}

const boxByLabelIdentifierLocation = devCoordinator.BoxByLabelIdentifier.data.box.location;
const boxByLabelIdentifierHistory = devCoordinator.BoxByLabelIdentifier.data.box.history;
const boxByLabelIdentifierShipments = devCoordinator.BoxByLabelIdentifier.data.shipments;

const findBox = (labelIdentifier: string) => Object.values(devCoordinator.BoxesForBoxesViewQuery.baseId)
  .flatMap(res => res.data.boxes.elements)
  .find(box => box.labelIdentifier === labelIdentifier)!;

const findProduct = (id: string) => Object.values(devCoordinator.BoxByLabelIdentifierAndAllProductsWithBaseId.baseId)
  .flatMap(res => res.data.base.products)
  .find(product => product.id === id)!;

const findLocation = (id: string) => Object.values(devCoordinator.BoxByLabelIdentifierAndAllProductsWithBaseId.baseId)
  .flatMap(res => res.data.base.locations)
  .find(location => location.id === id)!;

const findTags = (ids: number[]) => Object.values(devCoordinator.BoxByLabelIdentifierAndAllProductsWithBaseId.baseId)
  .flatMap(res => res.data.base.tags)
  .filter((tag) => ids.includes(Number(tag.value)))!
  .map(tag => ({ ...tag, id: tag.value, name: tag.label, type: "A type", description: "A label" }));

// Handlers

const mockCreatedBoxesHandler = baseQueryHandler(CREATED_BOXES_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.createdBoxes);
});

const mockMovedBoxesHandler = baseQueryHandler(MOVED_BOXES_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.movedBoxes);
});

const mockBeneficiaryDemographicsHandler = baseQueryHandler(DEMOGRAPHIC_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.BeneficiaryDemographics);
});

const mockStockOverviewHandler = baseQueryHandler(STOCK_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.stockOverview);
});

const mockMoveBoxesHandler = graphql.mutation("MoveBoxes", ({ variables }) => {
  console.log(variables);
});

const mockAssignTagsHandler = graphql.mutation("AssignTags", ({ variables }) => {
  console.log(variables);
});

const mockOrganisationsAndBasesQueryHandler = baseQueryHandler(ORGANISATION_AND_BASES_QUERY, () => {

  return HttpResponse.json(devCoordinator.OrganisationAndBases);
});

const mockGetBoxLabelIdentifierForQrCodeHandler = baseQueryHandler(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE, ({ variables }) => {
  const { qrCode } = variables;

  const result = devCoordinator.GetBoxLabelIdentifierForQrCode[qrCode];

  if (!result) return HttpResponse.json({ errors: [{ message: "Mock doesn't exist for this QRCode." }] });

  // @ts-ignore
  return HttpResponse.json(result);
});

const mockCheckIfQrExistsInDbHandler = baseQueryHandler(CHECK_IF_QR_EXISTS_IN_DB, ({ variables }) => {
  const { qrCode } = variables;

  const result = devCoordinator.CheckIfQrExistsInDb[qrCode];

  if (!result) return HttpResponse.json({ errors: [{ message: "Mock doesn't exist for this QRCode." }] });

  // @ts-ignore
  return HttpResponse.json(result);
});

const mockMultiBoxActionOptionsForLocationsTagsAndShipmentseHandler = baseQueryHandler(
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY, ({ variables }) => {
    const { baseId } = variables;

    return HttpResponse.json(devCoordinator.MultiBoxActionOptionsForLocationsTagsAndShipments.baseId[baseId]);
  });

const mockAllProductsAndLocationsForBaseHandler = baseQueryHandler(ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY, ({ variables }) => {
  const { baseId } = variables;

  return HttpResponse.json(devCoordinator.AllProductsAndLocationsForBase.baseId[baseId]);
});

// TODO: include box in BoxesForBoxesViewQuery?
const mockCreateBoxHandler = baseMutationHandler(CREATE_BOX_MUTATION, async ({ variables }) => {
  const { locationId, numberOfItems, productId, comment, tagIds, sizeId } = variables;

  const allProducts = Object.values(devCoordinator.AllProductsAndLocationsForBase.baseId)
    .flatMap(res => res.data.base.products);
  const size = allProducts.find(product => product.id === "" + productId)?.sizeRange.sizes.find(size => size.id === "" + sizeId)!;

  const box = {
    ...Object.values(devCoordinator.BoxesForBoxesViewQuery.baseId).flatMap(res => res.data.boxes.elements)[0]
  }

  box.numberOfItems = numberOfItems;
  box.location = findLocation("" + locationId);
  box.product = findProduct("" + productId);
  box.size = size;
  if (comment) box.comment = comment;
  if (tagIds?.length) box.tags = findTags(tagIds);

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, ({ variables: { labelIdentifier } }) =>
    HttpResponse.json({
      data: {
        box: {
          // @ts-expect-error
          ...box, labelIdentifier, location: { ...box.location, ...boxByLabelIdentifierLocation, defaultBoxState: "InStock" },
          history: boxByLabelIdentifierHistory
        },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json(devCoordinator.CreateBox);
})

const mockBoxesForBoxesViewHandler = baseQueryHandler(BOXES_FOR_BOXESVIEW_QUERY, ({ variables }) => {
  const { baseId } = variables;

  return HttpResponse.json(devCoordinator.BoxesForBoxesViewQuery.baseId[baseId]);
});

const mockActionOptionsForBoxesViewHandler = baseQueryHandler(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, ({ variables }) => {
  const { baseId } = variables;

  return HttpResponse.json(devCoordinator.ActionOptionsForBoxesView.baseId[baseId]);
});

const mockBoxByLabelIdentifierHandler = baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, ({ variables }) => {
  const { labelIdentifier } = variables;

  const box = findBox(labelIdentifier);

  return HttpResponse.json({
    data: {
      // @ts-expect-error
      box: { ...box, location: { ...box.location, ...boxByLabelIdentifierLocation }, history: boxByLabelIdentifierHistory },
      // @ts-expect-error
      shipments: boxByLabelIdentifierShipments
    }
  });
})

const mockUpdateLocationOfBoxHandler = baseMutationHandler(UPDATE_BOX_MUTATION, async ({ variables }) => {
  const { boxLabelIdentifier, newLocationId } = variables;

  const box = findBox(boxLabelIdentifier);

  box.location.id = "" + newLocationId;

  const newLocationName = boxByLabelIdentifierLocation.base.locations.find(location => location.id === "" + newLocationId)!.name;

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, location: { ...box, name: newLocationName, base: boxByLabelIdentifierLocation.base }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json({ data: { updateBox: box } });
})

const mockUpdateStateHandler = baseMutationHandler(UPDATE_STATE_IN_BOX_MUTATION, async ({ variables }) => {
  const { boxLabelIdentifier, newState } = variables;

  const box = findBox(boxLabelIdentifier);

  box.state = newState ? newState : "InStock";

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, state: box.state, location: { ...box.location, ...boxByLabelIdentifierLocation, defaultBoxState: "InStock" }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json({ data: { updateBox: box } });
})

const mockUpdateNumberOfItemsHandler = baseMutationHandler(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, async ({ variables }) => {
  const { boxLabelIdentifier, numberOfItems } = variables;

  const box = findBox(boxLabelIdentifier);

  box.numberOfItems = numberOfItems;

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, location: { ...box.location, ...boxByLabelIdentifierLocation }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json({ data: { updateBox: box } });
})

const mockBoxByLabelIdentifierAndAllProductsWithBaseIdHandler = baseQueryHandler(
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, ({ variables }) => {
    const { baseId, labelIdentifier } = variables;

    const box = findBox(labelIdentifier);
    const base = devCoordinator.BoxByLabelIdentifierAndAllProductsWithBaseId.baseId[baseId].data.base;

    return HttpResponse.json({
      data: {
        // @ts-expect-error
        base, box: { ...box, id: labelIdentifier, history: boxByLabelIdentifierHistory },
      }
    });
  })

const mockUpdateContentOfBoxHandler = baseMutationHandler(UPDATE_CONTENT_OF_BOX_MUTATION, async ({ variables }) => {
  const { boxLabelIdentifier, locationId, numberOfItems, productId, sizeId, comment, tagIds } = variables;

  const box = findBox(boxLabelIdentifier);

  box.comment = comment!;
  box.numberOfItems = numberOfItems;
  box.product = findProduct("" + productId);
  box.size = findProduct("" + productId).sizeRange.sizes.find(s => s.id === "" + sizeId)!;
  box.tags = findTags(tagIds!);

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, location: { ...box.location, ...boxByLabelIdentifierLocation, ...findLocation("" + locationId) }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  return HttpResponse.json({ data: { updateBox: box } });
})

// TODO: support multiple boxes assigment
const mockAssignBoxesToShipmentHandler = baseMutationHandler(ASSIGN_BOXES_TO_SHIPMENT, async ({ variables }) => {
  const { labelIdentifiers, id: resId } = variables;

  const result = devCoordinator.AssignBoxesToShipment;
  const box = findBox(labelIdentifiers![0]);
  const lastShipmentDetailCopy = result.data.updateShipmentWhenPreparing.details.at(-1)!;

  box.state = "MarkedForShipment";
  // @ts-expect-error
  lastShipmentDetailCopy.box = box;
  lastShipmentDetailCopy.box.shipmentDetail = { __typename: "", id: "", shipment: { __typename: "", id: resId } };
  result.data.updateShipmentWhenPreparing.details.push(lastShipmentDetailCopy);

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        box: {
          ...box,
          // @ts-expect-error
          location: { ...box.location, ...boxByLabelIdentifierLocation },
          shipmentDetail: {
            // @ts-expect-error
            ...lastShipmentDetailCopy.box.shipmentDetail, shipment: { targetBase: result.data.updateShipmentWhenPreparing.targetBase, id: resId }
          },
          history: boxByLabelIdentifierHistory
        },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json(result);
});

const mockUnassignBoxesFromShipmentHandler = baseMutationHandler(UNASSIGN_BOX_FROM_SHIPMENT, async ({ variables }) => {
  const { labelIdentifiers } = variables;

  const result = devCoordinator.UnassignBoxesFromShipment;
  const box = findBox(labelIdentifiers![0]);
  const lastShipmentDetailCopy = result.data.updateShipmentWhenPreparing.details.at(-1)!;

  box.state = "InStock";
  // @ts-expect-error
  lastShipmentDetailCopy.box = box;
  lastShipmentDetailCopy.box.shipmentDetail = null;
  result.data.updateShipmentWhenPreparing.details.push(lastShipmentDetailCopy);

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, location: { ...box.location, ...boxByLabelIdentifierLocation }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json(result);
});

const mockAllOrganisationsAndBasesHandler = baseQueryHandler(ALL_ORGS_AND_BASES_QUERY, () => {
  return HttpResponse.json(devCoordinator.AllOrganisationsAndBases);
});

const mockAllBasesOfCurrentOrgHandler = baseQueryHandler(ALL_BASES_OF_CURRENT_ORG_QUERY, () => {
  return HttpResponse.json(devCoordinator.AllBasesOfCurrentOrg);
});

const mockShipmentsHandler = baseQueryHandler(ALL_SHIPMENTS_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.Shipments);
});

const mockShipmentByIdHandler = baseQueryHandler(SHIPMENT_BY_ID_QUERY, ({ variables }) => {
  const { id } = variables;
  return HttpResponse.json(devCoordinator.ShipmentById[id]);
});

const mockTransferAgreementsHandler = baseQueryHandler(ALL_TRANSFER_AGREEMENTS_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.TransferAgreements);
});

const mockAllAcceptedTransferAgreementsHandler = baseQueryHandler(ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY, () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.AllAcceptedTransferAgreements);
});

const mockCreateShipmentHandler = baseMutationHandler(CREATE_SHIPMENT_MUTATION, async ({ variables }) => {
  // eslint-disable-next-line no-unused-vars
  const { sourceBaseId, targetBaseId, transferAgreementId } = variables;

  // TODO: labelIdentifier, user, sourceBase, targetBase

  const newShipment = devCoordinator.ShipmentById[10].data.shipment;

  newShipment.id = `${devCoordinator.Shipments.data.shipments.length + 1}`;

  devCoordinator.Shipments.data.shipments.push(newShipment);

  devCoordinator.ShipmentById[newShipment.id] = { data: { shipment: newShipment } };

  // @ts-expect-error
  if (transferAgreementId) newShipment.transferAgreement = devCoordinator.TransferAgreements.data.transferAgreements
    .find(transferAgreement => transferAgreement.id === "" + transferAgreementId);

  // @ts-expect-error
  return HttpResponse.json({ data: { createShipment: newShipment } });
})

// CreateTransferAgreements
// CancelTransferAgreements
// SendShipment
// UpdateShipmentWhenReceiving
// DeleteBoxes
// box history
// box not changing state 2nd time?
// bug with assigning tags?
// multibox tag, location, shipment diff base errors?

// Exported handlers to be consumed by MSW
export const handlers = [
  await mockOrganisationsAndBasesQueryHandler,
  await mockCreatedBoxesHandler,
  await mockMovedBoxesHandler,
  await mockBeneficiaryDemographicsHandler,
  await mockStockOverviewHandler,
  await mockGetBoxLabelIdentifierForQrCodeHandler,
  await mockCheckIfQrExistsInDbHandler,
  await mockAllProductsAndLocationsForBaseHandler,
  await mockMultiBoxActionOptionsForLocationsTagsAndShipmentseHandler,
  await mockCreateBoxHandler,
  await mockBoxesForBoxesViewHandler,
  await mockActionOptionsForBoxesViewHandler,
  await mockBoxByLabelIdentifierHandler,
  await mockUpdateLocationOfBoxHandler,
  await mockUpdateStateHandler,
  await mockUpdateNumberOfItemsHandler,
  await mockBoxByLabelIdentifierAndAllProductsWithBaseIdHandler,
  await mockUpdateContentOfBoxHandler,
  await mockAssignBoxesToShipmentHandler,
  await mockUnassignBoxesFromShipmentHandler,
  await mockAllOrganisationsAndBasesHandler,
  await mockAllBasesOfCurrentOrgHandler,
  await mockShipmentsHandler,
  await mockShipmentByIdHandler,
  await mockTransferAgreementsHandler,
  await mockAllAcceptedTransferAgreementsHandler,
  await mockCreateShipmentHandler,
  mockMoveBoxesHandler,
  mockAssignTagsHandler,
];
