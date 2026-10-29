import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { IBoxBasicFields } from "types/graphql-local-only";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { FilterBoxInput } from "queries/types";

export enum IAssignBoxToShipmentResultKind {
  BAD_USER_INPUT = "badUserInput", // no Boxes InStock were passed to the function
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail", // ERROR
  NOT_AUTHORIZED = "notAuthorized", // FORBIDDEN
  WRONG_SHIPMENT_STATE = "wrongShipmentState", // BAD_USER_INPUT
  BOX_FAIL = "BoxFail", // detail does not include box
}

export interface IAssignBoxToShipmentResult {
  kind: IAssignBoxToShipmentResultKind;
  notInStockBoxes?: IBoxBasicFields[];
  notMarkedForShipmentBoxes?: IBoxBasicFields[];
  requestedBoxes: IBoxBasicFields[];
  assignedBoxes?: IBoxBasicFields[];
  unassignedBoxes?: IBoxBasicFields[];
  failedBoxes?: IBoxBasicFields[];
  error?: any;
}

export const ASSIGN_BOXES_TO_SHIPMENT = graphql(
  `
    mutation AssignBoxesToShipment(
      $id: ID!
      $labelIdentifiers: [String!]
      $filters: FilterBoxInput
    ) {
      addBoxesToShipment(
        updateInput: { id: $id, labelIdentifiers: $labelIdentifiers, filters: $filters }
      ) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

export const UNASSIGN_BOXES_FROM_SHIPMENTS = graphql(`
  mutation UnassignBoxesFromShipments($labelIdentifiers: [String!], $filters: FilterBoxInput) {
    removeBoxesFromShipments(labelIdentifiers: $labelIdentifiers, filters: $filters) {
      labelIdentifier
      state
      shipmentDetail {
        id
      }
      lastModifiedOn
      lastModifiedBy {
        id
        name
      }
    }
  }
`);

export const useAssignBoxesToShipment = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [assignBoxesToShipmentMutation] = useMutation(ASSIGN_BOXES_TO_SHIPMENT);

  const [unassignBoxesFromShipmentsMutation] = useMutation(UNASSIGN_BOXES_FROM_SHIPMENTS);

  const assignBoxesToShipment = useCallback(
    (
      shipmentId: string,
      boxes: IBoxBasicFields[],
      showToasts: boolean = true,
      showErrors: boolean = true,
      filters?: FilterBoxInput,
    ) => {
      setIsLoading(true);
      // Boxes specified by filters are resolved (and restricted to InStock boxes) by the backend
      const inStockBoxes = filters ? [] : boxes.filter((box) => box.state === "InStock");
      const notInStockBoxes = filters ? [] : boxes.filter((box) => box.state !== "InStock");

      // no Boxes InStock were passed
      if (!filters && inStockBoxes.length === 0) {
        setIsLoading(false);
        return Promise.resolve({
          kind: IAssignBoxToShipmentResultKind.BAD_USER_INPUT,
          requestedBoxes: boxes,
          notInStockBoxes,
        } as IAssignBoxToShipmentResult);
      }

      return assignBoxesToShipmentMutation({
        variables: {
          id: shipmentId,
          ...(filters
            ? { filters }
            : { labelIdentifiers: inStockBoxes.map((box) => box.labelIdentifier) }),
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions?.code : undefined;
            // Example: the user is not of the sending base
            if (errorCode === "FORBIDDEN") {
              if (showErrors)
                triggerError({
                  message: "You don't have the permissions to assign boxes to this shipment.",
                });
              return {
                kind: IAssignBoxToShipmentResultKind.NOT_AUTHORIZED,
                requestedBoxes: boxes,
                notInStockBoxes,
                failedBoxes: inStockBoxes,
                error: errors ? errors[0] : undefined,
              } as IAssignBoxToShipmentResult;
            }
            // The shipment is not in the preparing state
            if (errorCode === "BAD_USER_INPUT") {
              if (showErrors)
                triggerError({
                  message: "The shipment is not in the Preparing state.",
                });
              return {
                kind: IAssignBoxToShipmentResultKind.WRONG_SHIPMENT_STATE,
                requestedBoxes: boxes,
                notInStockBoxes,
                failedBoxes: inStockBoxes,
                error: errors ? errors[0] : undefined,
              } as IAssignBoxToShipmentResult;
            }
            if (showErrors)
              triggerError({
                message: "Could not assign boxes to shipment. Try again?",
              });
            // General error
            return {
              kind: IAssignBoxToShipmentResultKind.FAIL,
              requestedBoxes: boxes,
              notInStockBoxes,
              failedBoxes: inStockBoxes,
              error: errors ? errors[0] : undefined,
            } as IAssignBoxToShipmentResult;
          }
          if (filters) {
            if (showToasts)
              createToast({ message: "The boxes were successfully assigned to the shipment." });
            return {
              kind: IAssignBoxToShipmentResultKind.SUCCESS,
              requestedBoxes: boxes,
              assignedBoxes: [],
              notInStockBoxes,
            } as IAssignBoxToShipmentResult;
          }
          const boxesInShipment: IBoxBasicFields[] =
            data?.addBoxesToShipment?.details
              .filter((detail) => detail.removedOn === null)
              .filter((detail) => detail.box.state === "MarkedForShipment")
              .map((detail) => detail.box as IBoxBasicFields) ?? [];
          const failedBoxes: IBoxBasicFields[] = inStockBoxes.filter(
            (box) =>
              !boxesInShipment.some(
                (boxInShipment) => boxInShipment.labelIdentifier === box.labelIdentifier,
              ),
          );
          const assignedBoxes: IBoxBasicFields[] = inStockBoxes.filter((box) =>
            boxesInShipment.find(
              (boxInShipment) => boxInShipment.labelIdentifier === box.labelIdentifier,
            ),
          );
          if (assignedBoxes.length) {
            if (showToasts)
              createToast({
                message: `${
                  assignedBoxes.length === 1 ? "A Box was" : `${assignedBoxes.length} Boxes were`
                } successfully assigned to the shipment.`,
              });
          }
          // Not all Boxes were assigned
          if (failedBoxes.length) {
            return {
              kind: IAssignBoxToShipmentResultKind.BOX_FAIL,
              requestedBoxes: boxes,
              assignedBoxes,
              failedBoxes,
              notInStockBoxes,
            } as IAssignBoxToShipmentResult;
          }
          // all Boxes were assigned
          return {
            kind: IAssignBoxToShipmentResultKind.SUCCESS,
            requestedBoxes: boxes,
            assignedBoxes,
            notInStockBoxes,
            error: errors ? errors[0] : undefined,
          } as IAssignBoxToShipmentResult;
        })
        .catch(
          // Network error
          (err) => {
            setIsLoading(false);
            if (showErrors)
              triggerError({
                message: "Could not assign boxes to shipment. Try again?",
              });
            return {
              kind: IAssignBoxToShipmentResultKind.NETWORK_FAIL,
              requestedBoxes: boxes,
              notInStockBoxes,
              failedBoxes: inStockBoxes,
              error: err,
            } as IAssignBoxToShipmentResult;
          },
        );
    },
    [assignBoxesToShipmentMutation, createToast, triggerError],
  );

  const unassignBoxesFromShipments = useCallback(
    (boxes: IBoxBasicFields[], showToastMessage: boolean = true, filters?: FilterBoxInput) => {
      setIsLoading(true);
      // Boxes specified by filters are resolved (and restricted to MarkedForShipment boxes) by the
      // backend
      const markedForShipmentBoxes = filters
        ? []
        : boxes.filter((box) => box.state === "MarkedForShipment");
      const notMarkedForShipmentBoxes = filters
        ? []
        : boxes.filter((box) => box.state !== "MarkedForShipment");

      // no Boxes MarkedForShipment were passed
      if (!filters && markedForShipmentBoxes.length === 0) {
        setIsLoading(false);
        return Promise.resolve({
          kind: IAssignBoxToShipmentResultKind.BAD_USER_INPUT,
          requestedBoxes: boxes,
          notMarkedForShipmentBoxes,
        } as IAssignBoxToShipmentResult);
      }

      return unassignBoxesFromShipmentsMutation({
        variables: filters
          ? { filters }
          : { labelIdentifiers: markedForShipmentBoxes.map((box) => box.labelIdentifier) },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions?.code : undefined;
            // Example: the user is not of the sending base
            if (errorCode === "FORBIDDEN") {
              if (showToastMessage)
                triggerError({
                  message: "You don't have the permissions to remove boxes from this shipment.",
                });
              return {
                kind: IAssignBoxToShipmentResultKind.NOT_AUTHORIZED,
                requestedBoxes: boxes,
                notMarkedForShipmentBoxes,
                failedBoxes: markedForShipmentBoxes,
                error: errors ? errors[0] : undefined,
              } as IAssignBoxToShipmentResult;
            }
            // The shipment is not in the preparing state
            if (errorCode === "BAD_USER_INPUT") {
              if (showToastMessage)
                triggerError({
                  message: "The shipment is not in the Preparing state.",
                });
              return {
                kind: IAssignBoxToShipmentResultKind.WRONG_SHIPMENT_STATE,
                requestedBoxes: boxes,
                notMarkedForShipmentBoxes,
                failedBoxes: markedForShipmentBoxes,
                error: errors ? errors[0] : undefined,
              } as IAssignBoxToShipmentResult;
            }
            if (showToastMessage)
              triggerError({
                message: "Could not remove boxes from shipment. Try again?",
              });
            // General error
            return {
              kind: IAssignBoxToShipmentResultKind.FAIL,
              requestedBoxes: boxes,
              notMarkedForShipmentBoxes,
              failedBoxes: markedForShipmentBoxes,
              error: errors ? errors[0] : undefined,
            } as IAssignBoxToShipmentResult;
          }
          const removedBoxes = data?.removeBoxesFromShipments ?? [];

          const unassignedBoxes: IBoxBasicFields[] = filters
            ? (removedBoxes as IBoxBasicFields[])
            : markedForShipmentBoxes.filter((box) =>
                removedBoxes.some(
                  (removedBox) => removedBox.labelIdentifier === box.labelIdentifier,
                ),
              );

          const failedBoxes: IBoxBasicFields[] = markedForShipmentBoxes.filter(
            (box) =>
              !removedBoxes.some(
                (removedBox) => removedBox.labelIdentifier === box.labelIdentifier,
              ),
          );

          if (unassignedBoxes.length) {
            if (showToastMessage)
              createToast({
                message: `${
                  unassignedBoxes.length === 1
                    ? "A Box was"
                    : `${unassignedBoxes.length} Boxes were`
                } successfully unassigned from the corresponding shipment.`,
              });
          }
          // Not all Boxes were unassigned
          if (failedBoxes.length) {
            return {
              kind: IAssignBoxToShipmentResultKind.BOX_FAIL,
              requestedBoxes: boxes,
              unassignedBoxes,
              failedBoxes,
              notMarkedForShipmentBoxes,
            } as IAssignBoxToShipmentResult;
          }
          // all Boxes were unassigned
          return {
            kind: IAssignBoxToShipmentResultKind.SUCCESS,
            requestedBoxes: boxes,
            unassignedBoxes,
            notMarkedForShipmentBoxes,
            error: errors ? errors[0] : undefined,
          } as IAssignBoxToShipmentResult;
        })
        .catch(
          // Network error
          (err) => {
            setIsLoading(false);
            if (showToastMessage)
              triggerError({
                message: "Could not remove boxes from shipment. Try again?",
              });
            return {
              kind: IAssignBoxToShipmentResultKind.NETWORK_FAIL,
              requestedBoxes: boxes,
              notMarkedForShipmentBoxes,
              failedBoxes: markedForShipmentBoxes,
              error: err,
            } as IAssignBoxToShipmentResult;
          },
        );
    },
    [unassignBoxesFromShipmentsMutation, createToast, triggerError],
  );

  return {
    assignBoxesToShipment,
    unassignBoxesFromShipments,
    isLoading,
  };
};
