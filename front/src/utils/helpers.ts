export const getISODateTimeFromDateAndTimeString = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  return dateTime;
};

export const getISODateTimeFromDateAndTime = (date: Date, time: Date) => {
  const dateTime = new Date(date);
  dateTime.setHours(time.getHours());
  dateTime.setMinutes(time.getMinutes());
  return dateTime;
};

export const weekDayNumberToWeekDayName = (weekDayNumber: number) => {
  const weekDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekDayNames[weekDayNumber];
};

export const getDateNormalizedDateTime = (dateTime: Date) => {
  const newDate = new Date(dateTime);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const redirectToExternalUrl = (url) => {
  window.location.replace(url);
};

/*
Return true if given RGB hex color is bright, false if dark.
This is achieved by converting the RGB value into YIQ
and then checking the Y component (luma). Cf. https://stackoverflow.com/a/946734/3865876
*/
export const colorIsBright = (hex) => {
  const [r, g, b] = hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (_m, _r, _g, _b) => `#${_r}${_r}${_g}${_g}${_b}${_b}`,
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

export const formatDateKey = (date: Date): string => `${date.toLocaleString("default", {
  month: "short",
})}
    ${date.getDate()}, ${date.getFullYear()}`;

export const prepareBoxHistoryEntryText = (text: string): string => {
  // Remove the last character if it is a semicolon
  const trimmedText = text?.endsWith(";") ? text?.slice(0, -1) : text;

  // Replace "box state" with "box status" (ref. trello card https://trello.com/c/ClAikFIk)
  const updatedText = trimmedText?.replace("box state", "box status");

  return updatedText;
};

/**
 * Formats a given date or string into a string representation of the time.
 *
 * @param {Date | string} date - The date or string to be formatted.
 * @return {string} The formatted time as a string in the format "HH:MM".
 */
export const formatTime = (date: Date | string): string => {
  const formattedDate = typeof date === "string" && date !== "" ? new Date(date) : date;

  if (formattedDate instanceof Date) {
    const hours = formattedDate.getHours().toString().padStart(2, "0");
    const minutes = formattedDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return "";
};
