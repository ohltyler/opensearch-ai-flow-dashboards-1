/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from '../../../src/core/public';
import { INGEST_PIPELINE_PATH } from '../common';

export interface RouteServices {
  createIngestPipeline: (model_id: string) => Promise<string | HttpFetchError>;
}

export function configureRoutes(core: CoreStart): RouteServices {
  return {
    createIngestPipeline: async (model_id: string) => {
      try {
        const response = await core.http.put<{ respString: string }>(
          `${INGEST_PIPELINE_PATH}/${model_id}`
        );
        return response.respString;
      } catch (e: any) {
        console.log('e: ', e);
        return e as HttpFetchError;
      }
    },
  };
}
