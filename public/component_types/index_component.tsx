/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiText } from '@elastic/eui';
import { Handle, Position } from 'reactflow';

import './model_component.scss';

export function IndexComponent({ data }) {
  const onIndexNameChange = useCallback((event) => {
    data.index_name = event.target.value;
  }, []);

  return (
    <div className="model-component">
      <div>
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <EuiText size="s">Index Name :</EuiText>
        <input
          id="text"
          name="text"
          onChange={onIndexNameChange}
          className="nodrag"
        />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </div>
    </div>
  );
}
