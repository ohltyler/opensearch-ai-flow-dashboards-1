/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState } from 'react';
import 'reactflow/dist/style.css';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../reactflow-styles.scss';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiFieldText,
  EuiTextArea,
} from '@elastic/eui';
import { getCore, getRouteServices } from '../../../services';

export function TestApp() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');

  const onInputChange = (e: any) => {
    setInput(e.target.value);
  };
  const onOutputChange = (e: any) => {
    setOutput(e.target.value);
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={true} style={{ maxHeight: 50 }}>
        <EuiTitle size="m">
          <h3>Test Application</h3>
        </EuiTitle>
      </EuiFlexItem>

      <EuiPanel
        paddingSize="l"
        hasShadow={true}
        hasBorder={true}
        style={{ width: '300px' }}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiText>Input:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFieldText
              placeholder="Type anything..."
              value={input}
              onChange={(e) => onInputChange(e)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButton
              style={{ maxWidth: '50px' }}
              fill={true}
              disabled={!input}
              onClick={() => {
                console.log('sending out input: ', input);
                // TODO: execute input here
              }}
            >
              Submit
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>Output:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextArea
              placeholder="Model response..."
              value={output}
              onChange={(e) => onOutputChange(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiFlexGroup>
  );
}
