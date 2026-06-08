import WelcomeScreen from "./WelcomeScreen";
import InstructionScreen from "./InstructionScreen";
import FinalScreen from "./FinalScreen";

/** Composes all mobile walkthrough screens. Only visible ones render. */
function MobileWalkthrough() {
  return (
    <>
      <WelcomeScreen />
      <InstructionScreen />
      <FinalScreen />
    </>
  );
}

export default MobileWalkthrough;
