/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPONENT_CATEGORY, COMPONENT_CLASS } from '../../../../common';
import { BaseComponent } from '../../base_component';

/**
 * A basic Query placeholder UI component.
 * Does not have any functionality.
 */
export abstract class Query extends BaseComponent {
  constructor() {
    super();
    this.type = COMPONENT_CLASS.QUERY;
    this.label = 'Query';
    this.description = 'An OpenSearch query';
    this.categories = [COMPONENT_CATEGORY.SEARCH];
    this.allowsCreation = false;
    this.baseClasses = [this.type];
    this.inputs = [];
    this.outputs = [];
  }
}
