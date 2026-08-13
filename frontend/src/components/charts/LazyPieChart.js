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

import { lazy, Suspense } from 'react'

const PieChart = lazy(() =>
  import('@mui/x-charts/PieChart').then(m => ({ default: m.PieChart }))
)

const NullLegend = () => null
const NullOverlay = () => null

const LazyPieChart = ({
  hideLegend = true,
  hideNoDataOverlay = true,
  slots,
  ...rest
}) => {
  const mergedSlots = {
    ...slots,
    ...(hideLegend ? { legend: NullLegend } : {}),
    ...(hideNoDataOverlay ? { noDataOverlay: NullOverlay } : {}),
  }
  return (
    <Suspense fallback={null}>
      <PieChart hideLegend={hideLegend} slots={mergedSlots} {...rest} />
    </Suspense>
  )
}

export default LazyPieChart
