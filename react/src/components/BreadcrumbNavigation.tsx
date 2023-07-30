import { useContext } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

interface IBreadCrumpItemData {
  label: string;
  linkPath?: string;
}

interface IBreadcrumbNavigationProps {
  items: IBreadCrumpItemData[];
}

function BreadcrumbNavigation({ items }: IBreadcrumbNavigationProps) {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const orgName = globalPreferences.organisation?.name;
  const baseName = globalPreferences.selectedBase?.name;
  return (
    <Breadcrumb separator={<ChevronRightIcon />} fontSize="md" mb={4}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">{orgName}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">{baseName}</BreadcrumbLink>
      </BreadcrumbItem>
      {items.map((item) => (
        <BreadcrumbItem>
          <BreadcrumbLink href="#">{item.label}</BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

export default BreadcrumbNavigation;
