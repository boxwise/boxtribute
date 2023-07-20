import { Box } from "@chakra-ui/react";

function TimelineBullet() {
  return (
    <Box
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: "50%",
        left: -1,
        transform: "translateY(-50%)",
        width: 2,
        height: 2,
        borderRadius: "50%",
        backgroundColor: "blue.500",
        border: "4px solid blue.500",
      }}
      borderLeftColor="blue.500"
      borderLeftWidth={2}
      ml={10}
    />
  );
}

export default TimelineBullet;
