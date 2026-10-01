import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { JWT_ROLE } from "utils/constants";
import { isCoordinatorOrAbove } from "../roles";

type MobileWalkthroughStep = "idle" | "welcome" | "instruction" | "done";

interface MobileWalkthroughState {
  hasSeenWelcome: boolean;
}

interface MobileWalkthroughContextType {
  step: MobileWalkthroughStep;
  slideIndex: number;
  closeWalkthrough: () => void;
  startTour: () => void;
  goToSlide: (index: number) => void;
  finishTour: () => void;
  replayTour: () => void;
  isCoordinator: boolean;
}

const noop = () => {};

const defaultContext: MobileWalkthroughContextType = {
  step: "idle",
  slideIndex: 0,
  closeWalkthrough: noop,
  startTour: noop,
  goToSlide: noop,
  finishTour: noop,
  replayTour: noop,
  isCoordinator: false,
};

const MobileWalkthroughContext = createContext<MobileWalkthroughContextType>(defaultContext);

function storageKey(userId: string) {
  return `boxtribute_mobile_walkthrough_${userId}`;
}

function loadState(userId: string): MobileWalkthroughState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as MobileWalkthroughState;
  } catch {
    // ignore
  }
  return { hasSeenWelcome: false };
}

function saveState(userId: string, state: MobileWalkthroughState) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function MobileWalkthroughProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth0();
  const userId = user?.sub ?? "anonymous";
  const roles: string[] = user?.[JWT_ROLE] ?? [];
  const isCoordinator = isCoordinatorOrAbove(roles);

  // Initialize state lazily based on local storage
  const [step, setStep] = useState<MobileWalkthroughStep>(() => {
    const state = loadState(userId);
    return state.hasSeenWelcome ? "idle" : "welcome";
  });

  const [slideIndex, setSlideIndex] = useState(0);

  const markSeen = useCallback(() => {
    saveState(userId, { hasSeenWelcome: true });
  }, [userId]);

  const closeWalkthrough = useCallback(() => {
    setStep("idle");
    markSeen();
  }, [markSeen]);

  const startTour = useCallback(() => {
    setSlideIndex(0);
    setStep("instruction");
    markSeen();
  }, [markSeen]);

  const goToSlide = useCallback((index: number) => {
    setSlideIndex(index);
  }, []);

  const finishTour = useCallback(() => {
    setStep("done");
  }, []);

  const replayTour = useCallback(() => {
    setSlideIndex(0);
    setStep("instruction");
  }, []);

  const value = useMemo(
    () => ({
      step,
      slideIndex,
      closeWalkthrough,
      startTour,
      goToSlide,
      finishTour,
      replayTour,
      isCoordinator,
    }),
    [
      step,
      slideIndex,
      closeWalkthrough,
      startTour,
      goToSlide,
      finishTour,
      replayTour,
      isCoordinator,
    ],
  );

  return (
    <MobileWalkthroughContext.Provider value={value}>{children}</MobileWalkthroughContext.Provider>
  );
}

export function useMobileWalkthrough() {
  return useContext(MobileWalkthroughContext);
}
