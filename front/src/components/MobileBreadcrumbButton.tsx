import { Button } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

interface IBreadcrumbItemData {
  label: string;
  linkPath?: string;
  relative?: "route" | "path";
}

export function MobileBreadcrumbButton({ label, linkPath }: IBreadcrumbItemData) {
  return (
    <Button
      variant="outline"
      color="black"
      borderColor="black"
      as={Link}
      to={linkPath ?? "#"}
      border="2px"
      borderRadius={0}
      mb={4}
      leftIcon={<ChevronLeftIcon />}
    >
      {label}
    </Button>
  );
}
