import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { DistributionEventDetails } from "views/Distributions/types";

export interface DistroEventsCalendarProps {
  distributionEvents: DistributionEventDetails[];
  onClickOnDistroEvent: (distroEventId: string) => void;
}

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DistroEventsCalendarContainer = ({
  distributionEvents: distroEvents,
  onClickOnDistroEvent,
}: DistroEventsCalendarProps) => {
  const events = distroEvents.map((distroEvent) => {
    return {
      id: distroEvent.id,
      title: `${distroEvent.name} (${distroEvent.distributionSpot.name})[${distroEvent.state}]`,
      start: distroEvent.plannedStartDateTime,
      end: distroEvent.plannedEndDateTime,
    };
  });

  return (
    <Calendar
      localizer={localizer}
      defaultDate={new Date()}
      defaultView="month"
      events={events}
      style={{ height: "100vh" }}
      onSelectEvent={({ id: eventId }) => onClickOnDistroEvent(eventId)}
    />
  );
};
export default DistroEventsCalendarContainer;
