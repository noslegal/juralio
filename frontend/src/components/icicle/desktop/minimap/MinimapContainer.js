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

import { Fade, Grow } from '@mui/material'
import Paper from '@mui/material/Paper'
import React from 'react'
import rawColours from '../../../../theme/raw-colours'
import Icicle from '../DesktopIcicle'
import styles from './minimap.module.css'
import MinimisedMinimap from './MinimisedMinimap'
import Viewport from './viewport/Viewport'

class MinimapContainer extends React.Component {
  state = {}

  setMiniIcicleRef = miniIcicleRef => {
    this.setState({
      miniIcicleRef: miniIcicleRef,
    })
  }

  preventMainIcicleMobileScrolling = () => {
    document.body.style.position = 'fixed'
    this.props.mainIcicleRef.style.overflow = 'hidden'
  }

  enabledMainIcicleMobileScrolling = () => {
    document.body.style.position = 'initial'
    this.props.mainIcicleRef.style.overflow = 'auto'
  }

  onMouseClick = () => this.props.onMouseClickCallback()

  renderContent = () => (
    <React.Fragment>
      <div className={styles['mini-icicle']}>
        <Icicle
          edgePadding={0}
          getIcicleRef={this.setMiniIcicleRef}
          separatorPadding={this.props.separatorPadding}
          partitionData={this.props.partitionData}
          childrenPropertyName={this.props.childrenPropertyName}
          parentPropertyName={this.props.parentPropertyName}
          interactive={false}
          canvasOptions={{ id: 'minimap', width: 184, height: 240 }}
          levelIndicators={false}
          highlightedTaskList={this.props.highlightedTaskList}
          newTasks={this.props.newTasks}
          isUserFilterActive={this.props.isUserFilterActive}
          childDragging={() => {}}
        />
        <Viewport
          mainIcicleRef={this.props.mainIcicleRef}
          miniIcicleRef={this.state.miniIcicleRef}
          partitionData={this.props.partitionData}
        />
      </div>
    </React.Fragment>
  )

  render() {
    const showMinimized = this.props.minimiseMinimap
    return (
      <>
        <Fade in={showMinimized}>
          <Paper
            onTouchStart={this.preventMainIcicleMobileScrolling}
            onTouchEnd={this.enabledMainIcicleMobileScrolling}
            onClick={this.onMouseClick}
            className={styles['minimised-minimap-container']}
            data-test="icicle-minimap-minimized"
            elevation={2}
          >
            <MinimisedMinimap />
          </Paper>
        </Fade>

        <Grow
          in={!showMinimized}
          style={{
            backgroundColor: this.props.isTemplate
              ? rawColours.minimap.template
              : rawColours.minimap.workstream,
            transformOrigin: '100% 100%',
          }}
        >
          <Paper
            onTouchStart={this.preventMainIcicleMobileScrolling}
            onTouchEnd={this.enabledMainIcicleMobileScrolling}
            className={styles['minimap-container']}
            data-test="icicle-minimap"
            elevation={2}
          >
            {this.renderContent()}
          </Paper>
        </Grow>
        <Grow in={!showMinimized} style={{ transformOrigin: '100% 100%' }}>
          <Paper
            className={styles['minimised-minimap-container']}
            data-test="icicle-minimap-maximized"
            elevation={2}
            onClick={this.onMouseClick}
          >
            <MinimisedMinimap inverted />
          </Paper>
        </Grow>
      </>
    )
  }
}

export default MinimapContainer
