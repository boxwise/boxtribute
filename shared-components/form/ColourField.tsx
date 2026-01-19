import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  Box,
  HStack,
  VStack,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { useState, useRef, useEffect, MouseEvent, useCallback } from "react";

export interface ColourFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
  isRequired?: boolean;
}

const PRESET_COLORS = ["#E57373", "#90CAF9", "#EF9A9A", "#3F51B5", "#FFF59D", "#FF9800"];

// Helper functions for color conversion
const hexToHSV = (hex: string): { h: number; s: number; v: number } => {
  // Normalize hex string by removing # and expanding shorthand notation
  let normalizedHex = hex.replace("#", "");

  if (normalizedHex.length !== 3 && normalizedHex.length !== 6 && normalizedHex.length !== 4) {
    return { h: 0, s: 0, v: 0 }; // Invalid hex
  }

  // Handle 3-character shorthand (e.g., #F00 -> #FF0000)
  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Handle 4-character shorthand with alpha (e.g., #F00A -> #FF0000)
  if (normalizedHex.length === 4) {
    normalizedHex = normalizedHex
      .split("")
      .map((char) => char + char)
      .join("")
      .slice(0, 6);
  }

  // Handle 5-character hex (truncate to 6)
  if (normalizedHex.length === 5) {
    normalizedHex = normalizedHex.slice(0, 6);
  }

  // Pad with zeros if less than 6 characters
  normalizedHex = normalizedHex.padEnd(6, "0");

  const r = parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const g = parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const b = parseInt(normalizedHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / diff + 2) / 6;
    else h = ((r - g) / diff + 4) / 6;
  }

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number): string => {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }

  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const ColourField = ({
  fieldId,
  fieldLabel,
  errors,
  control,
  isRequired = true,
}: ColourFieldProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [colorQuery, setColorQuery] = useState("");
  const [tempColor, setTempColor] = useState<string | undefined>(undefined);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [isDraggingGradient, setIsDraggingGradient] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const updateColorFromTemp = (color: string) => {
    const hsv = hexToHSV(color);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
  };

  const updateColorFromHSV = useCallback(
    (args: { hue: number; saturation: number; value: number }) => {
      const { hue, saturation, value } = args;

      const newColor = hsvToHex(hue, saturation, value);
      if (newColor !== tempColor) {
        setTempColor(newColor);
        setColorQuery(newColor.toUpperCase());
      }
    },
    [tempColor],
  );

  const handleGradientMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDraggingGradient(true);
    updateGradientColor(e);
  };

  const handleHueMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDraggingHue(true);
    updateHue(e);
  };

  const updateGradientColor = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!gradientRef.current) return;
      const rect = gradientRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      const tempSaturation = (x / rect.width) * 100;
      const tempValue = 100 - (y / rect.height) * 100;
      setSaturation(tempSaturation);
      setValue(tempValue);
      updateColorFromHSV({
        hue,
        saturation: tempSaturation,
        value: tempValue,
      });
    },
    [hue, updateColorFromHSV],
  );

  const updateHue = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      const tempHue = (y / rect.height) * 360;
      setHue(tempHue);
      updateColorFromHSV({
        hue: tempHue,
        saturation,
        value,
      });
    },
    [saturation, updateColorFromHSV, value],
  );

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDraggingGradient) {
        updateGradientColor(e as any);
      }
      if (isDraggingHue) {
        updateHue(e as any);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingGradient(false);
      setIsDraggingHue(false);
    };

    if (isDraggingGradient || isDraggingHue) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingGradient, isDraggingHue, updateGradientColor, updateHue]);

  return (
    <FormControl isInvalid={!!errors[fieldId]} id={fieldId}>
      <FormLabel htmlFor={fieldId}>
        {fieldLabel}{" "}
        {isRequired && (
          <Text as="span" color="red.500">
            *
          </Text>
        )}
      </FormLabel>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => {
          const currentColor = field.value || "#7973e2";

          return (
            <Popover
              isOpen={isOpen}
              onOpen={() => {
                setTempColor(currentColor);
                updateColorFromTemp(currentColor);
                onOpen();
              }}
              onClose={() => {
                setShowFullPicker(false);
                onClose();
              }}
              placement="bottom-start"
            >
              <PopoverTrigger>
                <Box>
                  <HStack
                    spacing={2}
                    border="2px"
                    cursor="pointer"
                    _hover={{ borderColor: "gray.400" }}
                  >
                    <Box w="40px" h="40px" bg={currentColor} />
                    <Text fontSize="md" fontWeight="medium">
                      {currentColor.toUpperCase()}
                    </Text>
                  </HStack>
                </Box>
              </PopoverTrigger>
              <PopoverContent width="auto" maxW="400px">
                <PopoverBody p={4}>
                  <HStack align="stretch" spacing={4}>
                    <VStack h="full" w={showFullPicker ? "35%" : "100%"} spacing={3}>
                      <HStack spacing={2} flexWrap="wrap">
                        {PRESET_COLORS.map((color) => (
                          <Box
                            key={color}
                            w="32px"
                            h="32px"
                            bg={color}
                            borderRadius="md"
                            cursor="pointer"
                            border="2px solid"
                            borderColor={tempColor === color ? "blue.500" : "gray.200"}
                            onClick={() => {
                              setTempColor(color);
                              setColorQuery(color.toUpperCase());
                              updateColorFromTemp(color);
                            }}
                            _hover={{ transform: "scale(1.1)" }}
                            transition="all 0.2s"
                          />
                        ))}
                      </HStack>

                      {/* Toggle Full Picker */}
                      {!showFullPicker ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullPicker(true)}
                          color="gray.600"
                        >
                          More
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullPicker(false)}
                          color="gray.600"
                        >
                          Less
                        </Button>
                      )}
                    </VStack>
                    {showFullPicker && (
                      <VStack w="65%" spacing={3}>
                        {/* Color Picker */}
                        <HStack spacing={3} align="stretch" w="full">
                          {/* Saturation/Value Gradient */}
                          <Box
                            ref={gradientRef}
                            position="relative"
                            h="250px"
                            w="full"
                            borderRadius="md"
                            cursor="crosshair"
                            onMouseDown={handleGradientMouseDown}
                            background={`
                              linear-gradient(to top, #000, transparent),
                              linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
                            `}
                          >
                            {/* Selector Circle */}
                            <Box
                              position="absolute"
                              left={`${saturation}%`}
                              top={`${100 - value}%`}
                              w="16px"
                              h="16px"
                              border="2px solid white"
                              borderRadius="50%"
                              transform="translate(-50%, -50%)"
                              pointerEvents="none"
                              boxShadow="0 0 0 1px rgba(0,0,0,0.3)"
                            />
                          </Box>

                          {/* Hue Slider */}
                          <Box
                            ref={hueRef}
                            position="relative"
                            w="30px"
                            h="250px"
                            borderRadius="md"
                            cursor="pointer"
                            onMouseDown={handleHueMouseDown}
                            background="linear-gradient(to bottom,
                              #ff0000 0%,
                              #ffff00 17%,
                              #00ff00 33%,
                              #00ffff 50%,
                              #0000ff 67%,
                              #ff00ff 83%,
                              #ff0000 100%
                            )"
                          >
                            {/* Hue Selector */}
                            <Box
                              position="absolute"
                              top={`${(hue / 360) * 100}%`}
                              left="50%"
                              w="36px"
                              h="4px"
                              bg="white"
                              borderRadius="sm"
                              transform="translate(-50%, -50%)"
                              pointerEvents="none"
                              boxShadow="0 0 2px rgba(0,0,0,0.5)"
                            />
                          </Box>
                        </HStack>

                        {/* Hex Input */}
                        <Input
                          value={colorQuery.toUpperCase()}
                          onChange={(e) => {
                            const value = e.target.value;
                            setColorQuery(value);
                            if (
                              /^#[0-9A-Fa-f]{0,6}$/.test(value) ||
                              /^#[0-9A-Fa-f]{0,3}$/.test(value) ||
                              /^#[0-9A-Fa-f]{0,4}$/.test(value)
                            ) {
                              setTempColor(value);
                              updateColorFromTemp(value);
                            } else {
                              setTempColor(undefined);
                            }
                          }}
                          placeholder="Any hex color code (e.g., #FF5733)"
                          textAlign="center"
                          fontWeight="medium"
                        />
                      </VStack>
                    )}
                  </HStack>
                </PopoverBody>
                <PopoverFooter display="flex" gap={2}>
                  {/* Color Preview */}
                  <HStack w="full" spacing={4} align="center">
                    <Box
                      w="50%"
                      h="50px"
                      bg={tempColor}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.300"
                    />
                  </HStack>
                  <HStack>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // setShowFullPicker(false);
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => {
                        field.onChange(tempColor);
                        // setShowFullPicker(false);
                        onClose();
                      }}
                    >
                      Choose
                    </Button>
                  </HStack>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
};
