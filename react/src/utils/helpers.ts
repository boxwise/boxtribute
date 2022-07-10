const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

const getISODateTimeFromDateAndTimeString = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  return dateTime;
}

export { groupBy, getISODateTimeFromDateAndTimeString };
