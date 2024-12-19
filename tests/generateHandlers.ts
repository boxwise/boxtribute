/**
 * Draft script to generate mocks and handlers for MSW based on the GraphQL schema and queries/mutations.
 * 
 * (ty free copilot)
 */

import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { parse, OperationDefinitionNode } from 'graphql';

// Set the seed for Faker to make the generated data reproducible
const SEED = 12345;
faker.seed(SEED);

// Define the root directories to search for queries and mutations
const rootDirs = [
  path.join(__dirname, '../front/src'),
  path.join(__dirname, '../shared-components')
];

// Function to recursively get all files in a directory
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

// Get all files in the specified directories
const allFiles = rootDirs.flatMap(dir => getAllFiles(dir));

// Filter files containing GraphQL queries and mutations
const queryFiles = allFiles.filter(file => {
  const content = fs.readFileSync(file, 'utf-8');
  return /graphql\(`/.test(content);
});

// Extract the queries and mutations
const queriesAndMutations = queryFiles.flatMap(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/export const (\w+) = graphql\(`([\s\S]*?)`\);/g);
  return matches ? matches.map(match => {
    const [, name, query] = match.match(/export const (\w+) = graphql\(`([\s\S]*?)`\);/)!;
    return { name, query, file };
  }) : [];
});

// Filter out fragments
const filteredQueriesAndMutations = queriesAndMutations.filter(({ query }) => !query.trim().startsWith('fragment'));

// Read the GraphQL schema
const schemaContent = fs.readFileSync(path.join(__dirname, '../graphql/generated/schema.graphql'), 'utf-8');

// Parse the schema to extract types and fields
const parseSchema = (schema: string) => {
  const typeDefs = schema.match(/type (\w+) \{([\s\S]*?)\}/g);
  const types: Record<string, Record<string, string>> = {};

  typeDefs?.forEach(typeDef => {
    const [, typeName, fields] = typeDef.match(/type (\w+) \{([\s\S]*?)\}/)!;
    const fieldDefs = fields.trim().split('\n').map(field => field.trim().split(': '));
    types[typeName] = Object.fromEntries(fieldDefs);
  });

  return types;
};

const types = parseSchema(schemaContent);

// Generate mock data based on the inferred types
const generateMockData = (type: any): any => {
  if (typeof type === 'string') {
    switch (type) {
      case 'String':
        return faker.lorem.word();
      case 'Int':
        return faker.number.int();
      case 'Boolean':
        return faker.datatype.boolean();
      case 'Float':
        return faker.number.float();
      case 'ID':
        return faker.string.uuid();
      case 'Datetime':
        return faker.date.recent().toISOString();
      case 'Date':
        return faker.date.recent().toISOString().split('T')[0];
      default:
        return null;
    }
  } else if (Array.isArray(type)) {
    return type.map(t => generateMockData(t));
  } else if (typeof type === 'object') {
    const obj: any = {};
    for (const key in type) {
      obj[key] = generateMockData(type[key]);
    }
    return obj;
  }
  return null;
};

// Generate the mock data structure based on the GraphQL schema
const generateMockDataStructure = (typeName: string): any => {
  const type = types[typeName];
  if (!type) return {};

  const mockDataStructure: any = {};
  for (const field in type) {
    mockDataStructure[field] = type[field];
  }
  return mockDataStructure;
};

// Extract operation names from queries and mutations
const extractOperationName = (query: string): string | null => {
  const parsedQuery = parse(query);
  const operation = parsedQuery.definitions.find(
    (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition'
  );
  return operation?.name?.value || null;
};

// Generate mock data for all queries and mutations
const generateAllMockData = () => {
  const mockData: Record<string, any> = {};
  filteredQueriesAndMutations.forEach(({ name, query }) => {
    const operationName = extractOperationName(query);
    if (operationName) {
      const mockDataStructure = generateMockDataStructure(operationName);
      console.log(`Generating mock data for ${operationName}:`, mockDataStructure); // Debugging log
      mockData[name] = generateMockData(mockDataStructure);
      console.log(`Generated mock data for ${operationName}:`, mockData[name]); // Debugging log
    }
  });
  return mockData;
};

// Export the generated mock data
const mockData = generateAllMockData();

// Generate the handlers
const generateHandlers = () => {
  const handlers = filteredQueriesAndMutations.map(({ name, query }) => {
    const isMutation = query.trim().startsWith('mutation');
    const handlerType = isMutation ? 'mutation' : 'query';
    const resultType = `ResultOf<typeof ${name}>`;
    const variablesType = `VariablesOf<typeof ${name}>`;

    return `
const mock${name}Handler = graphql.${handlerType}<${resultType}, ${variablesType}>("${name}", async (req, res, ctx) => {
  // Use the exported mock data
  const data: ${resultType} = mockData['${name}'];
  return res(ctx.json({ data }));
});
    `;
  }).join('\n');

  return handlers;
};

// Write the generated handlers to a file
const handlers = generateHandlers();
const generatedHandlersContent = `
import { graphql } from 'msw';
import { ResultOf, VariablesOf } from 'gql.tada';

// Exported mock data
export const mockData = ${JSON.stringify(mockData, null, 2)};

// Generated handlers
${handlers}
`;

fs.writeFileSync(path.join(__dirname, 'generatedHandlers.ts'), generatedHandlersContent);

console.log('Handlers generated successfully.');
