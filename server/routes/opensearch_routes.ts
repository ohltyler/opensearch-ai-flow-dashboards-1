/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
} from '../../../../src/core/server';
import { INGEST_PIPELINE_PATH, INDEX_PATH } from '../../common';
import { IngestPutPipelineRequest } from '@opensearch-project/opensearch/api/types';
import { IngestProcessorContainer } from '@opensearch-project/opensearch/api/types';

export function registerOpenSearchRoutes(router: IRouter): void {
  router.put(
    {
      path: `${INGEST_PIPELINE_PATH}/{model_id}`,
      validate: {
        params: schema.object({
          model_id: schema.string(),
        }),
      },
    },
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { model_id } = req.params;
      console.log('model id: ', model_id);
      const params = {
        // the name / id of the pipeline
        id: 'test-neural-search-pipeline',
        body: {
          description: 'Semantic search ingest pipeline',
          processors: [
            {
              text_embedding: {
                model_id: model_id,
                field_map: {
                  description: 'desc_v',
                  name: 'name_v',
                },
              },
            } as IngestProcessorContainer,
          ],
        },
      } as IngestPutPipelineRequest;
      try {
        const response = await client.ingest.putPipeline(params);
        return res.ok({ body: response });
      } catch (err: any) {
        return res.customError({
          statusCode: err.statusCode || 500,
          body: {
            message: err.message,
            attributes: {
              error: err.body?.error || err.message,
            },
          },
        });
      }
    }
  );
}
