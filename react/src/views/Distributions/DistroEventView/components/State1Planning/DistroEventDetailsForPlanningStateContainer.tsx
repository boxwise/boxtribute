import DistroEventDetailsForPlanningState, { DistroEventDetailsDataForPlanningState } from "./DistroEventDetailsForPlanningState";


interface DistroEventDetailsForPlanningStateContainerProps {
  distroEventDetailsDataForPlanningState: DistroEventDetailsDataForPlanningState;
}

const DistroEventDetailsForPlanningStateContainer = ({
  distroEventDetailsDataForPlanningState
}: DistroEventDetailsForPlanningStateContainerProps ) => {
  return (
    <DistroEventDetailsForPlanningState
    distroEventDetailsData={distroEventDetailsDataForPlanningState}
    onAddItemsClick={() => {}}
    onCopyPackingListFromPreviousEventsClick={() => {}}
    onRemoveItemFromPackingListClick={() => {}}
    onEditItemOnPackingListClick={() => {}}
    />
  );
};

export default DistroEventDetailsForPlanningStateContainer;
