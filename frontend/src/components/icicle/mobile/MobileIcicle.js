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
import React, { Component } from 'react'
import TaskMapZeroState from '../../../app/task-map/zero-state/TaskMapZeroState'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import { getNodeById } from '../common/data/data-provider'
import { render } from '../common/render/renderer'
import { selectAllCells } from '../common/selection/selector'
import { applyGesture } from './gesture/gesture-applicator'
import { determineFocusedItemFromGesture } from './gesture/gesture-helper'
import { addCellTapInteraction } from './interaction/cell-tap-interaction'
import styles from './MobileIcicle.module.css'
import { createScales } from './scale/mobile-scales'
import { applyTransition } from './transition/transition-applicator'

export class MobileIcicle extends Component {
  constructor(props) {
    super(props)
    const itemNode = getNodeById(this.props.id, this.props.partitionData)
    this.focusedItem =
      this.props.id && itemNode ? itemNode.parent : this.props.partitionData
  }

  componentDidMount() {
    this.renderMap()
  }

  componentDidUpdate() {
    selectAllCells(this.node).remove()

    this.renderMap()
  }

  setNodeRef = element => {
    this.node = element
  }

  setContainerRef = element => {
    this.container = element
  }

  zoomToItem = (item, direction) => {
    const itemToFocus = determineFocusedItemFromGesture(
      item,
      direction,
      this.props.partitionData
    )

    if (itemToFocus) {
      this.focusedItem = itemToFocus

      const scales = createScales(this.node, this.focusedItem)
      applyTransition(
        this.node,
        scales,
        this.props.Template,
        this.props.overviewHeightThreshold
      )
    }
  }

  onCellTapped = (event, item) => {
    if (item.parent && item.parent.data.id === this.focusedItem.data.id) {
      this.props.cellClickHandler(item.data.id)
    } else if (item.parent) {
      this.zoomToItem(item.parent)
    }
  }

  renderMap() {
    if (this.node) {
      const scales = createScales(this.node, this.focusedItem)
      render(
        this.node,
        scales,
        this.props.partitionData,
        this.props.parentPropertyName,
        this.props.Template,
        this.props.overviewHeightThreshold,
        undefined,
        undefined,
        undefined,
        this.props.highlightedTaskList,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.props.filterTasksByEmailOn,
        undefined,
        undefined,
        flatTaskListFromTree(this.props.project),
        undefined,
        undefined,
        this.props.filteredLabels
      )
      applyGesture(this.node, this.container, this.zoomToItem)
      addCellTapInteraction(this.node, this.onCellTapped)
    }
  }

  render() {
    const { t } = this.props
    const shouldShowZeroState =
      !this.props.partitionData ||
      !this.props.partitionData.children ||
      this.props.partitionData.children.length === 0

    return shouldShowZeroState ? (
      <TaskMapZeroState
        title={t(
          this.props.isTemplate
            ? 'taskmapZeroState.template.title'
            : 'taskmapZeroState.title'
        )}
        caption={t('taskmapZeroState.caption')}
        createFirstTask={this.openFirstTaskCreation}
        mobile
      />
    ) : (
      <div
        className={styles.container}
        ref={this.setContainerRef}
        data-test="mobile-icicle-container"
      >
        <div
          className={styles.root}
          data-test="mobile-icicle"
          ref={this.setNodeRef}
        />
      </div>
    )
  }
}

MobileIcicle.propTypes = {
  data: PropTypes.object.isRequired,
  childrenPropertyName: PropTypes.string.isRequired,
  parentPropertyName: PropTypes.string.isRequired,
  overviewHeightThreshold: PropTypes.number.isRequired,
}

export default MobileIcicle
