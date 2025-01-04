import { setupWorker } from "msw/browser";
import { handlers } from "../tests/mswHandlers";

export const worker = setupWorker(...handlers);
