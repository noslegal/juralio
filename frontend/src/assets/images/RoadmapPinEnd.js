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

function RoadmapPinEnd(props) {
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
        {!props.isMilestone &&
        !props.viewOnly &&
        (props.pinHover || props.isDragging) ? (
          <SvgIcon
            style={{
              scale: '1',
              cursor: props.viewOnly ? '' : 'grab',
            }}
            viewBox="0 0 24 24"
            onClick={props.onClick}
            data-test="roadmap-end-pin"
            className="clickable"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                cx="22"
                cy="23"
                r="18.3333"
                fill={props.fill}
                stroke={props.stroke}
                strokeWidth="3.9110561932608694"
                d="M21.511 12.267A9.778 9.778 0 0 1 11.733 22.044A9.778 9.778 0 0 1 1.956 12.267A9.778 9.778 0 0 1 21.511 12.267z"
              />
              <path
                d="M11.47 23.964c0.299 0.023 0.602 0.035 0.907 0.035 6.48 0 11.733 -5.253 11.733 -11.733s-5.253 -11.733 -11.733 -11.733c-0.305 0 -0.607 0.012 -0.907 0.035v23.397Z"
                fill="#7C6693"
              />
              <path
                d="M16.587 16.029c0 0.687 -0.549 1.249 -1.221 1.249s-1.221 -0.562 -1.221 -1.249 0.549 -1.25 1.221 -1.25 1.221 0.563 1.221 1.25Zm-1.221 -4.997c-0.672 0 -1.221 0.562 -1.221 1.25 0 0.687 0.549 1.249 1.221 1.249s1.221 -0.562 1.221 -1.249c0 -0.687 -0.549 -1.25 -1.221 -1.25Zm0 -3.748c-0.672 0 -1.221 0.562 -1.221 1.249s0.549 1.25 1.221 1.25S16.586 9.22 16.586 8.533s-0.549 -1.249 -1.221 -1.249Zm3.664 2.499c0.672 0 1.221 -0.563 1.221 -1.25s-0.549 -1.249 -1.221 -1.249 -1.221 0.562 -1.221 1.249 0.549 1.25 1.221 1.25Zm0 1.249c-0.672 0 -1.221 0.562 -1.221 1.25 0 0.687 0.549 1.249 1.221 1.249s1.221 -0.562 1.221 -1.249c0 -0.687 -0.549 -1.25 -1.221 -1.25Zm0 3.748c-0.672 0 -1.221 0.563 -1.221 1.25s0.549 1.249 1.221 1.249 1.221 -0.562 1.221 -1.249 -0.549 -1.25 -1.221 -1.25Z"
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
            data-test="roadmap-end-pin"
            className="clickable"
          >
            {props.dashed && !props.isMilestone && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            )}
            {!props.dashed && !props.isMilestone && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            {props.isMilestone &&
              !props.viewOnly &&
              (props.pinHover || props.isDragging) && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M0.630887 13.5231C-0.210296 12.6819 -0.210295 11.3181 0.630888 10.4769L10.4769 0.630887C11.3181 -0.210296 12.6819 -0.210295 13.5231 0.630888L23.3691 10.4769C24.2103 11.3181 24.2103 12.6819 23.3691 13.5231L13.5231 23.3691C12.6819 24.2103 11.3181 24.2103 10.4769 23.3691L0.630887 13.5231Z"
                    fill="#7C6693"
                  />
                  <path
                    d="M4.42059 13.1868C3.8598 12.626 3.8598 11.7168 4.42059 11.156L10.9846 4.59198C11.5454 4.03119 12.4546 4.03119 13.0154 4.59198L19.5794 11.156C20.1402 11.7168 20.1402 12.626 19.5794 13.1868L13.0154 19.7508C12.4546 20.3116 11.5454 20.3116 10.9846 19.7508L4.42059 13.1868Z"
                    fill="#CEC9ED"
                  />
                  <path
                    d="M11.4 15.9214C11.4 16.6089 10.86 17.1714 10.2 17.1714C9.54 17.1714 9 16.6089 9 15.9214C9 15.2339 9.54 14.6714 10.2 14.6714C10.86 14.6714 11.4 15.2339 11.4 15.9214ZM10.2 10.9214C9.54 10.9214 9 11.4839 9 12.1714C9 12.8589 9.54 13.4214 10.2 13.4214C10.86 13.4214 11.4 12.8589 11.4 12.1714C11.4 11.4839 10.86 10.9214 10.2 10.9214ZM10.2 7.17139C9.54 7.17139 9 7.73389 9 8.42139C9 9.10889 9.54 9.67139 10.2 9.67139C10.86 9.67139 11.4 9.10889 11.4 8.42139C11.4 7.73389 10.86 7.17139 10.2 7.17139ZM13.8 9.67139C14.46 9.67139 15 9.10889 15 8.42139C15 7.73389 14.46 7.17139 13.8 7.17139C13.14 7.17139 12.6 7.73389 12.6 8.42139C12.6 9.10889 13.14 9.67139 13.8 9.67139ZM13.8 10.9214C13.14 10.9214 12.6 11.4839 12.6 12.1714C12.6 12.8589 13.14 13.4214 13.8 13.4214C14.46 13.4214 15 12.8589 15 12.1714C15 11.4839 14.46 10.9214 13.8 10.9214ZM13.8 14.6714C13.14 14.6714 12.6 15.2339 12.6 15.9214C12.6 16.6089 13.14 17.1714 13.8 17.1714C14.46 17.1714 15 16.6089 15 15.9214C15 15.2339 14.46 14.6714 13.8 14.6714Z"
                    fill="#7C6693"
                  />
                </svg>
              )}
            {props.isMilestone &&
              ((!props.pinHover && !props.isDragging) || props.viewOnly) && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2.61 21.39 12 12 21.39 2.61 12 12 2.61Z"
                    fill={props.fill}
                    stroke={props.stroke}
                    strokeWidth="3.6923076923076925"
                  />
                  <path
                    d="M10.918 12 12 10.918 13.082 12 12 13.082 10.918 12Z"
                    fill={props.fill}
                    stroke={props.stroke}
                    strokeWidth="3.6923076923076925"
                  />
                </svg>
              )}
          </SvgIcon>
        )}
      </div>
    </Draggable>
  )
}

export default RoadmapPinEnd
