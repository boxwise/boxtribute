import { setupWorker } from 'msw/browser'
import { mockActionOptionsForBoxesViewHandler, mockBeneficiaryDemographicsHandler, mockBoxByLabelIdentifierHandler, mockBoxesForBoxesViewHandler, mockCreatedBoxesHandler, mockMovedBoxesHandler, mockOrganisationsAndBasesQueryHandler, mockStockOverviewHandler, mockUpdateLocationOfBoxHandler, mockUpdateStateHandler } from '../tests/mswHandlers'

const handler = [
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

export const worker = setupWorker(...handler);