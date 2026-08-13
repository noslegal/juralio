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

import { SvgIcon } from '@mui/material'
import React from 'react'

import Draggable from 'react-draggable'
import RoadmapConstants from '../../app/roadmap/helpers/roadmap-constants'

function RoadmapPinStart(props) {
  return (
    <Draggable
      axis="x"
      bounds={{ left: props.leftBound, right: props.rightBound }}
      scale={RoadmapConstants.DRAG_SCALE}
      grid={[props.oneDayPx, 10]}
      onStart={props.onDragStart}
      onDrag={props.onDrag}
      onStop={props.onDragStop}
      disabled={props.viewOnly}
    >
      <div>
        {(props.pinHover || props.isDragging) && !props.viewOnly ? (
          <SvgIcon
            style={{
              scale: '1',
              cursor: props.viewOnly ? '' : 'grab',
            }}
            viewBox="0 0 24 24"
            onClick={props.onClick}
            data-test="roadmap-start-pin"
            className="clickable"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12.522 1.913C7.239 1.913 2.957 6.196 2.957 11.478c0 5.283 4.282 9.565 9.565 9.565 5.283 0 9.565 -4.282 9.565 -9.565 0 -5.283 -4.282 -9.565 -9.565 -9.565Z"
                fill={props.fill}
                stroke={props.stroke}
                strokeWidth="3.8260852173913045"
              />
              <path
                d="M12.779 0.035a11.648 11.648 0 0 0 -0.887 -0.034c-6.339 0 -11.478 5.139 -11.478 11.478s5.139 11.478 11.478 11.478c0.298 0 0.594 -0.011 0.887 -0.034V0.035Z"
                fill="#7C6693"
              />
              <path
                d="M7.773 7.797c0 -0.672 0.537 -1.222 1.195 -1.222s1.195 0.55 1.195 1.222 -0.537 1.222 -1.195 1.222 -1.195 -0.55 -1.195 -1.222Zm1.195 4.889c0.657 0 1.195 -0.55 1.195 -1.222 0 -0.672 -0.537 -1.222 -1.195 -1.222s-1.195 0.55 -1.195 1.222c0 0.673 0.537 1.222 1.195 1.222Zm0 3.666c0.657 0 1.195 -0.55 1.195 -1.222s-0.537 -1.222 -1.195 -1.222S7.774 14.458 7.774 15.13s0.537 1.222 1.195 1.222Zm-3.585 -2.444c-0.657 0 -1.195 0.55 -1.195 1.222s0.537 1.222 1.195 1.222 1.195 -0.55 1.195 -1.222 -0.537 -1.222 -1.195 -1.222Zm0 -1.222c0.657 0 1.195 -0.55 1.195 -1.222 0 -0.672 -0.537 -1.222 -1.195 -1.222s-1.195 0.55 -1.195 1.222c0 0.673 0.537 1.222 1.195 1.222Zm0 -3.666c0.657 0 1.195 -0.55 1.195 -1.222s-0.537 -1.222 -1.195 -1.222 -1.195 0.55 -1.195 1.222 0.537 1.222 1.195 1.222Z"
                fill="black"
                fillOpacity="0.54"
              />
            </svg>
          </SvgIcon>
        ) : (
          <SvgIcon
            style={{
              scale: '1',
              cursor: props.viewOnly ? '' : 'grab',
            }}
            viewBox="0 0 24 24"
            onClick={props.onClick}
            data-test="roadmap-start-pin"
            className="clickable"
          >
            {props.dashed === true ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill={props.fill}
                  stroke={props.stroke}
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9.5"
                  fill={props.fill}
                  stroke={props.stroke}
                  strokeWidth="5"
                />
              </svg>
            )}
          </SvgIcon>
        )}
      </div>
    </Draggable>
  )
}

export default RoadmapPinStart
