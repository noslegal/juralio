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

import styles from '../../../desktop/DesktopIcicle.module.css'
import { ICICLE_CSS_NAME } from '../../selection/selector'

export const enter = dataBoundCells => {
  const cells = dataBoundCells
    .enter()
    .append('div')
    .attr('class', `${styles.cell} ${ICICLE_CSS_NAME}`)

  cells.append('div').attr('class', styles.content)
  return cells.merge(dataBoundCells).filter(cell => {
    return !cell.data.filteredOut
  })
}
