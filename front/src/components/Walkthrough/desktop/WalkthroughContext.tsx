import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PathId } from "./paths/types";
import { useVisiblePaths } from "./useVisiblePaths";

type WalkthroughStep = "welcome" | "pathSelection" | "tour";

interface WalkthroughState {
  completedPaths: PathId[];
  hasSeenWelcome: boolean;
}

interface WalkthroughContextType {
  isWalkthroughActive: boolean;
  currentStep: WalkthroughStep;
  activePath: PathId | null;
  completedPaths: Set<PathId>;
  openWalkthrough: () => void;
  closeWalkthrough: () => void;
  goToPathSelection: () => void;
  startPath: (pathId: PathId) => void;
  completePath: (pathId: PathId) => void;
  backToPathSelection: () => void;
  replayPath: (pathId: PathId) => void;
}

const noop = () => {};

const defaultContext: WalkthroughContextType = {
  isWalkthroughActive: false,
  currentStep: "welcome",
  activePath: null,
  completedPaths: new Set(),
  openWalkthrough: noop,
  closeWalkthrough: noop,
  goToPathSelection: noop,
  startPath: noop,
  completePath: noop,
  backToPathSelection: noop,
  replayPath: noop,
};

const WalkthroughContext = createContext<WalkthroughContextType>(defaultContext);

function storageKey(userId: string) {
  return `boxtribute_walkthrough_${userId}`;
}

// Management of walkthrough state machine and persistence in localStorage
function loadState(userId: string): WalkthroughState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as WalkthroughState;
  } catch {
    // ignore
  }
  return { completedPaths: [], hasSeenWelcome: false };
}

function saveState(userId: string, state: WalkthroughState) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth0();
  const userId = user?.sub ?? "anonymous";

  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<WalkthroughStep>("welcome");
  const [activePath, setActivePath] = useState<PathId | null>(null);
  const [completedPaths, setCompletedPaths] = useState<Set<PathId>>(new Set());
  const visiblePaths = useVisiblePaths();

  // Load persisted state and auto-show welcome for new users
  useEffect(() => {
    const state = loadState(userId);
    setCompletedPaths(new Set(state.completedPaths));
    if (!state.hasSeenWelcome) {
      setIsWalkthroughActive(true);
      setCurrentStep("welcome");
    }
  }, [userId]);

  const persistCompletedPaths = useCallback(
    (paths: Set<PathId>) => {
      const state = loadState(userId);
      saveState(userId, { ...state, completedPaths: Array.from(paths) });
    },
    [userId],
  );

  const openWalkthrough = useCallback(() => {
    setIsWalkthroughActive(true);
    setCurrentStep("welcome");
    setActivePath(null);
    // Mark welcome as seen
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });
  }, [userId]);

  const goToPathSelection = useCallback(() => {
    setIsWalkthroughActive(true);

    // short-cut to only path
    if (visiblePaths.length === 1) {
      startPath(visiblePaths[0].id);
      return;
    }
    setCurrentStep("pathSelection");
    // Mark welcome as seen
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });
  }, [userId]);

  const closeWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setActivePath(null);
    // Mark welcome as seen when user skips/closes
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });
  }, [userId]);

  const startPath = useCallback((pathId: PathId) => {
    setActivePath(pathId);
    setCurrentStep("tour");
  }, []);

  const completePath = useCallback(
    (pathId: PathId) => {
      setCompletedPaths((prev) => {
        const next = new Set(prev);
        next.add(pathId);
        persistCompletedPaths(next);
        return next;
      });
      setActivePath(null);
      setCurrentStep("pathSelection");
    },
    [persistCompletedPaths],
  );

  const backToPathSelection = useCallback(() => {
    setActivePath(null);
    setCurrentStep("pathSelection");
  }, []);

  const replayPath = useCallback((pathId: PathId) => {
    setActivePath(pathId);
    setCurrentStep("tour");
  }, []);

  const value = useMemo(
    () => ({
      isWalkthroughActive,
      currentStep,
      activePath,
      completedPaths,
      openWalkthrough,
      closeWalkthrough,
      goToPathSelection,
      startPath,
      completePath,
      backToPathSelection,
      replayPath,
    }),
    [
      isWalkthroughActive,
      currentStep,
      activePath,
      completedPaths,
      openWalkthrough,
      closeWalkthrough,
      goToPathSelection,
      startPath,
      completePath,
      backToPathSelection,
      replayPath,
    ],
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough() {
  return useContext(WalkthroughContext);
}
