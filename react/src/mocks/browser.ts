import { setupWorker, SetupWorkerApi } from 'msw'
import { handlers } from './handlers'
// This configures a Service Worker with the given request handlers.
export const worker: SetupWorkerApi = setupWorker(...handlers)
