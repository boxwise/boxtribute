import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { date2String } from "../utils/chart";

export default function useTimerange() {
  const [searchParams] = useSearchParams();

  const interval = useMemo(
    () => ({
      start: new Date(searchParams.get("from") as string),
      end: new Date(searchParams.get("to") as string),
    }),
    [searchParams]
  );

  const timerange = useMemo(
    () =>
      `from ${ 
      date2String(interval.start) 
      } to ${ 
      date2String(interval.end)}`,
    [interval]
  );

  return { timerange, interval };
}
