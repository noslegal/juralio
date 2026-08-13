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

import { lazy } from 'react'

const RETRY_DELAY_MS = 500
const MAX_RETRIES = 2

// Dynamic chunk imports can transiently fail to fetch (a flaky network, or a
// new deploy invalidating the previous build's chunk URLs). A bare lazy() then
// throws and trips the app-wide error boundary in AppContainer, leaving the
// user on the "Something has gone wrong" page. Retry the import a couple of
// times before giving up so a transient failure recovers on its own.
const lazyWithRetry = importFn =>
  lazy(async () => {
    let lastError
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }
    throw lastError
  })

export default lazyWithRetry
