import MobileWelcomeScreen from "./MobileWelcomeScreen";
import MobileInstructionScreen from "./MobileInstructionScreen";
import MobileFinalScreen from "./MobileFinalScreen";

/** Composes all mobile walkthrough screens. Only visible ones render. */
function MobileWalkthrough() {
  return (
    <>
      <MobileWelcomeScreen />
      <MobileInstructionScreen />
      <MobileFinalScreen />
    </>
  );
}

export default MobileWalkthrough;
