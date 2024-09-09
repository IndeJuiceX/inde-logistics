import { createSwaggerSpec } from 'next-swagger-doc';
import { readFileSync } from 'fs';
import path from 'path';
import YAML from 'yaml';
export const GET = async () => {
    // Read and parse the openapi.yml file
  const filePath = path.resolve(process.cwd(), 'openapi.yml');
  const fileContents = readFileSync(filePath, 'utf8');
  const spec = YAML.parse(fileContents);

  return new Response(JSON.stringify(spec), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
