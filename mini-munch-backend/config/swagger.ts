import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

// load environment variable from .env file
dotenv.config();
const { PORT } = process.env;

// validated Swagger specification in JSON format
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MiniMunch API",
      version: "1.0.0",
      description: "API for the MiniMunch restaurant ordering system!",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },

  // files (routes) containing OpenAPI annotations for Swagger specification
  apis: ["./src/controllers/*.ts"],
};

export const swagger = swaggerJSDoc(options);
