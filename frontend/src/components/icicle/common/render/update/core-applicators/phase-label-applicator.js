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

import { select } from 'd3-selection'
import { ICICLE_CSS_NAME } from '../../../selection/selector'
import juralioColours from '../../../../../../theme/juralio-colours'

const FADE_DURATION = 225
const DETAIL_FADE_IN_DELAY = FADE_DURATION * 1.0
const DETAIL_FADE_IN_DURATION = FADE_DURATION * 2.0
export const PHASE_LABEL_BACKGROUND_COLOR = juralioColours.phaseLabel.background
const EXPANDED_PHASE_LABEL_BACKGROUND_COLOR =
  juralioColours.phaseLabel.backgroundExpanded

function fadeIn(selection) {
  if (selection && !selection.empty()) {
    selection
      .style('z-index', 2)
      .interrupt()
      .transition()
      .duration(FADE_DURATION)
      .style('opacity', 1.0)
      .style('background-color', EXPANDED_PHASE_LABEL_BACKGROUND_COLOR)
  }
}

let currentHoveredIcicleCell = null

function fadeOut(selection, canFadeFully) {
  if (selection && !selection.empty()) {
    const animation = selection
      .style('z-index', 1)
      .transition()
      .duration(FADE_DURATION)
      .style('background-color', PHASE_LABEL_BACKGROUND_COLOR)

    if (canFadeFully) {
      animation.style('opacity', 0)
    }
  }
}

function scaleIn(selection) {
  if (selection && !selection.empty()) {
    const delay = selection.style('opacity') > 0 ? 0.0 : DETAIL_FADE_IN_DELAY

    selection
      .interrupt()
      .transition()
      .duration(DETAIL_FADE_IN_DURATION)
      .delay(delay)
      .style('opacity', 1.0)
      .style('max-height', '500px')
  }
}

function scaleOut(selection) {
  if (selection && !selection.empty()) {
    selection
      .transition()
      .duration(FADE_DURATION)
      .style('opacity', 0.0)
      .style('max-height', '0px')
  }
}

const getPhaseLabel = () => {
  const selectedTaskCell = select(currentHoveredIcicleCell)
  const phaseLabelId = `#phase-label-${selectedTaskCell.datum().data.id}`
  let phaseLabel = selectedTaskCell.select(phaseLabelId)

  return phaseLabel
}

const getNonFadingPhaseLabel = () => {
  const selectedTaskCell = select(currentHoveredIcicleCell)
  const phaseLabelId = `#non-fading-phase-label-${
    selectedTaskCell.datum().data.id
  }`
  let phaseLabel = selectedTaskCell.select(phaseLabelId)

  return phaseLabel
}

const getPhaseLabelDetail = () => {
  const selectedTaskCell = select(currentHoveredIcicleCell)
  const phaseLabelDetailId = `#phase-label-${
    selectedTaskCell.datum().data.id
  }-detail`
  return selectedTaskCell.select(phaseLabelDetailId)
}

const fadeInPhaseLabel = () => {
  const phaseLabel = getPhaseLabel()
  const nonFadingPhaseLabel = getNonFadingPhaseLabel()
  const detail = getPhaseLabelDetail()
  const validPhaseLabel = phaseLabel && !phaseLabel.empty()

  fadeIn(validPhaseLabel ? phaseLabel : nonFadingPhaseLabel)
  scaleIn(detail)
}

const fadeOutPhaseLabel = () => {
  const phaseLabel = getPhaseLabel()
  const nonFadingPhaseLabel = getNonFadingPhaseLabel()
  const detail = getPhaseLabelDetail()
  const validPhaseLabel = phaseLabel && !phaseLabel.empty()

  currentHoveredIcicleCell = null

  fadeOut(validPhaseLabel ? phaseLabel : nonFadingPhaseLabel, validPhaseLabel)
  scaleOut(detail)
}

const handleMouseOver = event => {
  if (currentHoveredIcicleCell) return
  let target = event.target.closest(`.${ICICLE_CSS_NAME}`)
  if (!target) return
  currentHoveredIcicleCell = target

  fadeInPhaseLabel()
}

const handleMouseOut = event => {
  if (!currentHoveredIcicleCell) return

  let relatedTarget = event.relatedTarget

  while (relatedTarget) {
    if (relatedTarget === currentHoveredIcicleCell) return

    relatedTarget = relatedTarget.parentNode
  }

  fadeOutPhaseLabel()
}

export function applyPhaseLabels(cells) {
  const output = cells

  const levelATasks = output.filter(datum => datum.data.level === 1)
  levelATasks.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut)

  return output
}
