import { useCallback, useEffect, useState } from "react";
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

// Returns a Joyride `before` hook that expands the named accordion group so
// the target element is visible when Joyride positions the tooltip.
// Chakra UI's Collapse sets `display: none` on collapsed panels after the
// exit animation, which causes Joyride to report TARGET_NOT_FOUND.
function makeExpandGroupHook(groupName: string): BeforeHook {
  return async () => {
    const groupEl = document.getElementById(nameToNavId(groupName));
    if (!groupEl) return;
    const btn = groupEl.querySelector<HTMLButtonElement>("button[aria-expanded]");
    if (!btn || btn.getAttribute("aria-expanded") === "true") return;
    btn.click();
    // Wait for Chakra UI's accordion open animation (~300 ms) to finish
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
  };
}

function buildJoyrideSteps(tourSteps: TourStep[]): Step[] {
  return tourSteps.map((s) => ({
    target: s.target,
    title: s.title,
    content: s.content,
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
  const steps = pathDef ? buildJoyrideSteps(pathDef.steps) : [];
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
    [activePath, completePath, backToPathSelection],
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
        overlayClickAction: false,
        dismissKeyAction: false,
        buttons: ["primary"],
      }}
    />
  );
}

export default TourOverlay;
