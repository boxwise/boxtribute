export interface MobileSlide {
  /** Bold headline shown below the image */
  title: string;
  /** Body text below the title */
  text: string;
  /**
   * Optional path to a screenshot image.
   * When omitted a grey placeholder with a vignette border is rendered instead.
   */
  imageSrc?: string;
}
