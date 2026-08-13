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

import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { useRenderMinimap } from './render/render-minimap'
import { useRenderToolTip } from './render/render-tooltip'

const MiniRoadmap = props => {
  const { data, roadMapRef, rangeEnd, viewMode } = props
  const { rangeStart } = data

  useRenderMinimap(
    props.displayTasks?.filter(t => !t.filteredOut),
    data,
    new Date(rangeStart),
    new Date(rangeEnd),
    props.canvasOptions,
    props.getColourMode,
    viewMode
  )

  useRenderToolTip()

  return (
    <Fragment>
      <canvas
        id={props.canvasOptions.id}
        ref={roadMapRef}
        width={props.canvasOptions.width}
        height={props.canvasOptions.height}
      />
    </Fragment>
  )
}

MiniRoadmap.propTypes = {
  /** canvasOptions */
  canvasOptions: PropTypes.object.isRequired,
  /** getColourMode */
  getColourMode: PropTypes.func.isRequired,
}

export default MiniRoadmap
