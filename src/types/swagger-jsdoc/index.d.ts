declare module "swagger-jsdoc" {
  export type SwaggerOptions = {
    definition: Record<string, unknown>;
    apis?: string[];
  };

  export default function swaggerJSDoc(options: SwaggerOptions): Record<string, unknown>;
}
