import { useApolloClient } from "@apollo/client";
import { useState, useCallback } from "react";
import { BoxState } from "types/generated/graphql";
import { IBoxBasicFields } from "types/graphql-local-only";
import {
  IUnassignmentFromShipment,
  generateUnassignBoxesFromShipmentsRequest,
  isUnassignmentFromShipment,
} from "queries/dynamic-mutations";
import { useNotification } from "./useNotification";

// eslint-disable-next-line no-shadow
export enum IUnassignBoxesFromShipmentsResultKind {
  BAD_USER_INPUT = "badUserInput", // no Boxes with stored shipmentIds were passed to the function
  SUCCESS = "success",
  FAIL = "fail",
  PARTIAL_FAIL = "partialFail", // not all boxes were unassigned
  NETWORK_FAIL = "networkFail", // ERROR
}

export interface IUnassignBoxesFromShipmentsResult {
  kind: IUnassignBoxesFromShipmentsResultKind;
  requestedBoxes: IBoxBasicFields[];
  notMarkedForShipmentBoxes: IBoxBasicFields[];
  unassignedBoxes?: IBoxBasicFields[];
  failedBoxes?: IBoxBasicFields[];
  error?: any;
}

export const useUnassignBoxesFromShipments = () => {
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unassignBoxesFromShipmentsResult, setUnassignBoxesFromShipmentsResult] =
    useState<IUnassignBoxesFromShipmentsResult | null>(null);
  const apolloClient = useApolloClient();

  const unassignBoxesFromShipments = useCallback(
    (boxes: IBoxBasicFields[]) => {
      setIsLoading(true);
      const markedForShipmentBoxes = boxes.filter(
        (box) => box.state === BoxState.MarkedForShipment,
      );

      const notMarkedForShipmentBoxes = boxes.filter(
        (box) => box.state !== BoxState.MarkedForShipment,
      );

      const shipmentBoxDictionary = markedForShipmentBoxes.reduce(
        (acc, box) => {
          if (box.shipmentDetail && box.shipmentDetail.shipment) {
            const key = box.shipmentDetail.shipment.id;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(box.labelIdentifier);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // no Boxes with shipmentIds were passed
      if (Object.keys(shipmentBoxDictionary).length === 0) {
        setIsLoading(false);
        setUnassignBoxesFromShipmentsResult({
          kind: IUnassignBoxesFromShipmentsResultKind.BAD_USER_INPUT,
          requestedBoxes: boxes,
          notMarkedForShipmentBoxes,
        } as IUnassignBoxesFromShipmentsResult);
        return;
      }

      // mutation request is prepared
      const gqlRequestPrep = generateUnassignBoxesFromShipmentsRequest(shipmentBoxDictionary);

      apolloClient
        .mutate({
          mutation: gqlRequestPrep.gqlRequest,
          variables: gqlRequestPrep.variables,
        })
        .then(({ data }) => {
          const stillAssignedLabelIdentifiers: string[] = Object.values(data).reduce(
            (result: string[], unassignment) => {
              if (isUnassignmentFromShipment(unassignment)) {
                const typedUnassignment = unassignment as IUnassignmentFromShipment;
                typedUnassignment.details.forEach((detail) => {
                  if (detail.removedOn === null) {
                    result.push(detail.box.labelIdentifier);
                  }
                });
              }
              return result;
            },
            [],
          ) as string[];

          const failedBoxes: IBoxBasicFields[] = markedForShipmentBoxes.filter((box) =>
            stillAssignedLabelIdentifiers.some(
              (labelIdentifier) => labelIdentifier === box.labelIdentifier,
            ),
          );

          const unassignedBoxes: IBoxBasicFields[] = markedForShipmentBoxes.filter(
            (box) =>
              !stillAssignedLabelIdentifiers.some(
                (labelIdentifier) => labelIdentifier === box.labelIdentifier,
              ),
          );

          setIsLoading(false);

          // no boxes were unassigned
          if (unassignedBoxes.length === 0) {
            setUnassignBoxesFromShipmentsResult({
              kind: IUnassignBoxesFromShipmentsResultKind.FAIL,
              requestedBoxes: boxes,
              notMarkedForShipmentBoxes,
              failedBoxes,
            } as IUnassignBoxesFromShipmentsResult);
            return;
          }

          // some boxes were unassigned
          if (unassignedBoxes.length > 0) {
            createToast({
              message: `${
                unassignedBoxes.length === 1 ? "A Box was" : `${unassignedBoxes.length} Boxes were`
              } successfully unassigned from their corresponding shipment.`,
            });
          }
          if (failedBoxes.length > 0) {
            setUnassignBoxesFromShipmentsResult({
              kind: IUnassignBoxesFromShipmentsResultKind.PARTIAL_FAIL,
              requestedBoxes: boxes,
              notMarkedForShipmentBoxes,
              unassignedBoxes,
              failedBoxes,
            } as IUnassignBoxesFromShipmentsResult);
            return;
          }

          // all boxes were unassigned
          setUnassignBoxesFromShipmentsResult({
            kind: IUnassignBoxesFromShipmentsResultKind.SUCCESS,
            requestedBoxes: boxes,
            notMarkedForShipmentBoxes,
            unassignedBoxes,
          } as IUnassignBoxesFromShipmentsResult);
        })
        .catch((error) => {
          setIsLoading(false);
          setUnassignBoxesFromShipmentsResult({
            kind: IUnassignBoxesFromShipmentsResultKind.NETWORK_FAIL,
            requestedBoxes: boxes,
            notMarkedForShipmentBoxes,
            failedBoxes: markedForShipmentBoxes,
            error,
          } as IUnassignBoxesFromShipmentsResult);
        });
    },
    [apolloClient, createToast],
  );

  const flushResult = () => {
    setUnassignBoxesFromShipmentsResult(null);
  };

  return {
    unassignBoxesFromShipments,
    isLoading,
    unassignBoxesFromShipmentsResult,
    flushResult,
  };
};
