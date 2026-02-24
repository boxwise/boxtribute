import { Heading } from "@chakra-ui/react";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { TagsContainer } from "./components/TagsContainer";

export function TagsView() {
  return (
    <>
      <BreadcrumbNavigation items={[{ label: "Coordinator Admin" }, { label: "Manage Tags" }]} />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Tags
      </Heading>
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
