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

export const generateDropappUrl = (
  oldLink: String,
  baseId: String | undefined,
  qrCode: String | undefined,
  labelIdentifier: String | undefined,
) => {
  const newLink = oldLink + "?camp=" + baseId + "&preference=classic";
  if (oldLink.includes("mobile.php")) {
    if (labelIdentifier !== undefined) {
      return newLink + "&boxid=" + labelIdentifier;
    } else if (qrCode !== undefined) {
      return newLink + "&barcode=" + qrCode;
    }
  }
  return newLink;
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
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "#" + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

export const formatDateKey = (date: Date): string => {
  return `${date.toLocaleString("default", { month: "short" })}
    ${date.getDate()}, ${date.getFullYear()}`;
};
// logout handler that redirect the v2 to dropapp related trello: https://trello.com/c/sbIJYHFF
export const handleLogout = () => {
  window.location.href = `${process.env.REACT_APP_OLD_APP_BASE_URL}/index.php?action=logoutfromv2`;
  return null;
};
