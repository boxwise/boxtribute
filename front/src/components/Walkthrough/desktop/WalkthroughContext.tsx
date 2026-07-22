import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
  const visiblePaths = useVisiblePaths();

  const [prevUserId, setPrevUserId] = useState(userId);

  const [isWalkthroughActive, setIsWalkthroughActive] = useState(() => {
    const state = loadState(userId);
    return !state.hasSeenWelcome;
  });

  const [currentStep, setCurrentStep] = useState<WalkthroughStep>(() => {
    const state = loadState(userId);
    return !state.hasSeenWelcome ? "welcome" : "pathSelection";
  });

  const [completedPaths, setCompletedPaths] = useState<Set<PathId>>(() => {
    const state = loadState(userId);
    return new Set(state.completedPaths);
  });

  const [activePath, setActivePath] = useState<PathId | null>(null);

  if (userId !== prevUserId) {
    setPrevUserId(userId);

    const state = loadState(userId);
    setCompletedPaths(new Set(state.completedPaths));
    setIsWalkthroughActive(!state.hasSeenWelcome);
    setCurrentStep(!state.hasSeenWelcome ? "welcome" : "pathSelection");
    setActivePath(null);
  }

  const persistCompletedPaths = useCallback(
    (paths: Set<PathId>) => {
      const state = loadState(userId);
      saveState(userId, { ...state, completedPaths: Array.from(paths) });
    },
    [userId],
  );

  const goToPathSelection = useCallback(() => {
    setIsWalkthroughActive(true);
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });

    if (visiblePaths.length === 1) {
      setActivePath(visiblePaths[0].id);
      setCurrentStep("tour");
      return;
    }

    setCurrentStep("pathSelection");
  }, [userId, visiblePaths]);

  const closeWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setActivePath(null);
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
