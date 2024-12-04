import { setupWorker } from 'msw/browser'
import { mockActionOptionsForBoxesViewHandler, mockBoxesForBoxesViewHandler, mockOrganisationsAndBasesQueryHandler } from '../graphql/mswHandlers'

const handler = [
    mockOrganisationsAndBasesQueryHandler,
    mockBoxesForBoxesViewHandler,
    mockActionOptionsForBoxesViewHandler
]

export const worker = setupWorker(...handler)