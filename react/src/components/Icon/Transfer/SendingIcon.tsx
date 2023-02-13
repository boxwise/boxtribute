import { Icon } from "@chakra-ui/icons";
import { Props } from "chakra-react-select";
import { FunctionComponent } from "react";

// eslint-disable-next-line react/function-component-definition
export const SendingIcon: FunctionComponent<Props> = () => (
  <Icon verticalAlign="center" width="23" height="26" viewBox="0 0 23 26" fill="none">
    <path
      // eslint-disable-next-line max-len
      d="M19.172 11.778L13.808 6.414L15.222 5L23 12.778L15.222 20.556L13.808 19.142L19.172 13.778H7V11.778H19.172Z"
      fill="#2D3748"
    />
    <path d="M9 25H1V1H9" stroke="#2D3748" strokeWidth="2" />
  </Icon>
);
