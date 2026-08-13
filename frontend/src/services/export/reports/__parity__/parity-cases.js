/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import activeUsers from './fixtures/active-users'
import clientCosts from './fixtures/client-costs'
import costs from './fixtures/costs'
import deletedOrgs from './fixtures/deleted-orgs'
import templateTaskList from './fixtures/template-task-list'
import workstreamTaskList from './fixtures/workstream-task-list'

// i18n stub: reports render the last translation-key segment, which is fine
// for parity — both writers see identical strings — and keeps sheet names
// under Excel's 31-char limit. ClientCosts calls t(key, default, opts) so the
// single-arg shape covers every call site.
export const tStub = key => String(key).split('.').pop()

// Several builders read new Date() (downloaded-by text, roadmap now-based
// positioning, client-costs exportedDate). Both capture and comparison runs
// freeze the clock to this instant so content is identical across runs.
export const FROZEN_NOW = '2025-06-01T12:00:00Z'

export const freezeClock = () => {
  jest.useFakeTimers({
    now: new Date(FROZEN_NOW),
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'queueMicrotask',
      'nextTick',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  })
}

export const parityCases = [
  ...deletedOrgs,
  ...activeUsers,
  ...templateTaskList,
  ...costs,
  ...clientCosts,
  ...workstreamTaskList,
]
