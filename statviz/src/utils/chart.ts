import { defaultStyles } from "@visx/tooltip";

export interface IXY {
  x: number;
  y: number;
}

export const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#000000",
  color: "white",
  width: 152,
  height: 42,
  padding: 6,
  fontSize: 14,
};

export const tickProps = {
  fontSize: 12,
};

export const labelProps = {
  fontFamily: "Open Sans",
  fontSize: 16,
};
