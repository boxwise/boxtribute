import React from "react";

export interface MobileSlide {
  /** Bold headline shown below the image */
  title: string;
  /** Body text below the title */
  text: React.ReactNode;
  /** Path to a screenshot image. */
  imageSrc?: string;
  /** Optional: minimum required user role to view the slide */
  requiredRole?: string;
}
