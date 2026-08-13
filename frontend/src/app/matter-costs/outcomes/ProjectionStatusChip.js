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

import React from 'react'
import juralioColours from '../../../theme/juralio-colours'
import SimpleChip from '../../../components/data-display/simple-chip/SimpleChip'

const ProjectionStatusChip = props => {
  const { isSnapshot, isRetired, liveMode } = props

  return (
    <SimpleChip
      text={
        liveMode
          ? 'Live'
          : isSnapshot && !isRetired
            ? 'Finalised'
            : isRetired
              ? 'Retired'
              : 'Draft'
      }
      options={{
        dataTest: 'projection-status-chip',
        color: juralioColours.darkText.secondary,
        backgroundColor: liveMode
          ? juralioColours.taskCell.background.filteredIn.inProgress
          : isSnapshot && !isRetired
            ? juralioColours.taskCell.background.filteredIn.done
            : isRetired
              ? juralioColours.taskCell.background.notRequired
              : juralioColours.taskCell.background.filteredIn.notStarted,
        minWidth: 57,
        maxWidth: 75,
        height: 18,
      }}
    />
  )
}
export default ProjectionStatusChip
