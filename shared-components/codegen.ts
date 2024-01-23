import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "../back/boxtribute_server/graph_ql/definitions/public/*.graphql",
    "../back/boxtribute_server/graph_ql/definitions/basic/*.graphql",
  ],
  documents: "./**/*.{ts,tsx}",
  generates: {
    "types/generated/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
};

export default config;
