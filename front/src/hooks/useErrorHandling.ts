import { useCallback } from "react";
import { toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";

export interface ITriggerErrorProps {
  message: string;
  userMessage?: string;
  statusCode?: string;
}

export const useErrorHandling = () => {
  const triggerError = useCallback(({ message, userMessage, statusCode }: ITriggerErrorProps) => {
    if (statusCode) console.error(`[${statusCode}] ${message}`);
    else console.error(`${message}`);

    toaster.create({
      title: "Error",
      description: userMessage || message,
      type: "error",
      duration: 5000,
    });
  }, []);

  return {
    triggerError,
  };
};
