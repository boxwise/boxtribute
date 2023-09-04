import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "../back/boxtribute_server/graph_ql/definitions/public_api.graphql",
    "../back/boxtribute_server/graph_ql/definitions/basic/*.graphql",
  ],
  documents: "src/**/*.tsx",
  generates: {
    "src/types/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
