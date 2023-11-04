export interface IXY {
  x: number;
  y: number;
}

export const labelProps = {
  fontFamily: "Open Sans",
  fontSize: 16,
};

export const percent = (px: number, percent: number) => px * (percent / 100);

export const date2String = (date: Date) => date.toISOString().substring(0, 10);
