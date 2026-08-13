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

import { useEffect } from 'react'
import { select } from 'd3-selection'

export const useRenderToolTip = () => {
  useEffect(() => {
    select('#roadmap')
      .append('div')
      .attr('class', 'generic-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('z-index', '110')
      .style('color', 'rgba(255, 255, 255,1)')
      .style('background-color', 'rgba(46, 47, 48, 0.7)')
      .style('padding-top', '8px')
      .style('padding-bottom', '8px')
      .style('padding-left', '16px')
      .style('padding-right', '16px')
      .style('border-radius', '4px')
      .style('white-space', 'nowrap')
      .style('font-family', 'Montserrat')
      .style('font-size', '12px')
      .style('height', '16px')
      .style('letter-spacing', '0.4px')
  }, [])
}
