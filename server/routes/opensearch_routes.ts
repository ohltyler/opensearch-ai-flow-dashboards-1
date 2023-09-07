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
import {
  IndicesCreateRequest,
  IngestPutPipelineRequest,
} from '@opensearch-project/opensearch/api/types';
import { IngestProcessorContainer } from '@opensearch-project/opensearch/api/types';

export function registerOpenSearchRoutes(router: IRouter): void {
  router.put(
    {
      path: `${INGEST_PIPELINE_PATH}/{ingest_pipeline_name}`,
      validate: {
        params: schema.object({
          ingest_pipeline_name: schema.string(),
        }),
        query: schema.object({
          model_id: schema.string(),
        }),
      },
    },
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { ingest_pipeline_name } = req.params;
      const { model_id } = req.query;
      const params = {
        id: ingest_pipeline_name,
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

  router.put(
    {
      path: `${INDEX_PATH}/{index_name}`,
      validate: {
        params: schema.object({
          index_name: schema.string(),
        }),
        query: schema.object({
          ingest_pipeline_name: schema.string(),
        }),
      },
    },
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { index_name } = req.params;
      const { ingest_pipeline_name } = req.query;
      const params = {
        index: index_name,
        body: {
          settings: {
            [`index.knn`]: true,
            default_pipeline: ingest_pipeline_name,
            number_of_shards: 1,
            number_of_replicas: 1,
          },
          mappings: {
            properties: {
              desc_v: {
                type: 'knn_vector',
                dimension: 384,
                method: {
                  name: 'hnsw',
                  engine: 'nmslib',
                  space_type: 'cosinesimil',
                },
              },
              name_v: {
                type: 'knn_vector',
                dimension: 384,
                method: {
                  name: 'hnsw',
                  engine: 'nmslib',
                  space_type: 'cosinesimil',
                },
              },
              description: {
                type: 'text',
              },
              name: {
                type: 'text',
              },
            },
          },
        },
      } as IndicesCreateRequest;

      try {
        const response = await client.indices.create(params);
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
