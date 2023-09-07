/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EuiPage, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { CoreServicesContext } from '../../core_services';
import { CoreStart } from '../../../../../src/core/public';
import { BREADCRUMBS } from '../../utils';
import { TestApp, Workspace } from './components';

import './reactflow-styles.scss';
import './workspace.scss';

export function WorkflowBuilder() {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.AI_APPLICATION_BUILDER,
      BREADCRUMBS.WORKFLOW_BUILDER,
    ]);
  });

  return (
    <EuiPage>
      <div className="dndFlow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper">
            <EuiFlexGroup direction="row">
              <EuiFlexGroup
                direction="column"
                gutterSize="l"
                className="workspace"
              >
                <EuiFlexItem grow={true}>
                  <Workspace />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="l" />
              <EuiFlexItem
                grow={true}
                style={{ marginLeft: '100px', marginTop: '2px' }}
              >
                <TestApp />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </ReactFlowProvider>
      </div>
    </EuiPage>
  );
}
