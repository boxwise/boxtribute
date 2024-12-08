/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  query createdBoxes($baseId: Int!) {\n    createdBoxes(baseId: $baseId) {\n      facts {\n        boxesCount\n        productId\n        categoryId\n        createdOn\n        tagIds\n        gender\n        itemsCount\n      }\n      dimensions {\n        product {\n          id\n          name\n          gender\n        }\n        category {\n          id\n          name\n        }\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n": types.CreatedBoxesDocument,
    "\n  query BeneficiaryDemographics($baseId: Int!) {\n    beneficiaryDemographics(baseId: $baseId) {\n      facts {\n        count\n        createdOn\n        age\n        gender\n        tagIds\n      }\n      dimensions {\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n": types.BeneficiaryDemographicsDocument,
    "\n  query movedBoxes($baseId: Int!) {\n    movedBoxes(baseId: $baseId) {\n      facts {\n        movedOn\n        targetId\n        categoryId\n        boxesCount\n        itemsCount\n        gender\n        productName\n        tagIds\n        organisationName\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        target {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": types.MovedBoxesDocument,
    "\n  query stockOverview($baseId: Int!) {\n    stockOverview(baseId: $baseId) {\n      facts {\n        productName\n        categoryId\n        gender\n        boxesCount\n        itemsCount\n        sizeId\n        tagIds\n        boxState\n        locationId\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        size {\n          id\n          name\n        }\n        tag {\n          ...TagFragment\n        }\n        location {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.StockOverviewDocument,
    "\n  fragment TagFragment on TagDimensionInfo {\n    id\n    name\n    color\n  }\n": types.TagFragmentFragmentDoc,
    "\n  fragment ProductFragment on ProductDimensionInfo {\n    id\n    name\n    gender\n  }\n": types.ProductFragmentFragmentDoc,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query createdBoxes($baseId: Int!) {\n    createdBoxes(baseId: $baseId) {\n      facts {\n        boxesCount\n        productId\n        categoryId\n        createdOn\n        tagIds\n        gender\n        itemsCount\n      }\n      dimensions {\n        product {\n          id\n          name\n          gender\n        }\n        category {\n          id\n          name\n        }\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query createdBoxes($baseId: Int!) {\n    createdBoxes(baseId: $baseId) {\n      facts {\n        boxesCount\n        productId\n        categoryId\n        createdOn\n        tagIds\n        gender\n        itemsCount\n      }\n      dimensions {\n        product {\n          id\n          name\n          gender\n        }\n        category {\n          id\n          name\n        }\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query BeneficiaryDemographics($baseId: Int!) {\n    beneficiaryDemographics(baseId: $baseId) {\n      facts {\n        count\n        createdOn\n        age\n        gender\n        tagIds\n      }\n      dimensions {\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query BeneficiaryDemographics($baseId: Int!) {\n    beneficiaryDemographics(baseId: $baseId) {\n      facts {\n        count\n        createdOn\n        age\n        gender\n        tagIds\n      }\n      dimensions {\n        tag {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query movedBoxes($baseId: Int!) {\n    movedBoxes(baseId: $baseId) {\n      facts {\n        movedOn\n        targetId\n        categoryId\n        boxesCount\n        itemsCount\n        gender\n        productName\n        tagIds\n        organisationName\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        target {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query movedBoxes($baseId: Int!) {\n    movedBoxes(baseId: $baseId) {\n      facts {\n        movedOn\n        targetId\n        categoryId\n        boxesCount\n        itemsCount\n        gender\n        productName\n        tagIds\n        organisationName\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        target {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query stockOverview($baseId: Int!) {\n    stockOverview(baseId: $baseId) {\n      facts {\n        productName\n        categoryId\n        gender\n        boxesCount\n        itemsCount\n        sizeId\n        tagIds\n        boxState\n        locationId\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        size {\n          id\n          name\n        }\n        tag {\n          ...TagFragment\n        }\n        location {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query stockOverview($baseId: Int!) {\n    stockOverview(baseId: $baseId) {\n      facts {\n        productName\n        categoryId\n        gender\n        boxesCount\n        itemsCount\n        sizeId\n        tagIds\n        boxState\n        locationId\n      }\n      dimensions {\n        category {\n          id\n          name\n        }\n        size {\n          id\n          name\n        }\n        tag {\n          ...TagFragment\n        }\n        location {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment TagFragment on TagDimensionInfo {\n    id\n    name\n    color\n  }\n"): (typeof documents)["\n  fragment TagFragment on TagDimensionInfo {\n    id\n    name\n    color\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ProductFragment on ProductDimensionInfo {\n    id\n    name\n    gender\n  }\n"): (typeof documents)["\n  fragment ProductFragment on ProductDimensionInfo {\n    id\n    name\n    gender\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
