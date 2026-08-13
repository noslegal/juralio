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

import { Component } from 'react'
import ReactDOM from 'react-dom'

// disable all react-beautiful-dnd development warnings
window['__react-beautiful-dnd-disable-dev-warnings'] = true

// portal approach derived from https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/portal/portal-app.jsx
export const portal = document.createElement('div')

document.body.appendChild(portal)

export class PortalDraggableWraper extends Component {
  render() {
    const { snapshot } = this.props
    const usePortal = snapshot.isDragging
    if (!usePortal) {
      return this.props.children
    }
    // if dragging - put the item in a portal
    return ReactDOM.createPortal(this.props.children, portal)
  }
}
