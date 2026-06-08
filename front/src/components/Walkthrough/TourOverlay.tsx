import { useCallback, useMemo, useState } from "react";
import {
  Joyride,
  BeforeHook,
  EventData,
  EVENTS,
  ACTIONS,
  STATUS,
  Step,
  TooltipRenderProps,
} from "react-joyride";
import { Box, Button, Flex, Progress, Text } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";
import { nameToNavId } from "components/HeaderMenu/navId";
import path1 from "./paths/path1";
import path2 from "./paths/path2";
import path3 from "./paths/path3";
import { WalkthroughPath, TourStep } from "./paths/types";

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
  return async () => {
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
      {/* Step title + counter */}
      <Flex justify="space-between" align="flex-start" mb={2}>
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

      <Progress value={progress} size="sm" colorScheme="blue" mb={4} borderRadius="full" />
      <Button {...primaryProps} size="sm" colorScheme="blue" width="full" title={undefined}>
        {isLastStep ? "Path completed! Explore another one" : "Next"}
      </Button>
    </Box>
  );
}

function TourOverlay() {
  const { isWalkthroughActive, currentStep, activePath, completePath, backToPathSelection } =
    useWalkthrough();

  // 1. Keep track of the index, but we don't need a separate 'run' state anymore.
  const [stepIndex, setStepIndex] = useState(0);

  const isActive = isWalkthroughActive && currentStep === "tour" && activePath != null;
  const pathDef = activePath ? PATHS[activePath] : null;

  const steps = useMemo(() => (pathDef ? buildJoyrideSteps(pathDef.steps) : []), [pathDef]);
  const totalSteps = steps.length;

  // 2. COMPUTE 'run' dynamically.
  // Joyride should only run if the tour is active and we actually have steps to show.
  const run = isActive && steps.length > 0;

  // 3. Reset the step index when the path changes, but do it safely inside the handler
  // or handle it implicitly by using a `key` on the Joyride component (see below).

  const handleEvent = useCallback(
    (data: EventData) => {
      const { status, action, index, type } = data;

      // When the tour finishes or is skipped, wrap it up
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        if (activePath) completePath(activePath);
        setStepIndex(0); // Reset cleanly on completion
        return;
      }

      // Handle missing targets
      if (type === EVENTS.TARGET_NOT_FOUND) {
        const nextIndex = index + 1;
        if (nextIndex < steps.length) {
          setStepIndex(nextIndex);
        } else {
          backToPathSelection();
          setStepIndex(0);
        }
        return;
      }

      // Progressing through steps
      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.NEXT) {
          setStepIndex(index + 1);
        } else if (action === ACTIONS.PREV) {
          setStepIndex(Math.max(0, index - 1));
        } else if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
          backToPathSelection();
          setStepIndex(0);
        }
      }
    },
    [activePath, completePath, backToPathSelection, steps.length],
  );

  if (!isActive || !pathDef || steps.length === 0) return null;

  return (
    <Joyride
      // KEY TRICK: Changing the key forces Joyride to completely recreate itself
      // whenever the active path changes, resetting its internal state automatically
      // without needing a complex useEffect.
      key={activePath}
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
        overlayClickAction: false,
        dismissKeyAction: false,
        buttons: ["primary"],
        skipBeacon: true,
        targetWaitTimeout: 2000, // This replaces your 100ms setTimeout!
      }}
    />
  );
}

export default TourOverlay;
