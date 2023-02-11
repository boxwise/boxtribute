import { createIcon } from "@chakra-ui/icons";

export const ReceivingIcon = createIcon({
  displayName: "ReceivingIcon",
  viewBox: "0 0 23 26",

  path: [
    <path d="M14 1H22V25H14" fill="none" stroke="currentColor" strokeWidth="2" />,
    <path
      // eslint-disable-next-line max-len
      d="M12.172 11.778L6.808 6.414L8.222 5L16 12.778L8.222 20.556L6.808 19.142L12.172 13.778H0V11.778H12.172Z"
      fill="currentColor"
    />,
  ],
});

export const SendingIcon = createIcon({
  displayName: "SendingIcon",
  viewBox: "0 0 23 26",
  path: [
    <path
      // eslint-disable-next-line max-len
      d="M19.172 11.778L13.808 6.414L15.222 5L23 12.778L15.222 20.556L13.808 19.142L19.172 13.778H7V11.778H19.172Z"
      fill="currentColor"
    />,
    <path d="M9 25H1V1H9" fill="none" stroke="currentColor" strokeWidth="2" />,
  ],
});

export const BidirectionalIcon = createIcon({
  displayName: "BidirectionalIcon",
  viewBox: "0 0 14 14",
  path: [
    <path
      // eslint-disable-next-line max-len
      d="M2.18743 3.00711H9.14286H10H13.4286V3.89442H10.8571H2.18743L5.25257 6.2742L4.44457 6.90153L0 3.45076L4.44457 0L5.25257 0.627331L2.18743 3.00711Z"
      fill="currentColor"
    />,
    <path
      // eslint-disable-next-line max-len
      d="M11.8126 10.9929L4.85714 10.9929L4 10.9929L0.571429 10.9929L0.571429 10.1056L3.14286 10.1056L11.8126 10.1056L8.74743 7.7258L9.55543 7.09847L14 10.5492L9.55543 14L8.74743 13.3727L11.8126 10.9929Z"
      fill="currentColor"
    />,
  ],
});
