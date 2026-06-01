export type PathId = "path1" | "path2" | "path3";

export interface TourStep {
  /** CSS selector or element ID (with #) to spotlight */
  target: string;
  /** Bold title shown at the top of the popover */
  title: string;
  /** Explanation text */
  content: string;
  /** Whether to expand a nav accordion group before showing this step */
  expandMenuGroup?: string;
}

export interface WalkthroughPath {
  id: PathId;
  title: string;
  description: string;
  icon: string;
  steps: TourStep[];
}
