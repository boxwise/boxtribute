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
