import { useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { IScannedBoxesData } from "types/graphql-local-only";
import { useNotification } from "./useNotification";
import { Box } from "types/query-types";

export const useScannedBoxesActions = () => {
  const apolloClient = useApolloClient();
  const { createToast } = useNotification();

  const addBox = useCallback(
    (box: Box) =>
      apolloClient.cache.updateQuery(
        {
          query: GET_SCANNED_BOXES,
        },
        (data: IScannedBoxesData) => {
          const existingBoxRefs = data.scannedBoxes;

          const alreadyExists = existingBoxRefs.some(
            (ref) => ref.labelIdentifier === box?.labelIdentifier,
          );

          if (alreadyExists) {
            createToast({
              message: `Box ${box?.labelIdentifier} is already on the list.`,
              type: "info",
            });

            return existingBoxRefs;
          }
          // execute rest only if Box is not in the scannedBoxes already
          createToast({
            message: `Box ${box?.labelIdentifier} was added to the list.`,
            type: "success",
          });

          return {
            scannedBoxes: [...existingBoxRefs, box],
          } as IScannedBoxesData;
        },
      ),
    [apolloClient.cache, createToast],
  );

  const flushAllBoxes = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      () =>
        ({
          scannedBoxes: [],
        }) as IScannedBoxesData,
    );
  }, [apolloClient]);

  const undoLastBox = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data: IScannedBoxesData) =>
        ({
          scannedBoxes: data.scannedBoxes.slice(0, -1),
        }) as IScannedBoxesData,
    );
  }, [apolloClient]);

  const removeNotInStockBoxes = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data: IScannedBoxesData) =>
        ({
          scannedBoxes: data.scannedBoxes.filter((box) => box.state === "InStock"),
        }) as IScannedBoxesData,
    );
  }, [apolloClient]);

  const removeBoxesByLabelIdentifier = useCallback(
    (labelIdentifiers: string[]) => {
      apolloClient.cache.updateQuery(
        {
          query: GET_SCANNED_BOXES,
        },
        (data: IScannedBoxesData) =>
          ({
            scannedBoxes: data.scannedBoxes.filter(
              (box) => !labelIdentifiers.includes(box.labelIdentifier),
            ),
          }) as IScannedBoxesData,
      );
    },
    [apolloClient],
  );

  return {
    addBox,
    flushAllBoxes,
    undoLastBox,
    removeNotInStockBoxes,
    removeBoxesByLabelIdentifier,
  };
};
