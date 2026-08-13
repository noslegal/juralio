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
import styles from './Viewport.module.css'
import {
  getViewportWidth,
  getViewportHeight,
  getInteractiveIcicleScrollX,
  getInteractiveIcicleScrollY,
  getViewportScrollX,
  getViewportScrollY,
} from './viewport-helper'
import Draggable from 'react-draggable'

export default class Viewport extends React.Component {
  state = {
    viewportScrollX: 0,
    viewportScrollY: 0,
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeViewPort)
  }

  componentDidUpdate(previousProps) {
    if (
      previousProps.mainIcicleRef !== this.props.mainIcicleRef ||
      previousProps.miniIcicleRef !== this.props.miniIcicleRef ||
      previousProps.partitionData !== this.props.partitionData
    ) {
      this.resizeViewPort()
    }
  }

  componentWillUnmount() {
    if (this.props.mainIcicleRef) {
      this.props.mainIcicleRef.onscroll = null
    }
    window.removeEventListener('resize', this.resizeViewPort)
  }

  resizeViewPort = () => {
    this.setState({
      viewportWidth: getViewportWidth(
        this.props.mainIcicleRef,
        this.props.miniIcicleRef
      ),
      viewportHeight: getViewportHeight(
        this.props.mainIcicleRef,
        this.props.miniIcicleRef
      ),
    })
    this.props.mainIcicleRef.onscroll = this.relocateViewport
    this.relocateViewport()
  }

  relocateViewport = () => {
    this.setState({
      viewportScrollX: getViewportScrollX(
        this.props.mainIcicleRef.scrollLeft,
        this.props.mainIcicleRef,
        this.props.miniIcicleRef
      ),
      viewportScrollY: getViewportScrollY(
        this.props.mainIcicleRef.scrollTop,
        this.props.mainIcicleRef,
        this.props.miniIcicleRef
      ),
    })
  }

  onDrag = (event, ui) => {
    const interactiveMapX = getInteractiveIcicleScrollX(
      ui.x,
      this.props.mainIcicleRef,
      this.props.miniIcicleRef
    )

    const interactiveMapY = getInteractiveIcicleScrollY(
      ui.y,
      this.props.mainIcicleRef,
      this.props.miniIcicleRef
    )
    this.props.mainIcicleRef.scrollLeft = interactiveMapX
    this.props.mainIcicleRef.scrollTop = interactiveMapY
  }

  render() {
    return (
      <Draggable
        bounds="parent"
        onDrag={this.onDrag}
        position={{
          x: this.state.viewportScrollX,
          y: this.state.viewportScrollY,
        }}
      >
        <div
          className={styles['viewport']}
          style={{
            width: this.state.viewportWidth || 0,
            height: this.state.viewportHeight || 0,
          }}
        />
      </Draggable>
    )
  }
}
