import { Image, ImageProps } from "@chakra-ui/react";
import BoxtributeLogoSrc from "../assets/images/boxtribute-logo.png";

// TODO: Configure and move logo to shared-components.
function BoxtributeLogo(props: ImageProps) {
  return <Image src={BoxtributeLogoSrc} {...props} />;
}

export default BoxtributeLogo;
