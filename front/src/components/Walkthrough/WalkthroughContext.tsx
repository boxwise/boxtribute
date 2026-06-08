import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PathId } from "./paths/types";

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

  // --- LAZY INITIALIZATION TRICK ---
  // We preload the state once based on the userId. If userId is a key dependency,
  // we add `key={userId}` to the Provider wrapper below to naturally re-run these.
  const initialState = useMemo(() => loadState(userId), [userId]);

  const [isWalkthroughActive, setIsWalkthroughActive] = useState(
    () => !initialState.hasSeenWelcome,
  );
  const [currentStep, setCurrentStep] = useState<WalkthroughStep>("welcome");
  const [activePath, setActivePath] = useState<PathId | null>(null);

  const [completedPaths, setCompletedPaths] = useState<Set<PathId>>(
    () => new Set(initialState.completedPaths),
  );

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
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });
  }, [userId]);

  const goToPathSelection = useCallback(() => {
    setCurrentStep("pathSelection");
    const state = loadState(userId);
    saveState(userId, { ...state, hasSeenWelcome: true });
  }, [userId]);

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

  return (
    // KEY TRICK: If the Auth0 userId changes (e.g. logging out and logging into a different account),
    // changing the key forces React to tear down this provider tree and completely re-initialize
    // the state lazily from the new user's localStorage record.
    <WalkthroughContext.Provider key={userId} value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  return useContext(WalkthroughContext);
}
