/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import { INDEX_PATH, INGEST_PIPELINE_PATH } from '../common';

export interface RouteServices {
  createIngestPipeline: (
    ingestPipelineName: string,
    modelId: string
  ) => Promise<any | HttpFetchError>;
  createIndex: (
    indexName: string,
    ingestPipelineName: string
  ) => Promise<any | HttpFetchError>;
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
  };
}
