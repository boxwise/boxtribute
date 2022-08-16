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
    <Box as="time" dateTime={plannedStartDateTime.toUTCString()}>
      {plannedStartDateTime.toDateString()} (
      {plannedStartDateTime.toLocaleTimeString()}-{" "}
      {plannedEndDateTime.toLocaleTimeString()})
    </Box>
  );
};

export default DistributionEventTimeRangeDisplay;
