// app/api/v1/docs/route.js (or route.ts if using TypeScript)

import fs from 'fs';
import path from 'path';
import YAML from 'yaml'; // Ensure you have this installed via npm/yarn

// Define the loadYaml function
const loadYaml = (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(fileContents);
};

const loadYamlFilesFromDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  return files
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map((file) => loadYaml(path.join(dirPath, file)));
};

const loadAllSchemas = (schemasDir) => {
  const schemaDirs = fs.readdirSync(schemasDir);
  let allSchemas = [];

  schemaDirs.forEach((schemaDir) => {
    const schemaFiles = loadYamlFilesFromDir(path.join(schemasDir, schemaDir));
    allSchemas = [...allSchemas, ...schemaFiles];
  });

  return allSchemas;
};

export const GET = async () => {
  try {
    const indexPath = path.resolve(process.cwd(), 'app/docs/index.yml');
    const indexSpec = loadYaml(indexPath);

    // Load Product specs
    const productSpecs = loadYamlFilesFromDir(
      path.resolve(process.cwd(), 'app/docs/products')
    );

    // Load Order specs
    const orderSpecs = loadYamlFilesFromDir(
      path.resolve(process.cwd(), 'app/docs/orders')
    );

    // Load Shipment specs
    const shipmentSpecs = loadYamlFilesFromDir(
      path.resolve(process.cwd(), 'app/docs/shipments')
    );

    // Initialize 'paths', 'tags', and 'components' if not present
    indexSpec.paths = indexSpec.paths || {};
    indexSpec.tags = indexSpec.tags || [];
    indexSpec.components = indexSpec.components || {};
    indexSpec.components.schemas = indexSpec.components.schemas || {};
    indexSpec.components.securitySchemes = indexSpec.components.securitySchemes || {};

    // Combine all specs
    const allSpecs = [...productSpecs, ...orderSpecs, ...shipmentSpecs];

    // Merge paths and tags
    const tagsSet = new Set(indexSpec.tags.map((tag) => tag.name));

    allSpecs.forEach((spec) => {
      // Merge paths
      if (spec.paths) {
        indexSpec.paths = { ...indexSpec.paths, ...spec.paths };
      }
      // Merge tags
      if (spec.tags) {
        spec.tags.forEach((tag) => {
          if (!tagsSet.has(tag.name)) {
            indexSpec.tags.push(tag);
            tagsSet.add(tag.name);
          }
        });
      }
    });

    // Load and merge schemas
    const schemasDir = path.resolve(process.cwd(), 'app/docs/schemas');
    const schemas = loadAllSchemas(schemasDir);

    // Merge schemas
    schemas.forEach((schemaSpec) => {
      indexSpec.components.schemas = {
        ...indexSpec.components.schemas,
        ...schemaSpec,
      };
    });

    // Load and merge security schemes
    const securitySchemesSpec = loadYaml(
      path.resolve(process.cwd(), 'app/docs/securitySchemes.yml')
    );

    // Merge 'components' from securitySchemesSpec into indexSpec.components
    indexSpec.components = {
      ...indexSpec.components,
      ...securitySchemesSpec.components,
    };

    // *** Apply security globally ***
    indexSpec.security = [
      {
        BearerAuth: [],
      },
    ];

    // **Inject the dynamic server URL from NEXTAUTH_URL**
    const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    indexSpec.servers = [
      {
        url: `${NEXTAUTH_URL}/api/v1/vendor`,
      },
    ];

    return new Response(JSON.stringify(indexSpec), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error loading OpenAPI specs:', error);
    return new Response('Failed to read OpenAPI spec', { status: 500 });
  }
};
