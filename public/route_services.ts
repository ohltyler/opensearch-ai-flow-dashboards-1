/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import {
  INDEX_PATH,
  INGEST_PIPELINE_PATH,
  REINDEX_PATH,
  SEARCH_PATH,
} from '../common';

export interface RouteServices {
  createIngestPipeline: (
    ingestPipelineName: string,
    modelId: string
  ) => Promise<any | HttpFetchError>;
  createIndex: (
    indexName: string,
    ingestPipelineName: string
  ) => Promise<any | HttpFetchError>;
  reindex: (
    sourceIndex: string,
    destIndex: string
  ) => Promise<any | HttpFetchError>;
  searchIndex: (indexName: string, body: {}) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteServices {
  return {
    createIngestPipeline: async (
      ingestPipelineName: string,
      modelId: string
    ) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INGEST_PIPELINE_PATH}/${ingestPipelineName}`,
          {
            query: {
              model_id: modelId,
            },
          }
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
    createIndex: async (indexName: string, ingestPipelineName: string) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INDEX_PATH}/${indexName}`,
          {
            query: {
              ingest_pipeline_name: ingestPipelineName,
            },
          }
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
    reindex: async (sourceIndex: string, destIndex: string) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          REINDEX_PATH,
          {
            body: JSON.stringify({
              source_index: sourceIndex,
              dest_index: destIndex,
            }),
          }
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },

    searchIndex: async (indexName: string, body: {}) => {
      try {
        const response = await core.http.post<{ respString: string }>(
          `${SEARCH_PATH}/${indexName}`,
          {
            body: JSON.stringify(body),
          }
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
  };
}
