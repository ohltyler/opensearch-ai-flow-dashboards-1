/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiText } from '@elastic/eui';
import { Handle, Position } from 'reactflow';

import './model_component.scss';

export function ModelComponent({ data }) {
  const onModelIdChange = useCallback((event) => {
    data.model_id = event.target.value;
  }, []);

  return (
    <div className="model-component">
      <div>
        <Handle type="target" position={Position.Top} isConnectable={true} />
        <EuiText size="s">Model ID:</EuiText>
        <input
          id="text"
          name="text"
          onChange={onModelIdChange}
          className="nodrag"
        />
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
      </div>
    </div>
  );
}
