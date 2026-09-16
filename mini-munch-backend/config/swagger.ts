import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// load environment variable from .env file
dotenv.config();
const { PORT } = process.env;

// get the current file path and directory
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// validated Swagger specification in JSON format
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MiniMunch API",
      version: "1.0.0",
      description:
        "API and Schema for the MiniMunch restaurant ordering system!",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },

  // files (routes) containing OpenAPI annotations for Swagger specification
  apis: [path.join(currentDirectory, "../routes/*.ts").replaceAll("\\", "/")],
};

// write the validated Swagger specification to a JSON file (used for generating the api client in the frontend)
fs.writeFileSync(
  "./generated-openapi-spec.json",
  JSON.stringify(swaggerJSDoc(options), null, 2),
);
console.log("openapi specification generated successfully");

export const swagger = swaggerJSDoc(options);
