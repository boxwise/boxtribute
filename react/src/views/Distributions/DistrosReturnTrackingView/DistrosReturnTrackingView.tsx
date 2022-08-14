import { Box } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";

const DistrosReturnTrackingView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Box>
      <h1>DistrosReturnTrackingView</h1>
    </Box>
  );
};

export default DistrosReturnTrackingView;
