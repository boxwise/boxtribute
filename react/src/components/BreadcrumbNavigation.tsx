import { useContext } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

interface IBreadcrumbItemData {
  label: string;
  // eslint-disable-next-line react/require-default-props
  linkPath?: string;
}

interface IBreadcrumbNavigationProps {
  items: IBreadcrumbItemData[];
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

export function BreadcrumbNavigation({ items }: IBreadcrumbNavigationProps) {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const orgName = globalPreferences.organisation?.name;
  const baseName = globalPreferences.selectedBase?.name;
  return (
    <Breadcrumb separator={<ChevronRightIcon />} fontSize="md" mb={4}>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to="#">
          {orgName}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to="#">
          {baseName}
        </BreadcrumbLink>
      </BreadcrumbItem>
      {items.map((item) => (
        <BreadcrumbItem key={`breadcrumb${item.label}`}>
          <BreadcrumbLink as={Link} to={item.linkPath ?? "#"}>
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
