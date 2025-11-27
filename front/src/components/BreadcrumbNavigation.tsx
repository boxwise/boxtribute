import { Breadcrumb, Button } from "@chakra-ui/react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
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
      asChild
      border="2px"
      borderRadius={0}
      mb={4}
    >
      <Link to={linkPath ?? "#"}>
        <IoChevronBack />
        {label}
      </Link>
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
    <Breadcrumb.Root fontSize="md" mb={4}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link to="#">{orgName}</Link>
          </Breadcrumb.Link>
          <Breadcrumb.Separator>
            <IoChevronForward />
          </Breadcrumb.Separator>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link to="#">{baseName}</Link>
          </Breadcrumb.Link>
          <Breadcrumb.Separator>
            <IoChevronForward />
          </Breadcrumb.Separator>
        </Breadcrumb.Item>
        {items.map((item, index) => (
          <Breadcrumb.Item key={`breadcrumb${item.label}`}>
            <Breadcrumb.Link asChild>
              <Link to={item.linkPath ?? "#"} relative={item.relative ?? "route"}>
                {item.label}
              </Link>
            </Breadcrumb.Link>
            {index < items.length - 1 && (
              <Breadcrumb.Separator>
                <IoChevronForward />
              </Breadcrumb.Separator>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
