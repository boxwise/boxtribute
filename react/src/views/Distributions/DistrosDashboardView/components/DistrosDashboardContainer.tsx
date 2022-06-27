import "react-big-calendar/lib/css/react-big-calendar.css";
import DistroEventsCalendarContainer from "./DistroEventsCalendar/DistroEventsCalendar";

const DistrosDashboardContainer = () => {
  return (
    <DistroEventsCalendarContainer
      distroEvents={[]}
      onClickOnDistroEvent={function (distroEventId: string): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
};
export default DistrosDashboardContainer;
