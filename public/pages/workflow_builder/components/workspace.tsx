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
} from '@elastic/eui';
import { getCore, getRouteServices } from '../../../services';
import { COMPONENT_TYPES } from '../../../utils';
import {
  IndexComponent,
  IngestPipelineComponent,
  ModelComponent,
} from '../../../component_types';

const initialNodes = [
  {
    id: 'semantic-search',
    position: { x: 40, y: 10 },
    data: { label: 'Semantic Search' },
    type: 'group',
    style: {
      height: 100,
      width: 700,
    },
  },
  {
    id: 'model',
    position: { x: 25, y: 25 },
    data: { label: 'Deployed Model ID' },
    type: COMPONENT_TYPES.MODEL,
    style: {
      background: 'white',
    },
    parentNode: 'semantic-search',
    extent: 'parent',
  },
  {
    id: 'ingest-pipeline',
    position: { x: 262, y: 25 },
    data: { label: 'Ingest Pipeline Name' },
    type: COMPONENT_TYPES.INGEST_PIPELINE,
    style: {
      background: 'white',
    },
    parentNode: 'semantic-search',
    extent: 'parent',
  },
  {
    id: 'index',
    position: { x: 500, y: 25 },
    data: { label: 'Index Name' },
    type: COMPONENT_TYPES.INDEX,
    style: {
      background: 'white',
    },
    parentNode: 'semantic-search',
    extent: 'parent',
  },
] as Node<
  {
    label: string;
  },
  string | undefined
>[];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'model',
    target: 'ingest-pipeline',
    style: {
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
    },
  },
  {
    id: 'e2-3',
    source: 'ingest-pipeline',
    target: 'index',
    style: {
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
    },
  },
] as Edge<any>[];

// Need to define outside of a component, or use useMemo.
// See https://reactflow.dev/docs/guides/custom-nodes/#adding-the-node-type
const componentTypes = {
  [COMPONENT_TYPES.MODEL]: ModelComponent,
  [COMPONENT_TYPES.INGEST_PIPELINE]: IngestPipelineComponent,
  [COMPONENT_TYPES.INDEX]: IndexComponent,
};

// used in the component for when new nodes are dragged in, generating a new global ID
let id = 0;
const getId = () => `dndnode_${id++}`;

export function Workspace() {
  const workspaceRef = useRef(null);
  const [modelId, setModelId] = useState<string>('');
  const [ingestPipelineName, setIngestPipelineName] = useState<string>('');
  const [indexName, setIndexName] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const updateInputState = () => {
    nodes.forEach((node) => {
      switch (node.type) {
        case COMPONENT_TYPES.MODEL: {
          setModelId(node.data.model_id);
          break;
        }
        case COMPONENT_TYPES.INGEST_PIPELINE: {
          setIngestPipelineName(node.data.ingest_pipeline_name);
          break;
        }
        case COMPONENT_TYPES.INDEX: {
          setIndexName(node.data.index_name);
        }
      }
    });
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
            fitView
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
        <EuiFlexItem grow={false}>
          <EuiText>
            <b>Ingest Pipeline Name: </b>
            {ingestPipelineName}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText>
            <b>Index Name: </b>
            {indexName}
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
