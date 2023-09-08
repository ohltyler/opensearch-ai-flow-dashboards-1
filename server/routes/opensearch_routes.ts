/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  IOpenSearchDashboardsResponse,
} from '../../../../src/core/server';
import {
  INGEST_PIPELINE_PATH,
  INDEX_PATH,
  REINDEX_PATH,
  SEARCH_PATH,
} from '../../common';
import {
  IndicesCreateRequest,
  IngestPutPipelineRequest,
  ReindexRequest,
  SearchRequest,
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
      // TODO: remove hardcoded field map
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
      // TODO: remove hardcoded index settings
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
                  engine: 'lucene',
                  space_type: 'l2',
                },
              },
              name_v: {
                type: 'knn_vector',
                dimension: 384,
                method: {
                  name: 'hnsw',
                  engine: 'lucene',
                  space_type: 'l2',
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

  router.post(
    {
      path: REINDEX_PATH,
      validate: {
        body: schema.object({
          source_index: schema.string(),
          dest_index: schema.string(),
        }),
      },
    },
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { source_index, dest_index } = req.body;
      const params = {
        body: {
          source: {
            index: source_index,
          },
          dest: {
            index: dest_index,
          },
        },
      } as ReindexRequest;

      try {
        const response = await client.reindex(params);
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

  router.post(
    {
      path: `${SEARCH_PATH}/{index_name}`,
      validate: {
        params: schema.object({
          index_name: schema.string(),
        }),
        body: schema.any(),
      },
    },
    async (context, req, res): Promise<IOpenSearchDashboardsResponse<any>> => {
      const client = context.core.opensearch.client.asCurrentUser;
      const { index_name } = req.params;
      const body = req.body;

      const params = {
        index: index_name,
        body: body,
      } as SearchRequest;

      try {
        const response = await client.search(params);
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
