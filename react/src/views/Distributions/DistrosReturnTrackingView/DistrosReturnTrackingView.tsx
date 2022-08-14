import { Box } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";

const DistrosReturnTrackingView = () => {
  const [searchParams] = useSearchParams();
  const distroEventIdsForReturnTracking = searchParams.getAll("distroEventIds[]");

  return (
    <Box>
        {JSON.stringify(distroEventIdsForReturnTracking)}
      <h1>DistrosReturnTrackingView</h1>
    </Box>
  );
};

export default DistrosReturnTrackingView;
