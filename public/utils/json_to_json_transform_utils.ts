/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { flattie } from 'flattie';
import { MapFormValue } from '../../common';

/**
 * Collection of util fns to convert JSON -> JSON via JSON path transforms.
 */

type Node = [] | {};
// TODO: finalize if the map transforms can have multi-depth. If so, we will need further
// helper fns to flatten the keys so the path mapping is still single-depth. If not,
// we should have extra guardrails and callouts that multi-depth is not supported.
type JsonPathMappings = {};
// type JsonPathMappings = {[key: string]: string}

export function automaticallyGenerateTransforms(
  inputJson: string,
  outputJson: string
): MapFormValue {
  try {
    const inputNode = JSON.parse(inputJson);
    const outputNode = JSON.parse(outputJson);

    const invertedIndex = createInvertedIndex(inputNode);
    const mappingResult = mapStructures(outputNode, invertedIndex);

    return convertMappingsToFormValue(mappingResult);
  } catch {
    return [];
  }
}

function createInvertedIndex(node: Node) {
  const index = new Map();
  function createInvertedIndexRecursive(node: Node, path: string) {
    if (typeof node === 'object' && node !== null) {
      if (Array.isArray(node)) {
        node.forEach((element, i) =>
          createInvertedIndexRecursive(element, `${path}[${i}]`)
        );
      } else {
        Object.entries(node).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          createInvertedIndexRecursive(value, newPath);
        });
      }
    } else {
      const value = String(node);
      if (!index.has(value)) index.set(value, []);
      index.get(value).push(path);
    }
  }
  createInvertedIndexRecursive(node, '');
  return index;
}

function mapStructures(
  outputNode: Node,
  invertedIndex: Map<any, any>
): JsonPathMappings {
  const detailedMapping = new Map();
  const correlatedMapping = new Map();
  const arrayPaths = new Set();

  function mapStructuresRecursive(node: Node, path: string) {
    if (typeof node === 'object' && node !== null) {
      if (Array.isArray(node)) {
        const sourcePaths = new Set();
        node.forEach((element, i) => {
          const elementPath = `${path}[${i}]`;
          if (typeof element !== 'object' || element === null) {
            const value = String(element);
            const paths = invertedIndex.get(value);
            if (paths) paths.forEach((p) => sourcePaths.add(p));
          }
          mapStructuresRecursive(element, elementPath);
        });
        if (sourcePaths.size > 0) {
          detailedMapping.set(path, Array.from(sourcePaths));
          correlatedMapping.set(path, correlatePaths(sourcePaths));
          arrayPaths.add(path);
        }
      } else {
        Object.entries(node).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          mapStructuresRecursive(value, newPath);
        });
      }
    } else {
      const value = String(node);
      const sourcePaths = invertedIndex.get(value);
      if (sourcePaths) {
        detailedMapping.set(path, sourcePaths);
        correlatedMapping.set(path, correlatePaths(new Set(sourcePaths)));
      }
    }
  }

  mapStructuresRecursive(outputNode, '');

  const filteredCorrelatedMapping = filterCorrelatedMapping(
    correlatedMapping,
    arrayPaths
  );
  const jsonPathSuggestions = suggestJsonPathTransforms(
    filteredCorrelatedMapping
  );
  const generalizedJsonPathSuggestions = generalizeJsonPathSuggestions(
    jsonPathSuggestions
  );

  return createJsonPathSuggestionTree(generalizedJsonPathSuggestions);
}

function filterCorrelatedMapping(correlatedMapping, arrayPaths) {
  const filteredMapping = new Map();
  for (const [outputPath, inputPath] of correlatedMapping) {
    const arrayPath = Array.from(arrayPaths).find((path) =>
      outputPath.startsWith(`${path}[`)
    );
    filteredMapping.set(
      outputPath,
      arrayPath ? inputPath.replace(/\[\d+\]/, '[*]') : inputPath
    );
  }
  return filteredMapping;
}

function suggestJsonPathTransforms(correlatedMapping) {
  const suggestions = new Map();
  for (const [outputPath, inputPath] of correlatedMapping) {
    let jsonPathSuggestion =
      '$' + (inputPath.startsWith('.') ? inputPath : '.' + inputPath);
    jsonPathSuggestion = jsonPathSuggestion.replace('.[', '[');
    if (outputPath.endsWith(']') && !inputPath.endsWith(']')) {
      jsonPathSuggestion = '[' + jsonPathSuggestion + ']';
    }
    suggestions.set(outputPath, jsonPathSuggestion);
  }
  return suggestions;
}

function generalizeJsonPathSuggestions(jsonPathSuggestions) {
  const pathPatterns = new Map();
  for (const [key, value] of jsonPathSuggestions) {
    const generalizedOutputPath = key.replace(/\[\d+\]/g, '[*]');
    const generalizedInputPath = value.replace(/\[\d+\]/g, '[*]');
    if (!pathPatterns.has(generalizedOutputPath))
      pathPatterns.set(generalizedOutputPath, new Set());
    pathPatterns.get(generalizedOutputPath).add(generalizedInputPath);
  }
  return new Map(Array.from(pathPatterns, ([k, v]) => [k, correlatePaths(v)]));
}

function correlatePaths(paths) {
  if (paths.size === 0) return '';
  if (paths.size === 1) return paths.values().next().value;

  const pathArrays = Array.from(paths);
  const parts = pathArrays[0].split(/(?<=\])|(?=\[)|\./).filter(Boolean);
  const correlatedPath = [];

  for (let i = 0; i < parts.length; i++) {
    const uniqueParts = new Set(
      pathArrays
        .map((path) => path.split(/(?<=\])|(?=\[)|\./).filter(Boolean)[i])
        .filter(Boolean)
    );

    if (
      correlatedPath.length > 0 &&
      !correlatedPath[correlatedPath.length - 1].endsWith(']') &&
      !parts[i].startsWith('[')
    ) {
      correlatedPath.push('.');
    }

    if (uniqueParts.size === 1) {
      correlatedPath.push(parts[i]);
    } else if (Array.from(uniqueParts).some((part) => /\[\d+\]/.test(part))) {
      correlatedPath.push('[*]');
    } else {
      correlatedPath.push(`{${Array.from(uniqueParts).join('|')}}`);
    }
  }

  return correlatedPath.join('');
}

function createJsonPathSuggestionTree(jsonPathSuggestionsMap) {
  const tree = {};
  for (const [key, value] of jsonPathSuggestionsMap) {
    const keyParts = key.split('.');
    let currentNode = tree;
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!currentNode[keyParts[i]]) currentNode[keyParts[i]] = {};
      currentNode = currentNode[keyParts[i]];
    }
    currentNode[keyParts[keyParts.length - 1]] = value;
  }
  return tree;
}

// Helper util fn to convert the generated mapping to the correct Formik form value
function convertMappingsToFormValue(mappings: JsonPathMappings): MapFormValue {
  let formValue = [] as MapFormValue;
  const flatMappings = flattie(mappings);
  console.log('total orig flatMappings: ', mappings);
  console.log('total flatMappings: ', flatMappings);
  Object.keys(flatMappings).forEach((flatMappingKey) => {
    formValue.push({
      key: flatMappingKey,
      value: flatMappings[flatMappingKey],
    });
  });

  return formValue;
}
