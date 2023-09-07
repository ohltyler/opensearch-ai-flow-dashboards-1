/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiText } from '@elastic/eui';
import { Handle, Position } from 'reactflow';

import './model_component.scss';

export function IngestPipelineComponent({ data }) {
  const onIngestPipelineNameChange = useCallback((event) => {
    data.ingest_pipeline_name = event.target.value;
  }, []);

  return (
    <div className="model-component">
      <div>
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <EuiText size="s">Ingest Pipeline Name :</EuiText>
        <input
          id="text"
          name="text"
          onChange={onIngestPipelineNameChange}
          className="nodrag"
        />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </div>
    </div>
  );
}
