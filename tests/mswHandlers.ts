import { graphql, GraphQLResponseResolver, HttpResponse, RequestHandlerOptions } from 'msw'
import { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { devCoordinator } from './fixtures';
import { worker } from "../front/browser"
import { ORGANISATION_AND_BASES_QUERY, BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "../front/src/queries/queries"
import { BOXES_FOR_BOXESVIEW_QUERY, ACTION_OPTIONS_FOR_BOXESVIEW_QUERY } from "../front/src/views/Boxes/BoxesView"
import { UPDATE_BOX_MUTATION, UPDATE_STATE_IN_BOX_MUTATION } from "../front/src/views/Box/BoxView"
import { CREATED_BOXES_QUERY } from '../shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesDataContainer';
import { MOVED_BOXES_QUERY } from '../shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesDataContainer';
import { STOCK_QUERY } from '../shared-components/statviz/components/visualizations/stock/StockDataContainer';
import { DEMOGRAPHIC_QUERY } from '../shared-components/statviz/components/visualizations/demographic/DemographicDataContainer';

function baseQueryHandler<T extends TadaDocumentNode>(
  /** For type inference only. */
  _operation: T,
  /** Operation name inside the GraphQL string. */
  operationName: string,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  return graphql.query<ResultOf<T>, VariablesOf<T>>(
    operationName,
    resolver,
    options
  )
}

function baseMutationHandler<T extends TadaDocumentNode>(
  /** For type inference only. */
  _operation: T,
  /** Operation name inside the GraphQL string. */
  operationName: string,
  /** MSW resolver, with result and variable types inferred from the operation. */
  resolver: GraphQLResponseResolver<ResultOf<T>, VariablesOf<T>>,
  /** MSW handler options. */
  options?: RequestHandlerOptions
) {
  return graphql.mutation<ResultOf<T>, VariablesOf<T>>(
    operationName,
    resolver,
    options
  )
}

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

  return HttpResponse.json(devCoordinator.BoxesForBoxesViewQuery.baseId[baseId]);
});

const mockActionOptionsForBoxesViewHandler = baseQueryHandler(ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, "ActionOptionsForBoxesView", ({ variables }) => {
  const { baseId } = variables;

  return HttpResponse.json(devCoordinator.ActionOptionsForBoxesView.baseId[baseId]);
});

const mockBoxByLabelIdentifierHandler = baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", ({ variables }) => {
  const { labelIdentifier } = variables;

  devCoordinator.BoxByLabelIdentifier.data.box.labelIdentifier = labelIdentifier;

  // @ts-expect-error
  return HttpResponse.json(devCoordinator.BoxByLabelIdentifier);
})

const mockUpdateLocationOfBoxHandler = baseMutationHandler(UPDATE_BOX_MUTATION, "UpdateLocationOfBox", ({ variables }) => {
  const { boxLabelIdentifier, newLocationId } = variables;

  const override = { ...devCoordinator };

  override.BoxByLabelIdentifier.data.box.labelIdentifier = boxLabelIdentifier;
  override.BoxByLabelIdentifier.data.box.location.id = "" + newLocationId;

  // @ts-expect-error
  worker.use(baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () => HttpResponse.json(override.BoxByLabelIdentifier)));

  // @ts-expect-error
  return HttpResponse.json(devCoordinator.UpdateLocationOfBox);
})

const mockUpdateStateHandler = baseMutationHandler(UPDATE_STATE_IN_BOX_MUTATION, "UpdateState", ({ variables }) => {
  const { boxLabelIdentifier, newState } = variables;

  const override = { ...devCoordinator };

  override.BoxByLabelIdentifier.data.box.labelIdentifier = boxLabelIdentifier;
  override.BoxByLabelIdentifier.data.box.state = newState;

  // @ts-expect-error
  worker.use(baseQueryHandler(BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY, "BoxByLabelIdentifier", () => HttpResponse.json(override.BoxByLabelIdentifier)));

  // @ts-expect-error
  return HttpResponse.json(devCoordinator.UpdateState);
})

export const handlers = [
  mockOrganisationsAndBasesQueryHandler,
  mockCreatedBoxesHandler,
  mockMovedBoxesHandler,
  mockBeneficiaryDemographicsHandler,
  mockStockOverviewHandler,
  mockBoxesForBoxesViewHandler,
  mockActionOptionsForBoxesViewHandler,
  mockBoxByLabelIdentifierHandler,
  mockUpdateLocationOfBoxHandler,
  mockUpdateStateHandler
];