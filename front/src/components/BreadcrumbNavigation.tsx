import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import { BreadcrumbNavigationSkeleton } from "./Skeletons";
import { useAtomValue } from "jotai";
import { organisationAtom, selectedBaseAtom } from "stores/globalPreferenceStore";

interface IBreadcrumbItemData {
  label: string;
  linkPath?: string;
  relative?: "route" | "path";
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
  const organisation = useAtomValue(organisationAtom);
  const selectedBase = useAtomValue(selectedBaseAtom);
  const orgName = organisation?.name;
  const baseName = selectedBase?.name;
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();

  if (isGlobalStateLoading) return <BreadcrumbNavigationSkeleton />;

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
          <BreadcrumbLink as={Link} to={item.linkPath ?? "#"} relative={item.relative ?? "route"}>
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
