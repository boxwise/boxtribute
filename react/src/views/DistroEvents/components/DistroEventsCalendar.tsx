import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";

const localizer = momentLocalizer(moment);

const DistroEventsCalendar = () => {
  const events = [
    {
      start: moment().toDate(),
      end: moment().add(0, "days").toDate(),
      title: "Horgos (River) - Tea and Winter Clothes",
    },
  ];

  return (
    <Calendar
      localizer={localizer}
      defaultDate={new Date()}
      defaultView="month"
      events={events}
      style={{ height: "100vh" }}
      onSelectEvent={() => alert("Clicked Event")}
    />
  );
};
export default DistroEventsCalendar;
