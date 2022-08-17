// TODO: consider to remove this and use lodash consistently instead
export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

export const getISODateTimeFromDateAndTimeString = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  return dateTime;
}

export const weekDayNumberToWeekDayName = (weekDayNumber: number) => {
  const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekDayNames[weekDayNumber];
}

export const getDateNormalizedDateTime = (dateTime: Date) => {
  const newDate = new Date(dateTime);
  newDate.setHours(0,0,0,0);
  return newDate;
}
