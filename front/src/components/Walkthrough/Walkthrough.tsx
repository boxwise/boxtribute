import WelcomeModal from "./WelcomeModal";
import PathSelectionModal from "./PathSelectionModal";
import TourOverlay from "./TourOverlay";
import SkipButton from "./SkipButton";
import PathIndicator from "./PathIndicator";

function Walkthrough() {
  return (
    <>
      <WelcomeModal />
      <PathSelectionModal />
      <TourOverlay />
      <SkipButton />
      <PathIndicator />
    </>
  );
}

export default Walkthrough;
