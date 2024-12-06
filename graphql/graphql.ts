import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './generated/graphql-env.d.ts';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    Datetime: string;
    Date: any;
  };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';

