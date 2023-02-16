import { Icon } from "@chakra-ui/icons";
import { Props } from "chakra-react-select";
import { FunctionComponent } from "react";

// eslint-disable-next-line react/function-component-definition
export const ReceivingIcon: FunctionComponent<Props> = () => (
  <Icon verticalAlign="center" width="23" height="26" viewBox="0 0 23 26" fill="none">
    <path d="M14 1H22V25H14" stroke="#2D3748" strokeWidth="2" />
    <path
      // eslint-disable-next-line max-len
      d="M12.172 11.778L6.808 6.414L8.222 5L16 12.778L8.222 20.556L6.808 19.142L12.172 13.778H0V11.778H12.172Z"
      fill="#2D3748"
    />
  </Icon>
);
