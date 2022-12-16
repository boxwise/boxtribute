import { useToast, UseToastOptions, ToastPositionWithLogical } from "@chakra-ui/react";

export interface ITriggerErrorProps extends UseToastOptions{
    message: string;
    userMessage ?: string;
    statusCode ?: string;
  }

export const useErrorHandling = () => {
    const toast = useToast();
  
    const triggerError = ({message, userMessage, statusCode}: ITriggerErrorProps) => {
        if (statusCode) console.error(`[${statusCode}] ${message}`)
        else console.error(`${message}`)
        
        toast({
            duration: 5000, 
            isClosable: true,
            position: "top",
            variant: "subtle",
            status: "error",
            title: "Error",
            description: userMessage || message,
        });
    }
    
        return {
        triggerError,
        };
    
};