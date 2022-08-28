import { Box } from "@chakra-ui/react";

interface DistributionEventTimeRangeDisplayProps {
  plannedStartDateTime: Date;
  plannedEndDateTime: Date;
}

const DistributionEventTimeRangeDisplay = ({
  plannedStartDateTime,
  plannedEndDateTime,
}: DistributionEventTimeRangeDisplayProps) => {
  return (
    <>
      {plannedStartDateTime.toDateString()} (
      {plannedStartDateTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
      -{" "}
      {plannedEndDateTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
      )
    </>
  );
};

export default DistributionEventTimeRangeDisplay;
