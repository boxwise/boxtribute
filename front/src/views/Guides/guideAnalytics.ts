declare let heap: { track: (name: string, event: Record<string, string | number>) => void };

const getHeap = () => {
  if (typeof heap !== "undefined") {
    return heap;
  }
  return {
    track: (name: string, event: Record<string, string | number>) => {
      console.log(`Tracked ${name}, event: ${JSON.stringify(event)}`);
    },
  };
};

export const trackGuideStarted = (guideSlug: string, device: "desktop" | "mobile") => {
  getHeap().track("Guide Started", { guideSlug, device });
};

export const trackGuideStepViewed = (
  guideSlug: string,
  stepNumber: number,
  totalSteps: number,
  device: "desktop" | "mobile",
) => {
  getHeap().track("Guide Step Viewed", { guideSlug, stepNumber, totalSteps, device });
};

export const trackGuideCompleted = (guideSlug: string, device: "desktop" | "mobile") => {
  getHeap().track("Guide Completed", { guideSlug, device });
};

export const trackGuideAbandoned = (
  guideSlug: string,
  atStep: number,
  totalSteps: number,
  device: "desktop" | "mobile",
) => {
  getHeap().track("Guide Abandoned", { guideSlug, atStep, totalSteps, device });
};
