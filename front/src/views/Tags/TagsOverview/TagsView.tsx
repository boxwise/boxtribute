import { Button, Heading } from "@chakra-ui/react";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { TagsContainer } from "./components/TagsContainer";

export function TagsView() {
  return (
    <>
      <BreadcrumbNavigation items={[{ label: "Coordinator Admin" }, { label: "Manage Tags" }]} />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Tags
      </Heading>
      <Link to="create">
        <Button leftIcon={<AddIcon />} borderRadius="0">
          Add New Tag
        </Button>
      </Link>
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch tags data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <TagsContainer />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
