
interface BreadCrumpItemData {
  label: string;
  linkPath: string;
}

interface BTBreadcrumbNavigationProps {
  items: BreadCrumpItemData[];
}

const BTBreadcrumbNavigation = ({ items }: BTBreadcrumbNavigationProps) => {
  return (<></>
    // <Breadcrumb fontWeight="medium" fontSize="sm" mb={4}>
    //   <BreadcrumbItem>
    //     <BreadcrumbLink href="#">TODOBase "Subotica"</BreadcrumbLink>
    //   </BreadcrumbItem>

    //   <BreadcrumbItem>
    //     <BreadcrumbLink href="#">Mobile Distributions</BreadcrumbLink>
    //   </BreadcrumbItem>

    //   <BreadcrumbItem>
    //     <BreadcrumbLink href="#">Events</BreadcrumbLink>
    //   </BreadcrumbItem>

    //   <BreadcrumbItem isCurrentPage>
    //     <BreadcrumbLink href="#">"Thu Jul 28 2022 - Spot 1"</BreadcrumbLink>
    //   </BreadcrumbItem>
    // </Breadcrumb>
  );
};

export default BTBreadcrumbNavigation;
