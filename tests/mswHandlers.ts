import { delay, graphql, GraphQLResponseResolver, HttpResponse, RequestHandlerOptions } from 'msw'
import { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { devCoordinator } from './fixtures';

import { worker } from "../front/browser"
import { ORGANISATION_AND_BASES_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "../front/src/queries/queries"
import { BOXES_FOR_BOXESVIEW_QUERY, ACTION_OPTIONS_FOR_BOXESVIEW_QUERY } from "../front/src/views/Boxes/BoxesView"
import { UPDATE_BOX_MUTATION, UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, UPDATE_STATE_IN_BOX_MUTATION } from "../front/src/views/Box/BoxView"
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, UPDATE_CONTENT_OF_BOX_MUTATION } from '../front/src/views/BoxEdit/BoxEditView';
import { CREATED_BOXES_QUERY } from '../shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer';
import { MOVED_BOXES_QUERY } from '../shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer';
import { STOCK_QUERY } from '../shared-components/statviz/components/visualizations/stock/StockDataContainer';
import { DEMOGRAPHIC_QUERY } from '../shared-components/statviz/components/visualizations/demographic/DemographicDataContainer';

// Utilities

async function baseQueryHandler<T extends TadaDocumentNode>(
  /** For type inference only. */
  _operation: T,
  /** Operation name inside the GraphQL string. */
  operationName: string,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  await delay(100);

  return graphql.query<ResultOf<T>, VariablesOf<T>>(
    operationName,
    resolver,
    options
  )
}

async function baseMutationHandler<T extends TadaDocumentNode>(
  /** For type inference only. */
  _operation: T,
  /** Operation name inside the GraphQL string. */
  operationName: string,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  await delay(100);

  return graphql.mutation<ResultOf<T>, VariablesOf<T>>(
    operationName,
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

const mockCreatedBoxesHandler = baseQueryHandler(CREATED_BOXES_QUERY, "createdBoxes", () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.createdBoxes);
});

const mockMovedBoxesHandler = baseQueryHandler(MOVED_BOXES_QUERY, "movedBoxes", () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.movedBoxes);
});

const mockBeneficiaryDemographicsHandler = baseQueryHandler(DEMOGRAPHIC_QUERY, "BeneficiaryDemographics", () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.BeneficiaryDemographics);
});

const mockStockOverviewHandler = baseQueryHandler(STOCK_QUERY, "stockOverview", () => {
  // @ts-expect-error
  return HttpResponse.json(devCoordinator.stockOverview);
});

const mockOrganisationsAndBasesQueryHandler = baseQueryHandler(ORGANISATION_AND_BASES_QUERY, "OrganisationAndBases", () => {
  return HttpResponse.json(devCoordinator.OrganisationAndBases);
});

const mockBoxesForBoxesViewHandler = baseQueryHandler(BOXES_FOR_BOXESVIEW_QUERY, "BoxesForBoxesView", ({ variables }) => {
  const { baseId } = variables;

  worker.resetHandlers();
  // TODO: update box in elements?

  return HttpResponse.json(devCoordinator.BoxesForBoxesViewQuery.baseId[baseId]);
});

const mockActionOptionsForBoxesViewHandler = baseQueryHandler(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, "ActionOptionsForBoxesView", ({ variables }) => {
  const { baseId } = variables;

  return HttpResponse.json(devCoordinator.ActionOptionsForBoxesView.baseId[baseId]);
});

const mockBoxByLabelIdentifierHandler = baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", ({ variables }) => {
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

const mockUpdateLocationOfBoxHandler = baseMutationHandler(UPDATE_BOX_MUTATION, "UpdateLocationOfBox", async ({ variables }) => {
  const { boxLabelIdentifier, newLocationId } = variables;

  const box = findBox(boxLabelIdentifier);

  box.location.id = "" + newLocationId;

  const newLocationName = boxByLabelIdentifierLocation.base.locations.find(location => location.id === "" + newLocationId)!.name;

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () =>
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

const mockUpdateStateHandler = baseMutationHandler(UPDATE_STATE_IN_BOX_MUTATION, "UpdateState", async ({ variables }) => {
  const { boxLabelIdentifier, newState } = variables;

  const box = findBox(boxLabelIdentifier);

  box.state = newState ? newState : "InStock";

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () =>
    HttpResponse.json({
      data: {
        // @ts-expect-error
        box: { ...box, location: { ...box.location, ...boxByLabelIdentifierLocation, defaultBoxState: "InStock" }, history: boxByLabelIdentifierHistory },
        // @ts-expect-error
        shipments: boxByLabelIdentifierShipments
      }
    }))
  );

  // @ts-expect-error
  return HttpResponse.json({ data: { updateBox: box } });
})

const mockUpdateNumberOfItemsHandler = baseMutationHandler(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, "UpdateNumberOfItems", async ({ variables }) => {
  const { boxLabelIdentifier, numberOfItems } = variables;

  const box = findBox(boxLabelIdentifier);

  box.numberOfItems = numberOfItems;

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () =>
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

const mockBoxByLabelIdentifierAndAllProductsWithBaseIdHandler = baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY, "BoxByLabelIdentifierAndAllProductsWithBaseId", ({ variables }) => {
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

const mockUpdateContentOfBoxHandler = baseMutationHandler(UPDATE_CONTENT_OF_BOX_MUTATION, "UpdateContentOfBox", async ({ variables }) => {
  const { boxLabelIdentifier, locationId, numberOfItems, productId, sizeId, comment, tagIds } = variables;

  const box = findBox(boxLabelIdentifier);

  box.comment = comment!;
  box.numberOfItems = numberOfItems;
  box.product = findProduct("" + productId);
  box.size = findProduct("" + productId).sizeRange.sizes.find(s => s.id === "" + sizeId)!;
  box.tags = findTags(tagIds!);

  worker.use(await baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () =>
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

// Exported handlers to be consumed by MSW
export const handlers = [
  await mockOrganisationsAndBasesQueryHandler,
  await mockCreatedBoxesHandler,
  await mockMovedBoxesHandler,
  await mockBeneficiaryDemographicsHandler,
  await mockStockOverviewHandler,
  await mockBoxesForBoxesViewHandler,
  await mockActionOptionsForBoxesViewHandler,
  await mockBoxByLabelIdentifierHandler,
  await mockUpdateLocationOfBoxHandler,
  await mockUpdateStateHandler,
  await mockUpdateNumberOfItemsHandler,
  await mockBoxByLabelIdentifierAndAllProductsWithBaseIdHandler,
  await mockUpdateContentOfBoxHandler,
];
