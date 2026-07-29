import { Box } from "@chakra-ui/react";

export function StatusDot({ status }: { status: "live" | "roadmap" }) {
  return (
    <Box
      w={2}
      h={2}
      borderRadius="full"
      bg={status === "live" ? "brandGreen" : "brandYellow.200"}
      flexShrink={0}
    />
  );
}
