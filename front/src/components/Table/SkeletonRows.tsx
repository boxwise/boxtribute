import { Skeleton, Td, Tr } from "@chakra-ui/react";

/** Placeholder rows of a table body while its data is loading */
export function SkeletonRows({
  columnCount,
  rowCount = 2,
}: {
  columnCount: number;
  rowCount?: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, i) => (
        <Tr key={`loading${i + 1}`}>
          <Td colSpan={columnCount}>
            <Skeleton height={5} />
          </Td>
        </Tr>
      ))}
    </>
  );
}
