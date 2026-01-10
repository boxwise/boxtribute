import { Box, Center, Heading } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import { FormSkeleton } from "components/Skeletons";
import { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY } from "views/BoxCreate/BoxCreateView";
import { graphql } from "../../../../graphql/graphql";
import { z } from "zod";
import { TagForm, TagSchema } from "./TagForm";
import { ICreateTagFormOutput } from "./CreateTagView";
import { TAG_QUERY } from "./TagsOverview/components/TagsContainer";

const UpdateTagFormSchema = TagSchema.extend({
  id: z.number(),
});

export type IUpdateTagFormOutput = z.output<typeof UpdateTagFormSchema>;

const updateTagQueryErrorText = "Something went wrong! Please try reloading the page.";

const UPDATE_TAG_MUTATION = graphql(
  `
    mutation UpdateTag(
      $id: ID!
      $name: String!
      $type: TagType!
      $color: String!
      $description: String
    ) {
      updateTag(
        updateInput: { id: $id, name: $name, type: $type, color: $color, description: $description }
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

const updateTagErrorToastText = "Could not update this tag! Try again?";

interface IUpdateTagFormContainerProps {
  tagId: string;
}

function UpdateTagFormContainer(props: IUpdateTagFormContainerProps) {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);
  const { createToast } = useNotification();
  const { triggerError } = useErrorHandling();

  const { data: tagData, error: tagError } = useSuspenseQuery(TAG_QUERY, {
    variables: {
      tagId: props.tagId,
    },
  });

  if (tagError) throw tagError;

  const [updateTag, { loading: isUpdateTagLoading }] = useMutation(UPDATE_TAG_MUTATION);

  const onSubmit = useCallback(
    (updateTagOutput: ICreateTagFormOutput) => {
      updateTag({
        variables: {
          id: props.tagId,
          name: updateTagOutput.name,
          type: updateTagOutput.application,
          color: updateTagOutput.color,
          description: updateTagOutput.description,
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
          const result = data?.updateTag;
          if (!result) {
            triggerError({
              message: updateTagErrorToastText,
            });
            return;
          }

          switch (result.__typename) {
            case "Tag":
              createToast({
                message: `The tag was successfully updated.`,
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
                message: updateTagErrorToastText,
              });
              break;
          }
        })
        .catch(() => {
          // Handle network or other errors
          triggerError({
            message: updateTagErrorToastText,
          });
        });
    },
    [updateTag, baseId, props.tagId, triggerError, createToast, navigate],
  );

  return (
    <TagForm
      onSubmit={onSubmit}
      isLoading={isUpdateTagLoading}
      defaultValues={
        tagData.tag
          ? {
              name: tagData.tag.name,
              application: tagData.tag.type,
              color: tagData.tag.color || "",
              description: tagData.tag.description || "",
            }
          : undefined
      }
    />
  );
}

export function UpdateTagView() {
  const tagId = useParams<{ tagId: string }>().tagId;

  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Tags" linkPath=".." />
      <Center>
        <Box w={["100%", "100%", "60%", "40%"]}>
          <Heading fontWeight="bold" mb={8} as="h1">
            Update Tag {`#${tagId}`}
          </Heading>
          <ErrorBoundary
            fallback={({ error }) => (
              <AlertWithoutAction
                type="error"
                alertText={error?.toString() || updateTagQueryErrorText}
              />
            )}
          >
            <Suspense fallback={<FormSkeleton />}>
              <UpdateTagFormContainer tagId={tagId || ""} />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Center>
    </>
  );
}
