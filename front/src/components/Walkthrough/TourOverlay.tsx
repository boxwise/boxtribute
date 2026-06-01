import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Joyride,
  BeforeHook,
  EventData,
  EVENTS,
  ACTIONS,
  STATUS,
  Step,
  TooltipRenderProps,
  TourData,
} from "react-joyride";
import { Box, Button, Flex, Progress, Text } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";
import path1 from "./paths/path1";
import path2 from "./paths/path2";
import path3 from "./paths/path3";
import { WalkthroughPath, TourStep } from "./paths/types";

const PATHS: Record<string, WalkthroughPath> = {
  path1,
  path2,
  path3,
};

// Mirrors the nameToNavId function in MenuDesktop so we can locate accordion items
function nameToNavId(name: string): string {
  return `nav-${name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;
}

// Returns true when the element and every ancestor up to <body> are visible
// (no display:none or visibility:hidden in the parent chain).
function isDomVisible(el: Element): boolean {
  let node: Element | null = el;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const { display, visibility } = getComputedStyle(node);
      if (display === "none" || visibility === "hidden") return false;
    }
    node = node.parentElement;
  }
  return true;
}

// Returns a Joyride `before` hook that expands the named accordion group so
// the target element is visible when Joyride positions the tooltip.
// Chakra UI's Collapse sets `display: none` on collapsed panels after the
// exit animation, which causes Joyride to report TARGET_NOT_FOUND.
// We poll for actual visibility instead of using a fixed timeout so the hook
// resolves as soon as the animation completes (or gives up after 1500 ms).
function makeExpandGroupHook(groupName: string, target: string): BeforeHook {
  // eslint-disable-next-line no-unused-vars
  return async (_data: TourData) => {
    const groupId = nameToNavId(groupName);
    const groupEl = document.getElementById(groupId);
    if (!groupEl) return;
    const btn = groupEl.querySelector<HTMLButtonElement>("button[aria-expanded]");
    if (!btn || btn.getAttribute("aria-expanded") === "true") return;
    btn.click();
    // Poll until the target element becomes visible (or time out after 1500 ms).
    const MAX_WAIT_MS = 1500;
    const POLL_INTERVAL_MS = 50;
    await new Promise<void>((resolve) => {
      let elapsed = 0;
      const id = setInterval(() => {
        elapsed += POLL_INTERVAL_MS;
        const el = document.querySelector(target);
        if ((el && isDomVisible(el)) || elapsed >= MAX_WAIT_MS) {
          clearInterval(id);
          resolve();
        }
      }, POLL_INTERVAL_MS);
    });
  };
}

// Build the Joyride step array from our tour-step definitions.
// Steps whose target is not present in the DOM at all (e.g. an entire nav group
// hidden by permission/beta filtering) are silently skipped so the tour doesn't
// get stuck trying to highlight elements that can never be found.
function buildJoyrideSteps(tourSteps: TourStep[]): Step[] {
  return tourSteps
    .filter((s) => document.querySelector(s.target) !== null)
    .map((s) => ({
      target: s.target,
      title: s.title,
      content: s.content,
      placement: "right" as const,
      ...(s.expandMenuGroup ? { before: makeExpandGroupHook(s.expandMenuGroup, s.target) } : {}),
    }));
}

interface CustomTooltipProps extends TooltipRenderProps {
  totalSteps: number;
  isLastStep: boolean;
}

function CustomTooltip({
  index,
  step,
  primaryProps,
  tooltipProps,
  totalSteps,
  isLastStep,
}: CustomTooltipProps) {
  const progress = ((index + 1) / totalSteps) * 100;
  return (
    <Box {...tooltipProps} bg="white" borderRadius="md" boxShadow="lg" p={4} maxW={320} minW={260}>
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Text fontWeight="bold" flex={1} pr={2}>
          {step.title as string}
        </Text>
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {index + 1}/{totalSteps}
        </Text>
      </Flex>
      <Text fontSize="sm" mb={4}>
        {step.content as string}
      </Text>
      <Progress value={progress} size="sm" colorScheme="blue" mb={4} borderRadius="full" />
      <Button {...primaryProps} size="sm" colorScheme="blue" width="full" title={undefined}>
        {isLastStep ? "You are done! Explore another scenario." : "Next"}
      </Button>
    </Box>
  );
}

function TourOverlay() {
  const { isWalkthroughActive, currentStep, activePath, completePath, backToPathSelection } =
    useWalkthrough();
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(false);

  const isActive = isWalkthroughActive && currentStep === "tour" && activePath != null;
  const pathDef = activePath ? PATHS[activePath] : null;
  // Compute the step list once when the path changes so Joyride never receives a
  // new array reference on every render (which would reset its internal state).
  // buildJoyrideSteps also filters out steps whose targets are absent from the DOM.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const steps = useMemo(() => (pathDef ? buildJoyrideSteps(pathDef.steps) : []), [activePath]);
  const totalSteps = steps.length;

  // Reset step index whenever the active path changes
  useEffect(() => {
    if (!isActive) {
      setRun(false);
      return;
    }
    setStepIndex(0);
    // Small delay to allow DOM to settle before joyride starts
    const t = setTimeout(() => setRun(true), 100);
    return () => clearTimeout(t);
  }, [isActive, activePath]);

  const handleEvent = useCallback(
    (data: EventData) => {
      const { status, action, index, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        if (activePath) completePath(activePath);
        return;
      }

      // Handle target not found - skip to next step or go back to path selection
      if (type === EVENTS.TARGET_NOT_FOUND) {
        const nextIndex = index + 1;
        if (nextIndex < steps.length) {
          // Skip to next step if available
          setStepIndex(nextIndex);
        } else {
          // No more steps, go back to path selection
          setRun(false);
          backToPathSelection();
        }
        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.NEXT) {
          setStepIndex(index + 1);
        } else if (action === ACTIONS.PREV) {
          setStepIndex(Math.max(0, index - 1));
        } else if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
          setRun(false);
          backToPathSelection();
        }
      }
    },
    [activePath, completePath, backToPathSelection, steps.length],
  );

  if (!isActive || !pathDef || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleEvent}
      tooltipComponent={(props) => (
        <CustomTooltip
          {...props}
          totalSteps={totalSteps}
          isLastStep={stepIndex === totalSteps - 1}
        />
      )}
      options={{
        overlayColor: "rgba(0,0,0,0.5)",
        zIndex: 10000,
        overlayClickAction: false as const,
        dismissKeyAction: false as const,
        buttons: ["primary"] as const,
        skipBeacon: true,
        targetWaitTimeout: 2000,
      }}
    />
  );
}

export default TourOverlay;
