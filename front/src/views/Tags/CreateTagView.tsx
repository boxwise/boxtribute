import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { useMutation } from "@apollo/client";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY } from "views/BoxCreate/BoxCreateView";
import { graphql } from "../../../../graphql/graphql";
import { z } from "zod";
import { TagForm, TagSchema } from "./TagForm";

export type ICreateTagFormOutput = z.output<typeof TagSchema>;

const createTagQueryErrorText = "Something went wrong! Please try reloading the page.";

const CREATE_TAG_MUTATION = graphql(
  `
    mutation CreateTag(
      $baseId: Int!
      $name: String!
      $type: TagType!
      $color: String!
      $description: String
    ) {
      createTag(
        creationInput: {
          baseId: $baseId
          name: $name
          type: $type
          color: $color
          description: $description
        }
      ) {
        __typename
        ... on Tag {
          id
          name
          description
          color
          type
          base {
            id
            name
          }
          createdBy {
            id
            name
          }
          createdOn
        }
        ... on InsufficientPermissionError {
          name
        }
        ... on UnauthorizedForBaseError {
          name
        }
      }
    }
  `,
  [],
);

const createTagErrorToastText = "Could not create this tag! Try again?";

function CreateTagFormContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();

  const [createTag, { loading: isCreateTagLoading }] = useMutation(CREATE_TAG_MUTATION);

  const onSubmit = useCallback(
    (createTagOutput: ICreateTagFormOutput) => {
      createTag({
        variables: {
          baseId: parseInt(baseId, 10),
          name: createTagOutput.name,
          type: createTagOutput.application,
          color: createTagOutput.color,
          description: createTagOutput.description,
        },
        refetchQueries: [
          {
            query: PRODUCTS_QUERY,
            variables: {
              baseId,
            },
          },
          {
            query: ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY,
            variables: {
              baseId,
            },
          },
        ],
      })
        .then(({ data }) => {
          const result = data?.createTag;
          if (!result) {
            triggerError({
              message: createTagErrorToastText,
            });
            return;
          }

          switch (result.__typename) {
            case "Tag":
              createToast({
                message: `The tag was successfully created.`,
              });
              navigate(`..`);

              break;
            case "InsufficientPermissionError":
            case "UnauthorizedForBaseError":
              triggerError({
                message: "You don't have permission to create a tag!",
              });
              break;
            case "InvalidColorError":
              triggerError({
                message: "Colour must be a valid color string.",
              });
              break;
            default:
              triggerError({
                message: createTagErrorToastText,
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: createTagErrorToastText,
          });
        });
    },
    [createTag, baseId, triggerError, createToast, navigate],
  );

  return <TagForm onSubmit={onSubmit} isLoading={isCreateTagLoading} />;
}

export function CreateTagView() {
  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Tags" linkPath=".." />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Add New Tag
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || createTagQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <CreateTagFormContainer />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}
