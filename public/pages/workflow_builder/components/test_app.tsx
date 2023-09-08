/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import 'reactflow/dist/style.css';
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

  // TODO: need to get these from global state somewhere
  const modelId = '4fllcYoBVSP1rMST8tG5';
  const indexName = 'demo-index';
  const k = 3;

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
              onClick={async () => {
                const searchBody = {
                  _source: ['name', 'description'],
                  query: {
                    bool: {
                      should: [
                        {
                          script_score: {
                            query: {
                              neural: {
                                desc_v: {
                                  query_text: input,
                                  model_id: modelId,
                                  k: k,
                                },
                              },
                            },
                            script: {
                              source: '_score * 1.5',
                            },
                          },
                        },
                        {
                          script_score: {
                            query: {
                              match: {
                                description: input,
                              },
                            },
                            script: {
                              source: '_score * 1.7',
                            },
                          },
                        },
                      ],
                    },
                  },
                };

                const searchResp = await getRouteServices().searchIndex(
                  indexName,
                  searchBody
                );

                if (searchResp.statusCode === 200) {
                  const parsedResp =
                    searchResp.body.hits.hits[0]._source.description;
                  setOutput(parsedResp);
                } else {
                  getCore().notifications.toasts.addDanger(
                    'Search operation failed'
                  );
                }
              }}
            >
              Search
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
