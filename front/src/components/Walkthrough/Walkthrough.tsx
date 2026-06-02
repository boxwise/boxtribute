import WelcomeModal from "./WelcomeModal";
import PathSelectionModal from "./PathSelectionModal";
import TourOverlay from "./TourOverlay";
import WalkthroughNav from "./WalkthroughNav";
import PathIndicator from "./PathIndicator";

// Composes walkthrough UI pieces.
function Walkthrough() {
  return (
    <>
      <WelcomeModal />
      <PathSelectionModal />
      <TourOverlay />
      <WalkthroughNav />
      <PathIndicator />
    </>
  );
}

export default Walkthrough;
