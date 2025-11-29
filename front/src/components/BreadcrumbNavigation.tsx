import { Breadcrumb, Button } from "@chakra-ui/react";
import { IoChevronBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Fragment } from "react";
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
      border="2px solid"
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
          <Breadcrumb.Link href="#">{orgName}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">{baseName}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {items.map((item, index) => (
          <Fragment key={`breadcrumb${item.label}`}>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={item.linkPath ?? "#"}>{item.label}</Breadcrumb.Link>
            </Breadcrumb.Item>
            {index < items.length - 1 && <Breadcrumb.Separator />}
          </Fragment>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
