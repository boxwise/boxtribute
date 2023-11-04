import { CardHeader, Flex, Heading, Spacer, Checkbox } from "@chakra-ui/react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VisHeader(params: {
  heading: string;
  visId: string;
  onSelect: () => void;
  onDeselect: () => void;
}) {
  const [checked, setChecked] = useState(false);

  const select = (event) => {
    if (event.target.checked) {
      setChecked(true);
      params.onSelect();
    } else {
      setChecked(false);
      params.onDeselect();
    }
  };

  return (
    <CardHeader>
      <Flex>
        <Heading size="md">{params.heading}</Heading>
        <Spacer></Spacer>
        <Checkbox size="lg" onChange={select} isChecked={checked}></Checkbox>
      </Flex>
    </CardHeader>
  );
}
