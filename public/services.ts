/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../src/plugins/opensearch_dashboards_utils/public';
import { CoreStart } from '../../../src/core/public';
import { RouteServices } from './route_services';

export const [getCore, setCore] = createGetterSetter<CoreStart>('Core');

export const [getRouteServices, setRouteServices] = createGetterSetter<
  RouteServices
>('');

// eslint-disable-next-line import/no-default-export
export default {
  getCore,
  getRouteServices,
};
