import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Box, Button, Flex, IconButton, Progress, Text } from "@chakra-ui/react";
import { BiChevronLeft } from "react-icons/bi";
import { useWalkthrough } from "./WalkthroughContext";
import { nameToNavId } from "components/HeaderMenu/navId";
import path1 from "./paths/path1";
import path2 from "./paths/path2";
import path3 from "./paths/path3";
import { WalkthroughPath, PathId, TourStep } from "./paths/types";
import { useVisiblePaths } from "./useVisiblePaths";

export const PATHS: Record<string, WalkthroughPath> = {
  path1,
  path2,
  path3,
};

// Returns a Joyride `before` hook that expands the named accordion group so
// the target element is visible when Joyride positions the tooltip.
// Chakra UI's Collapse sets `display: none` on collapsed panels after the
// exit animation, which causes Joyride to report TARGET_NOT_FOUND.
//
// Chakra v2 generates the AccordionButton's id as `accordion-button-{AccordionItem id}`,
// so we target it directly rather than querying inside the AccordionItem element.
function makeExpandGroupHook(groupName: string): BeforeHook {
  // eslint-disable-next-line no-unused-vars
  return async (_data: TourData) => {
    const groupId = nameToNavId(groupName);
    const btn = document.getElementById(`accordion-button-${groupId}`) as HTMLButtonElement | null;
    if (!btn || btn.getAttribute("aria-expanded") === "true") return;
    btn.click();
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
  };
}

// Build the Joyride step array from our tour-step definitions.
// Steps whose target is not present in the DOM at all (e.g. an entire nav group
// hidden by permission/beta filtering) are silently skipped so the tour doesn't
// get stuck trying to highlight elements that can never be found.
// When a step has a `contentNote`, it is appended in bold after the main content.
function buildJoyrideSteps(tourSteps: TourStep[]): Step[] {
  return tourSteps
    .filter((s) => document.querySelector(s.target) !== null)
    .map((s) => ({
      target: s.target,
      title: s.title,
      content: s.contentNote ? (
        <>
          {s.content} <strong>{s.contentNote}</strong>
        </>
      ) : (
        s.content
      ),
      placement: "right" as const,
      ...(s.expandMenuGroup ? { before: makeExpandGroupHook(s.expandMenuGroup) } : {}),
    }));
}

interface CustomTooltipProps extends TooltipRenderProps {
  totalSteps: number;
  isLastPath: boolean;
  activePath: PathId;
}

function CustomTooltip({
  index,
  step,
  primaryProps,
  backProps,
  tooltipProps,
  totalSteps,
  isLastPath,
  activePath,
  isLastStep,
}: CustomTooltipProps) {
  const progress = ((index + 1) / totalSteps) * 100;
  let buttonLabel: ReactNode;
  let idSuffix: string;
  if (isLastStep && isLastPath) {
    buttonLabel = "Onboarding completed!";
    idSuffix = "completed-onboarding";
  } else if (isLastStep) {
    buttonLabel = (
      <>
        Path completed!
        <br />
        Explore another one
      </>
    );
    idSuffix = `${activePath}-completed`;
  } else {
    buttonLabel = "Next";
    idSuffix = `${activePath}-next-on-${index}`;
  }

  return (
    <Box {...tooltipProps} bg="white" borderRadius="md" boxShadow="lg" p={4} maxW={320} minW={260}>
      {/* Step title + counter */}
      <Flex justify="space-between" align="center" mb={2}>
        {index > 0 && (
          <IconButton
            {...backProps}
            id={`desktop-walkthrough-${activePath}-prev-on-${index}`}
            p={0}
            minW="auto"
            ml={-2}
            _hover={{ bg: "transparent" }}
            variant="ghost"
            icon={<BiChevronLeft size="2em" />}
          />
        )}
        <Text fontWeight="bold" flex={1} pr={2}>
          {step.title as string}
        </Text>
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {index + 1}/{totalSteps}
        </Text>
      </Flex>

      {/* Step content (may include a bold contentNote appended inline) */}
      <Text fontSize="sm" mb={4}>
        {step.content}
      </Text>

      <Progress value={progress} size="sm" colorScheme="green" mb={4} borderRadius="0" />
      <Button
        id={`desktop-walkthrough-${idSuffix}`}
        {...primaryProps}
        size="sm"
        colorScheme="blue"
        width="full"
        height="auto"
        whiteSpace="normal"
        py={2}
        title={undefined}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}

function TourOverlay() {
  const {
    completedPaths,
    isWalkthroughActive,
    currentStep,
    activePath,
    completePath,
    backToPathSelection,
  } = useWalkthrough();
  const visiblePaths = useVisiblePaths();
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

  const isLastPath = useMemo(
    () =>
      activePath != null &&
      visiblePaths.filter((p) => p.id !== activePath).every((p) => completedPaths.has(p.id)),
    [activePath, visiblePaths, completedPaths],
  );

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
          activePath={activePath}
          isLastPath={isLastPath}
          totalSteps={totalSteps}
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
