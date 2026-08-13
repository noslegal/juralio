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
import juralioColours from '../../../../../../theme/juralio-colours'
import SimpleChip from '../../../../../../components/data-display/simple-chip/SimpleChip'

export const renderDraftFinalChip = (t, finalised, selected = false) => {
  const backgroundColor = finalised
    ? juralioColours.taskCell.background.done
    : juralioColours.taskCell.background.inProgress

  const chipOptions = {
    dataTest: 'publish-status',
    color: selected
      ? juralioColours.whiteText.primary
      : juralioColours.darkText.primary,
    backgroundColor: selected
      ? juralioColours.noteStatusSelected.dark
      : backgroundColor,
  }

  if (!finalised) {
    chipOptions.maxWidth = 64
  }
  return (
    <SimpleChip
      text={finalised ? t('postMenu.final') : t('postMenu.draft')}
      options={chipOptions}
    />
  )
}
