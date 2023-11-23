/* eslint-disable no-console */
import { gql, useMutation } from "@apollo/client";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { useCallback, useState } from "react";
import {
  AssignBoxesToShipmentMutation,
  AssignBoxesToShipmentMutationVariables,
  UnassignBoxesFromShipmentMutation,
  UnassignBoxesFromShipmentMutationVariables,
  BoxState,
} from "types/generated/graphql";
import { IBoxBasicFields } from "types/graphql-local-only";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

// eslint-disable-next-line no-shadow
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
  requestedBoxes: IBoxBasicFields[];
  assignedBoxes?: IBoxBasicFields[];
  unassignedBoxes?: IBoxBasicFields[];
  failedBoxes?: IBoxBasicFields[];
  error?: any;
}

export const ASSIGN_BOXES_TO_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation AssignBoxesToShipment($id: ID!, $labelIdentifiers: [String!]) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: $labelIdentifiers
        removedBoxLabelIdentifiers: []
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const UNASSIGN_BOX_FROM_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation UnassignBoxesFromShipment($id: ID!, $labelIdentifiers: [String!]) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: []
        removedBoxLabelIdentifiers: $labelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const useAssignBoxesToShipment = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [assignBoxesToShipmentMutation] = useMutation<
    AssignBoxesToShipmentMutation,
    AssignBoxesToShipmentMutationVariables
  >(ASSIGN_BOXES_TO_SHIPMENT);

  const [unassignBoxesFromShipmentMutation] = useMutation<
    UnassignBoxesFromShipmentMutation,
    UnassignBoxesFromShipmentMutationVariables
  >(UNASSIGN_BOX_FROM_SHIPMENT);

  const assignBoxesToShipment = useCallback(
    (
      shipmentId: string,
      boxes: IBoxBasicFields[],
      showToasts: boolean = true,
      showErrors: boolean = true,
    ) => {
      setIsLoading(true);
      const inStockBoxes = boxes.filter((box) => box.state === BoxState.InStock);
      const notInStockBoxes = boxes.filter((box) => box.state !== BoxState.InStock);

      // no Boxes InStock were passed
      if (inStockBoxes.length === 0) {
        setIsLoading(false);
        return {
          kind: IAssignBoxToShipmentResultKind.BAD_USER_INPUT,
          requestedBoxes: boxes,
          notInStockBoxes,
        } as IAssignBoxToShipmentResult;
      }

      return assignBoxesToShipmentMutation({
        variables: {
          id: shipmentId,
          labelIdentifiers: inStockBoxes.map((box) => box.labelIdentifier),
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions.code : undefined;
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
          const boxesInShipment: IBoxBasicFields[] =
            data?.updateShipmentWhenPreparing?.details
              .filter((detail) => detail.removedOn === null)
              .filter((detail) => detail.box.state === BoxState.MarkedForShipment)
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
                // eslint-disable-next-line max-len
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

  const unassignBoxesFromShipment = useCallback(
    (shipmentId: string, boxes: IBoxBasicFields[], showToastMessage: boolean = true) => {
      setIsLoading(true);
      const inStockLabelIdentifiers = boxes
        .filter(
          (box) =>
            box.state === BoxState.MarkedForShipment &&
            box.shipmentDetail?.shipment.id === shipmentId,
        )
        .map((box) => box.labelIdentifier);
      return unassignBoxesFromShipmentMutation({
        variables: {
          id: shipmentId,
          labelIdentifiers: inStockLabelIdentifiers,
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions.code : undefined;
            // Example: the user is not of the sending base
            if (errorCode === "FORBIDDEN") {
              if (showToastMessage)
                triggerError({
                  message: "You don't have the permissions to remove boxes from this shipment.",
                });
              return {
                kind: IAssignBoxToShipmentResultKind.NOT_AUTHORIZED,
                requestedBoxes: boxes,
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
              error: errors ? errors[0] : undefined,
            } as IAssignBoxToShipmentResult;
          }
          const boxesInShipment =
            (data?.updateShipmentWhenPreparing?.details
              .filter((detail) => detail.removedOn === null)
              .filter((detail) => detail.box.state === BoxState.MarkedForShipment)
              .map((detail) => detail.box) as IBoxBasicFields[]) ?? [];

          const failedBoxes: IBoxBasicFields[] = boxes.filter((box) =>
            boxesInShipment.some(
              (boxInShipment) => boxInShipment.labelIdentifier === box.labelIdentifier,
            ),
          );

          const unassignedBoxes: IBoxBasicFields[] = boxes.filter(
            (box) =>
              !boxesInShipment.some(
                (boxInShipment) => boxInShipment.labelIdentifier === box.labelIdentifier,
              ),
          );

          if (unassignedBoxes.length) {
            if (showToastMessage)
              createToast({
                message: `${
                  unassignedBoxes.length === 1
                    ? "A Box was"
                    : `${unassignedBoxes.length} Boxes were`
                } successfully removed from the shipment.`,
              });
          }
          // Not all Boxes were unassigned
          if (failedBoxes.length) {
            return {
              kind: IAssignBoxToShipmentResultKind.BOX_FAIL,
              requestedBoxes: boxes,
              unassignedBoxes,
              failedBoxes,
            } as IAssignBoxToShipmentResult;
          }
          // all Boxes were unassigned
          return {
            kind: IAssignBoxToShipmentResultKind.SUCCESS,
            requestedBoxes: boxes,
            unassignedBoxes,
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
              error: err,
            } as IAssignBoxToShipmentResult;
          },
        );
    },
    [unassignBoxesFromShipmentMutation, createToast, triggerError],
  );

  return {
    assignBoxesToShipment,
    unassignBoxesFromShipment,
    isLoading,
  };
};
