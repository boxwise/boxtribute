import { useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { BoxFieldsFragment, BoxState } from "types/generated/graphql";
import { IScannedBoxesData } from "types/graphql-local-only";
import { useNotification } from "./useNotification";

export const useScannedBoxesActions = () => {
  const apolloClient = useApolloClient();
  const { createToast } = useNotification();

  const addBox = useCallback(
    (box: BoxFieldsFragment) =>
      apolloClient.cache.updateQuery(
        {
          query: GET_SCANNED_BOXES,
        },
        (data: IScannedBoxesData) => {
          const existingBoxRefs = data.scannedBoxes.map((b) => ({
            __typename: "Box",
            labelIdentifier: b.labelIdentifier,
            state: b.state,
          }));

          const alreadyExists = existingBoxRefs.some(
            (ref) => ref.labelIdentifier === box.labelIdentifier,
          );

          if (alreadyExists) {
            createToast({
              message: `Box ${box.labelIdentifier} is already on the list.`,
              type: "info",
            });

            return existingBoxRefs;
          }
          // execute rest only if Box is not in the scannedBoxes already
          createToast({
            message: `Box ${box.labelIdentifier} was added to the list.`,
            type: "success",
          });

          return {
            scannedBoxes: [
              ...existingBoxRefs,
              {
                __typename: "Box",
                labelIdentifier: box.labelIdentifier,
                state: box.state,
              },
            ],
          } as IScannedBoxesData;
        },
      ),
    [apolloClient.cache, createToast],
  );

  const flushAllBoxes = useCallback(() => {
    apolloClient.writeQuery({
      query: GET_SCANNED_BOXES,
      data: {
        scannedBoxes: [],
      } as IScannedBoxesData,
    });
  }, [apolloClient]);

  const undoLastBox = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data: IScannedBoxesData) =>
        ({
          scannedBoxes: data.scannedBoxes.slice(0, -1),
        } as IScannedBoxesData),
    );
  }, [apolloClient]);

  const removeNotInStockBoxes = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data: IScannedBoxesData) =>
        ({
          scannedBoxes: data.scannedBoxes.filter((box) => box.state === BoxState.InStock),
        } as IScannedBoxesData),
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
          } as IScannedBoxesData),
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
