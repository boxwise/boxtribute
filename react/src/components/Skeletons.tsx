import { Skeleton, Stack } from "@chakra-ui/react";

export function TableSkeleton() {
  return (
    <Stack data-testid="TableSkeleton">
      <Skeleton height={12} />
      <Skeleton height={12} />
      <Skeleton height={12} />
    </Stack>
  );
}
