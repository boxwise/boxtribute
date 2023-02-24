import { useCallback } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/queries";
import QrReaderMultiBox from "./QrReaderMultiBox";

function QrReaderMultiBoxContainer() {
  const apolloClient = useApolloClient();
  const scannedBoxesQueryResult = useQuery(GET_SCANNED_BOXES);

  const onDeleteScannedBoxes = useCallback(() => {
    apolloClient.writeQuery({
      query: GET_SCANNED_BOXES,
      data: {
        scannedBoxes: [],
      },
    });
  }, [apolloClient]);

  const onUndoLastScannedBox = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data) => ({
        scannedBoxes: data.scannedBoxes.slice(0, -1),
      }),
    );
  }, [apolloClient]);

  return (
    <QrReaderMultiBox
      scannedBoxesCount={scannedBoxesQueryResult.data?.scannedBoxes.length}
      onDeleteScannedBoxes={onDeleteScannedBoxes}
      onUndoLastScannedBox={onUndoLastScannedBox}
    />
  );
}

export default QrReaderMultiBoxContainer;
