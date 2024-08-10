import { IDownloadByGraphEvent, IHeap } from "./types";

declare let heap: IHeap;

export const getHeap = (): IHeap => {
  if (typeof heap !== "undefined") {
    return heap;
  }

  return {
    // Note that on production the global heap object is returned
    track: (name, event) => {
      // eslint-disable-next-line no-console
      console.log(`Tracked ${name}, event: ${JSON.stringify(event)}`);
    },
  };
};

export const trackDownloadByGraph = (event: IDownloadByGraphEvent) => {
  getHeap().track("StatViz Download By Graph", event);
};
