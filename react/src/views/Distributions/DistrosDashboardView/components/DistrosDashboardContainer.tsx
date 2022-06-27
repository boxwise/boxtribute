import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { DistributionEventState } from "types/generated/graphql";
import DistroEventsCalendarContainer from "./DistroEventsCalendar";

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
