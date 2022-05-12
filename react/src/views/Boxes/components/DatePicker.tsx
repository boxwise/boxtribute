import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  ChakraProvider,
  ColorModeScript,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Switch,
  useColorMode,
  extendTheme,
} from "@chakra-ui/react";

import * as React from "react";
import { render } from "react-dom";

import { DayPicker, useInput, UseInputOptions } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { Field, FieldProps, Formik } from "formik";
import { css } from "@emotion/react";
import { format } from "date-fns";

const options: UseInputOptions = {
  // Select today as default
  defaultSelected: new Date(),
  // Limit the valid dates
  fromYear: 2020,
  toYear: 2022,
  format: "PP",
  // Make the selection mandatory.
  required: true,
};

function Form() {
  // const input = useInput(options);
  const [selectedDate, setSelectedDate] = React.useState<Date>();

  return (
    <FormControl isInvalid={false}>
      {selectedDate && <p>You picked {format(selectedDate, "PP")}.</p>}
      <Popover>
        <PopoverTrigger>
          <Input value={selectedDate?.toDateString() || ""} />
          {/* <Input
              {...input.inputProps}
              // placeholder={format(field.value, options.format)}
            /> */}
        </PopoverTrigger>
        <PopoverContent>
          {/* <DayPicker {...input.dayPickerProps} showWeekNumber onSelect={setSelectedDate} /> */}
          <DayPicker onSelect={setSelectedDate} mode="single" />
        </PopoverContent>
      </Popover>
      <FormErrorMessage>Error Message</FormErrorMessage>
    </FormControl>
  );
}

const DatePickerExample = () => {
  const { toggleColorMode } = useColorMode();

  return (
    <Container
      p={16}
      css={css`
        --rdp-cell-size: 2rem;
        --rdp-accent-color: var(--chakra-colors-blue-500);
        --rdp-background-color: var(--chakra-colors-blue-200);
      `}
    >
      <Form />

      <FormControl mt={16} display="flex" alignItems="center">
        {/* <FormLabel mb="0" mr={4}>
            Dark mode?
            <Switch onChange={() => toggleColorMode()} />
          </FormLabel> */}
      </FormControl>
    </Container>
  );
};

export default DatePickerExample;
