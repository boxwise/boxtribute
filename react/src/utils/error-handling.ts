/* eslint-disable no-console */
import { useToast, UseToastOptions } from "@chakra-ui/react";
import { useCallback } from "react";

export interface ITriggerErrorProps extends UseToastOptions {
  message: string;
  userMessage?: string;
  statusCode?: string;
}

export const useErrorHandling = () => {
  const toast = useToast();

  const triggerError = useCallback(
    ({ message, userMessage, statusCode }: ITriggerErrorProps) => {
      if (statusCode) console.error(`[${statusCode}] ${message}`);
      else console.error(`${message}`);

      toast({
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "subtle",
        status: "error",
        title: "Error",
        description: userMessage || message,
      });
    },
    [toast],
  );

  return {
    triggerError,
  };
};
