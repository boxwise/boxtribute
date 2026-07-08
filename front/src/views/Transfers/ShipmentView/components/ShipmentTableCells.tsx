import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { AiFillMinusCircle } from "react-icons/ai";
import { Row } from "react-table";

interface IRemoveBoxCellProps {
  row: Row<any>;
  onRemoveIconClick: (id: string) => void;
  isLoadingMutation: boolean | undefined;
}

export function RemoveBoxCell({ row, onRemoveIconClick, isLoadingMutation }: IRemoveBoxCellProps) {
  return (
    <VStack align="start">
      <AiFillMinusCircle
        onClick={
          !isLoadingMutation ? () => onRemoveIconClick(row?.original.labelIdentifier) : undefined
        }
        type="solid"
        size={20}
        style={{ cursor: "pointer", color: "red", fill: "red" }}
      />
    </VStack>
  );
}

function isValidNonNegativeFloat(value: string): boolean {
  if (value.trim() === "") return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

interface IWeightCellProps {
  row: Row<any>;
  onSave: (labelIdentifier: string, weight: number) => void;
  canEdit: boolean;
}

export function WeightCell({ row, onSave, canEdit }: IWeightCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const weight: number | null = row.original.weight;
  const weightUnit: string | null = row.original.weightUnit;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const cancelEditing = () => {
    setIsEditing(false);
    setInputValue("");
  };

  if (!canEdit) {
    return (
      <Text fontSize="sm">
        {weight != null ? `${weight}${weightUnit ? ` ${weightUnit}` : ""}` : "–"}
      </Text>
    );
  }

  if (isEditing) {
    const isValid = isValidNonNegativeFloat(inputValue);
    return (
      <HStack
        spacing={1}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            cancelEditing();
          }
        }}
      >
        <Input
          ref={inputRef}
          size="xs"
          width="70px"
          bg="white"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="0.0"
        />
        {weightUnit && <Text fontSize="xs">{weightUnit}</Text>}
        <Button
          size="xs"
          colorScheme="blue"
          isDisabled={!isValid}
          onClick={() => {
            if (isValid) {
              onSave(row.original.labelIdentifier, parseFloat(inputValue));
              setIsEditing(false);
              setInputValue("");
            }
          }}
        >
          Save
        </Button>
      </HStack>
    );
  }

  if (weight == null) {
    return (
      <Box
        bg="red.50"
        cursor="pointer"
        px={1}
        onClick={() => {
          setInputValue("");
          setIsEditing(true);
        }}
      >
        <Text fontWeight="bold" color="red.500">
          -
        </Text>
      </Box>
    );
  }

  return (
    <Box
      cursor="pointer"
      onClick={() => {
        setInputValue(String(weight));
        setIsEditing(true);
      }}
    >
      <Text fontSize="sm">
        {weight}
        {weightUnit ? ` ${weightUnit}` : ""}
      </Text>
    </Box>
  );
}

interface IMonetaryValueCellProps {
  row: Row<any>;
  onSave: (labelIdentifier: string, monetaryValue: number) => void;
  canEdit: boolean;
}

export function MonetaryValueCell({ row, onSave, canEdit }: IMonetaryValueCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const monetaryValue: number | null = row.original.monetaryValue;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const cancelEditing = () => {
    setIsEditing(false);
    setInputValue("");
  };

  if (!canEdit) {
    return <Text fontSize="sm">{monetaryValue != null ? `${monetaryValue} €` : "–"}</Text>;
  }

  if (isEditing) {
    const isValid = isValidNonNegativeFloat(inputValue);
    return (
      <HStack
        spacing={1}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            cancelEditing();
          }
        }}
      >
        <Input
          ref={inputRef}
          size="xs"
          width="70px"
          bg="white"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="0.0"
        />
        <Text fontSize="xs">€</Text>
        <Button
          size="xs"
          colorScheme="blue"
          isDisabled={!isValid}
          onClick={() => {
            if (isValid) {
              onSave(row.original.labelIdentifier, parseFloat(inputValue));
              setIsEditing(false);
              setInputValue("");
            }
          }}
        >
          Save
        </Button>
      </HStack>
    );
  }

  if (monetaryValue == null) {
    return (
      <Box
        bg="red.50"
        cursor="pointer"
        px={1}
        onClick={() => {
          setInputValue("");
          setIsEditing(true);
        }}
      >
        <Text fontWeight="bold" color="red.500">
          -
        </Text>
      </Box>
    );
  }

  return (
    <Box
      cursor="pointer"
      onClick={() => {
        setInputValue(String(monetaryValue));
        setIsEditing(true);
      }}
    >
      <Text fontSize="sm">{monetaryValue} €</Text>
    </Box>
  );
}
