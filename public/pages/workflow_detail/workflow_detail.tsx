/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { escape } from 'lodash';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import { APP_PATH, BREADCRUMBS, SHOW_ACTIONS_IN_HEADER} from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import {
  AppState,
  getWorkflow,
  searchModels,
  useAppDispatch,
} from '../../store';
import { ResizableWorkspace } from './resizable_workspace';
import {
  ERROR_GETTING_WORKFLOW_MSG,
  FETCH_ALL_QUERY_BODY,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  getCharacterLimitedString,
} from '../../../common';
import { MountPoint } from '../../../../../src/core/public';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

import {
  constructHrefWithDataSourceId,
  getDataSourceId,
} from '../../utils/utils';

import { getDataSourceEnabled } from '../../services';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {
  setActionMenu: (menuMount?: MountPoint) => void;
}

/**
 * The workflow details page. This is where users will configure, create, and
 * test their created workflows. Additionally, can be used to load existing workflows
 * to view details and/or make changes to them.
 */

export function WorkflowDetail(props: WorkflowDetailProps) {
  const dispatch = useAppDispatch();
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { workflows, errorMessage } = useSelector(
    (state: AppState) => state.workflows
  );

  // selected workflow state
  const workflowId = escape(props.match?.params?.workflowId);
  const workflow = workflows[workflowId];
  const workflowName = getCharacterLimitedString(
    workflow?.name || '',
    MAX_WORKFLOW_NAME_TO_DISPLAY
  );

  const {
    chrome: { setBreadcrumbs },
  } = getCore();
  useEffect(() => {
    setBreadcrumbs(
      SHOW_ACTIONS_IN_HEADER
        ? [
            BREADCRUMBS.TITLE_WITH_REF(
              dataSourceEnabled ? dataSourceId : undefined
            ),
            BREADCRUMBS.WORKFLOW_NAME(workflowName),
            { text: '' },
          ]
        : [
            BREADCRUMBS.FLOW_FRAMEWORK,
            BREADCRUMBS.WORKFLOWS(dataSourceEnabled ? dataSourceId : undefined),
            { text: workflowName },
          ]
    );
  }, [SHOW_ACTIONS_IN_HEADER, dataSourceEnabled, dataSourceId, workflowName]);

  // On initial load:
  // - fetch workflow
  // - fetch available models as their IDs may be used when building flows
  useEffect(() => {
    dispatch(getWorkflow({ workflowId, dataSourceId }));
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY_BODY, dataSourceId }));
  }, []);

  return errorMessage.includes(ERROR_GETTING_WORKFLOW_MSG) ? (
    <EuiFlexGroup direction="column" alignItems="center">
      <EuiFlexItem grow={3}>
        <EuiEmptyPrompt
          iconType={'cross'}
          title={<h2>Oops! We couldn't find that workflow</h2>}
          titleSize="s"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <EuiButton
          style={{ width: '200px' }}
          fill={false}
          href={constructHrefWithDataSourceId(APP_PATH.WORKFLOWS, dataSourceId)}
        >
          Return to home
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  ) : (
    <ReactFlowProvider>
      <EuiPage>
        <EuiPageBody className="workflow-detail stretch-relative">
          <WorkflowDetailHeader
            workflow={workflow}
            setActionMenu={props.setActionMenu}
          />
          <ReactFlowProvider>
            <ResizableWorkspace workflow={workflow} />
          </ReactFlowProvider>
        </EuiPageBody>
      </EuiPage>
    </ReactFlowProvider>
  );
}
