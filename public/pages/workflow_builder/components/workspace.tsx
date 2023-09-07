/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../reactflow-styles.scss';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import { getCore, getRouteServices } from '../../../services';
import { COMPONENT_TYPES } from '../../../utils';
import { ModelComponent } from '../../../component_types';

const initialNodes = [
  {
    id: 'model',
    position: { x: 100, y: 100 },
    data: { label: 'Deployed Model ID' },
    type: COMPONENT_TYPES.MODEL,
    style: {
      background: 'white',
    },
  },
  {
    id: '2',
    position: { x: 100, y: 200 },
    data: { label: 'OpenAI Embedding Model (encode input to vector)' },
    type: 'embeddings',
    style: {
      background: 'white',
    },
  },
  {
    id: '3',
    position: { x: 200, y: 300 },
    data: { label: 'kNN plugin (similarity search with vector)' },
    type: 'default',
    style: {
      background: 'white',
    },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const initialEdges = [
  { id: 'e1-2', source: 'model', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

// Need to define outside of a component, or use useMemo.
// See https://reactflow.dev/docs/guides/custom-nodes/#adding-the-node-type
const componentTypes = { [COMPONENT_TYPES.MODEL]: ModelComponent };

export function Workspace() {
  const workspaceRef = useRef(null);
  const [modelId, setModelId] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const extractModelId = () => {
    nodes.forEach((node) => {
      if (node.type === COMPONENT_TYPES.MODEL) {
        setModelId(node.data.model_id);
      }
    });
  };

  const updateInputState = () => {
    extractModelId();
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // Fetch bounds based on the ref'd component in below jsx
      const reactFlowBounds = workspaceRef.current.getBoundingClientRect();

      // Get type/label from the event metadata
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const color = 'white';

      // adjust bounds position hardcoded for now
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left - 80,
        y: event.clientY - reactFlowBounds.top - 90,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label },
        style: {
          background: color,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <EuiFlexItem grow={true}>
      <EuiFlexGroup
        direction="column"
        gutterSize="m"
        justifyContent="spaceBetween"
        ref={workspaceRef}
      >
        <EuiFlexItem grow={true} style={{ maxHeight: 50 }}>
          <EuiTitle size="m">
            <h3>Workspace</h3>
          </EuiTitle>
        </EuiFlexItem>

        <EuiFlexItem
          style={{
            borderStyle: 'groove',
            borderColor: 'gray',
            borderWidth: '1px',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={componentTypes}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText>
            <b>Model ID: </b>
            {modelId}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem
          style={{ height: 50, maxWidth: 100, marginBottom: 0 }}
          grow={false}
        >
          <EuiButton
            fill={true}
            onClick={async () => {
              updateInputState();
            }}
          >
            Save
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem
          style={{ height: 50, maxWidth: 100, marginBottom: 0 }}
          grow={false}
        >
          <EuiButton
            fill={true}
            onClick={async () => {
              // Create ingest pipeline
              const createIngestPipelineResp = await getRouteServices().createIngestPipeline(
                'test-model-id'
              );
              if (createIngestPipelineResp.statusCode === 200) {
                getCore().notifications.toasts.addSuccess(
                  'Ingest pipeline created successfully'
                );
              } else {
                getCore().notifications.toasts.addDanger(
                  'Ingest pipeline failed to create'
                );
              }

              // Create index
              const createIndexResp = await getRouteServices().createIndex(
                'test-index-name'
              );
              if (createIndexResp.statusCode === 200) {
                getCore().notifications.toasts.addSuccess(
                  'Index created successfully'
                );
              } else {
                getCore().notifications.toasts.addDanger(
                  'Index failed to create'
                );
              }
            }}
          >
            Provision
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
}
