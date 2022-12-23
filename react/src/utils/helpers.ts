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

export const extractQrCodeFromUrl = (url): string | undefined => {
  // TODO: improve the accuracy of this regex
  // TODO: consider to also handle different boxtribute environment urls
  const rx = /.*barcode=(.*)/g;
  const arr = rx.exec(url);
  // make sure there is no space arround qr code
  return arr?.[1].trim();
 
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
