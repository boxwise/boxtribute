#!/bin/bash

cat ./back/boxtribute_server/graph_ql/definitions/basic/*.graphql ./back/boxtribute_server/graph_ql/definitions/protected/*.graphql ./back/boxtribute_server/graph_ql/definitions/public/types.graphql > ./graphql/generated/schema.graphql

pnpm gql-tada generate output

pnpm graphql-codegen -c graphql/codegen.yml