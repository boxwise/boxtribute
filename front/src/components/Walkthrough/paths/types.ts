import type { Icon } from "components/HeaderMenu/MenuIcons";

export type PathId = "path1" | "path2" | "path3";

export interface TourStep {
  /** CSS selector or element ID (with #) to spotlight */
  target: string;
  /** Bold title shown at the top of the popover */
  title: string;
  /** Explanation text */
  content: string;
  /** Optional sentence rendered in bold after the main content */
  contentNote?: string;
  /** Whether to expand a nav accordion group before showing this step */
  expandMenuGroup?: string;
}

export interface WalkthroughPath {
  id: PathId;
  title: string;
  description: string;
  icon: Icon;
  /** URL for the "Get more guidance on this topic" link shown in the path indicator */
  guidanceUrl?: string;
  steps: TourStep[];
}
