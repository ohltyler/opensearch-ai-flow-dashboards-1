/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import { INDEX_PATH, INGEST_PIPELINE_PATH } from '../common';

export interface RouteServices {
  createIngestPipeline: (model_id: string) => Promise<any | HttpFetchError>;
  createIndex: (indexName: string) => Promise<any | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteServices {
  return {
    createIngestPipeline: async (modelId: string) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INGEST_PIPELINE_PATH}/${modelId}`
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
    createIndex: async (indexName: string) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INDEX_PATH}/${indexName}`
        );
        return response;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
  };
}
