import { defineConfig } from "orval";

// orval configuration for generating the api client from the openapi specification
export default defineConfig({
  api: {
    input: "../mini-munch-backend/generated-openapi-spec.json", // path to the openapi specification file in the backend
    output: {
      mode: "tags-split", // generate separate files for each tag in the openapi specification
      target: "./src/services/generated/generatedApi.ts", // path to the generated api client file in the frontend
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/services/api.ts",
          name: "customInstance", // name of the custom axios instance to be used in the generated api client
        },
      },
    },
  },
});
