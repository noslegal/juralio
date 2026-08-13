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

import throttle from 'lodash/throttle'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { TASK_MENU_CONTEXT } from '../../../app/constants'
import ConfirmStatusChangeContainer from '../../../app/task-details/task-card-header/task-status-menu/ConfirmStatusChangeContainer'
import {
  flatTaskListFromTree,
  getTaskDepth,
} from '../../../services/task/data-provider/task-list-data-provider'
import { clearTour } from '../../../services/tour/tour-actions'
import TaskRenamePopover from '../../data-display/task-cell/TaskRenamePopover'
import { HEIGHT_THRESHOLD_ATTR_NAME } from '../common/constants'
import { getEvent } from '../common/event/event-factory'
import { render } from '../common/render/renderer'
import {
  NEW_TASK_TRANSITION_DURATION,
  TASKMAP_NEW_TASK_FLOW_STARTED,
} from '../common/render/update/interaction/usability-applicator'
import {
  ICICLE_CSS_NAME,
  selectAllCells,
  selectElementById,
  selectElementDatum,
} from '../common/selection/selector'
import styles from './DesktopIcicle.module.css'
import { renderCanvasMapContent } from './helper/canvas-render-helper'
import { renderLevelIndicators } from './helper/level-indicators-helper'
import { getScrollX, getScrollY } from './helper/scroll-position-helper'
import TaskOperationsMenu from './menu/TaskOperationsMenu'
import { createScales } from './scale/desktop-scales'
import { ICICLE_RENDER_COMPLETE_EVENT } from './transition/icicleTransitionConstants'

class DesktopIcicle extends React.Component {
  state = {
    menuAnchor: null,
    menuTask: null,
    taskNameAnchor: null,
    taskNameTask: null,
  }

  canvasRef = React.createRef()

  componentDidMount() {
    this.props.getIcicleRef && this.props.getIcicleRef(this.node)
    this.scales = createScales(
      this.node,
      this.props.partitionData,
      this.props.interactive,
      this.props.interactiveProps,
      this.props.separatorPadding,
      this.props.edgePadding,
      this.props.detailedView
    )
    if (this.props.canvasOptions) {
      renderCanvasMapContent(
        this.props.partitionData,
        this.scales,
        this.props.canvasOptions,
        this.createHighlightMap(),
        this.props.isUserFilterActive,
        this.createNewTasksMap()
      )
    } else {
      this.renderMap()
    }
    if (this.props.recentlyMovedTask) {
    }

    if (this.props.newTask) {
      this.showNameInputForNewTask()
    }
    if (this.props.navigatedFromTaskDetails !== undefined) {
      this.scrollToTask()
    }
  }

  createHighlightMap = () => {
    const highlights = {}
    if (this.props.highlightedTaskList)
      this.props.highlightedTaskList.forEach(
        task => (highlights[task.data.id] = true)
      )
    return highlights
  }

  createNewTasksMap = () => {
    const newTasks = {}
    if (this.props.newTasks)
      this.props.newTasks.forEach(task => (newTasks[task] = true))
    return newTasks
  }

  ensureElementVisible = element => {
    const scrollContainerRight = this.node.scrollLeft + this.node.offsetWidth
    const newElementRight = element.offsetLeft + element.offsetWidth
    const obscuredRight = newElementRight - scrollContainerRight

    const scrollContainerBottom = this.node.scrollTop + this.node.offsetHeight
    const newElementBottom = element.offsetTop + element.offsetHeight
    const obscuredBottom = newElementBottom - scrollContainerBottom

    if (obscuredRight > -this.props.edgePadding) {
      this.node.scrollLeft += obscuredRight + this.props.edgePadding
    }

    if (obscuredBottom > -this.props.edgePadding) {
      this.node.scrollTop += obscuredBottom + this.props.edgePadding
    }
  }

  showNameInputForNewTask = () => {
    const elementToFocus = selectElementById(
      this.node,
      TASKMAP_NEW_TASK_FLOW_STARTED
    )
    const nativeElement = elementToFocus.node()

    if (nativeElement) {
      const taskName = nativeElement.querySelector('[data-task-name]')
      this.ensureElementVisible(nativeElement)

      setTimeout(() => {
        this.setState({
          ...(taskName && {
            taskNameAnchor: taskName,
            taskNameTask: this.props.newTask,
            textValue: '',
          }),
        })
      }, NEW_TASK_TRANSITION_DURATION)
    }
  }

  scrollToTask = () => {
    const elementToFocus = selectElementById(
      this.node,
      parseInt(this.props.navigatedFromTaskDetails)
    )
    const nativeElement = elementToFocus.node()
    if (nativeElement !== null) {
      this.ensureElementVisible(nativeElement)
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.interactive !== this.props.interactive ||
      prevProps.selectionMode !== this.props.selectionMode ||
      prevProps.highlightedTaskList !== this.props.highlightedTaskList ||
      prevProps.partitionData !== this.props.partitionData ||
      prevProps.forceRenderCount !== this.props.forceRenderCount ||
      prevProps.moveTargets !== this.props.moveTargets ||
      prevProps.newTasks !== this.props.newTasks ||
      prevProps.detailedView?.viewMode !== this.props.detailedView?.viewMode
    ) {
      selectAllCells(this.node).remove()
      this.updateLevelCount()
      this.scales = createScales(
        this.node,
        this.props.partitionData,
        this.props.interactive,
        this.props.interactiveProps,
        this.props.separatorPadding,
        this.props.edgePadding,
        this.props.detailedView
      )

      if (this.props.canvasOptions) {
        renderCanvasMapContent(
          this.props.partitionData,
          this.scales,
          this.props.canvasOptions,
          this.createHighlightMap(),
          this.props.isUserFilterActive,
          this.createNewTasksMap()
        )
      } else {
        this.renderMap()
      }
    }

    if (this.props.newTask && this.props.newTask !== prevProps.newTask) {
      this.showNameInputForNewTask()
    }
    if (this.props.recentlyMovedTasks) {
    }
  }

  handleRenameClick = (event, clickedCellData) => {
    const taskCell = this.state.menuAnchor.closest(`.${ICICLE_CSS_NAME}`)
    const taskName = taskCell.querySelector('[data-task-name]')

    this.setState({
      menuAnchor: null,
      menuTask: null,
      ...(taskName && {
        taskNameAnchor: taskName,
        taskNameTask: clickedCellData,
      }),
    })
  }

  scrollTo = () => {
    this.node.scrollLeft = getScrollX(this.scrollPosX, this.node, this.scales)
    this.node.scrollTop = getScrollY(this.scrollPosY, this.node, this.scales)
  }

  handleCellClick = id => {
    const elementToFocus = selectElementById(this.node, id)

    if (
      elementToFocus &&
      !elementToFocus.empty() &&
      elementToFocus.attr(HEIGHT_THRESHOLD_ATTR_NAME) === 'true'
    ) {
      return this.props.cellClickHandler(id)
    }
  }

  renderMap = () => {
    let templateTasks = { tasks: this.props.templateTasks }
    render(
      this.node,
      this.scales,
      this.props.partitionData,
      this.props.parentPropertyName,
      this.props.Template,
      this.props.overviewHeightThreshold,
      this.props.separatorPadding,
      this.props.interactive,
      this.props.selectionMode,
      this.props.highlightedTaskList,
      this.props.showPhaseLabels,
      this.props.showSnackbarHandler,
      this.props.translationHandler,
      this.props.reorderTaskHandler,
      this.props.handleTaskMove,
      this.props.moveTargets,
      this.props.selectedItem,
      this.props.getTaskDetails,
      this.props.getLatestPost,
      this.props.newTasks,
      this.props.dismissNewTasks,
      this.props.mainIcicleRef ? this.props.mainIcicleRef : this.node,
      this.props.userData,
      this.props.levelIndicators,
      this.levelCount,
      this.props.filterTasksByEmailOn,
      this.props.filterMilestone,
      this.props.taskmap?.selectedTask ? this.props.taskmap.selectedTask : null,
      this.props.isReadOnly,
      this.props.isTemplate
        ? flatTaskListFromTree(templateTasks)
        : flatTaskListFromTree(this.props.project),
      this.props.doneTasksToShow,
      this.props.showDone,
      this.props.filteredLabels,
      this.props.detailedView,
      this.props.viewOnly,
      this.props.externalUser
    )

    this.node.dispatchEvent(getEvent(ICICLE_RENDER_COMPLETE_EVENT))
  }

  handleHoverButtonClick = (hoverButton, clickedCellDatum) => {
    const isDisabled = hoverButton.getAttribute('is-disabled')
    if (isDisabled === 'true') {
      return
    }
    const placement = hoverButton.getAttribute('data-create-task-hover-button')
    const indexInParent =
      clickedCellDatum.parent.children.indexOf(clickedCellDatum)

    const hoverButtonHandlers = {
      right: this.props.openChildTaskCreation,
      above: () =>
        this.props.openSiblingTaskCreation(
          true,
          clickedCellDatum.parent,
          indexInParent,
          clickedCellDatum.data.status
        ),
      below: () =>
        this.props.openSiblingTaskCreation(
          false,
          clickedCellDatum.parent,
          indexInParent + 1,
          clickedCellDatum.data.status
        ),
    }
    const handler = hoverButtonHandlers[placement]

    if (handler) {
      handler(clickedCellDatum)
    }
  }

  handleClick = event => {
    this.scrollPosX = event.clientX
    this.scrollPosY = event.clientY

    const elementUnderClick = document.elementFromPoint(
      this.scrollPosX,
      this.scrollPosY
    )
    const clickedCell = elementUnderClick.closest(`.${ICICLE_CSS_NAME}`)

    if (clickedCell) {
      const clickedCellDatum = selectElementDatum(clickedCell)
      const moveButton = elementUnderClick.closest(
        '[data-create-task-move-button]'
      )
      if (clickedCellDatum.parent) {
        const taskParent = clickedCellDatum.parent.data

        let clickedCellData = clickedCellDatum.data
        clickedCellData.parent = taskParent
        clickedCellData.projectId = this.props.partitionData.data.id

        if (this.props.interactive) {
          const optionsButton = elementUnderClick.closest(
            '[data-open-options-menu]'
          )

          if (optionsButton && !this.props.selectedItem) {
            if (window.sessionStorage.getItem('onInitialTutorial')) {
              this.props.actions.clearTour()
              window.sessionStorage.removeItem('onInitialTutorial')
            }
            this.setState({
              menuAnchor: optionsButton,
              menuTask: clickedCellData,
              statusChangeTargetTask: clickedCellData,
            })
            return
          }

          const hoverButton = elementUnderClick.closest(
            '[data-create-task-hover-button]'
          )

          if (moveButton) {
            return this.props.moveTaskToNewParent(clickedCellDatum)
          }

          if (hoverButton) {
            return this.handleHoverButtonClick(hoverButton, clickedCellDatum)
          }
        }

        if (clickedCell.getAttribute(HEIGHT_THRESHOLD_ATTR_NAME) === 'true') {
          const id = clickedCellData.id
          return this.handleCellClick(id)
        }
      } else {
        if (moveButton) {
          return this.props.moveTaskToNewParent(undefined)
        }
      }
    }

    if (!this.props.interactive && this.props.goInteractive) {
      this.props.goInteractive(this.scrollTo)
    }
  }

  cancelNewTaskCreation = () => {
    this.props.cancelNewTaskCreation(this.props.newTask)
    this.setState({
      taskNameAnchor: null,
      taskNameTask: null,
    })
  }

  onUpdateTaskName = (name, taskId) => {
    if (this.props.newTask) {
      this.props.createNewTaskHandler(this.props.newTask, name)
      this.setState({
        taskNameAnchor: null,
        taskNameTask: null,
      })
    } else {
      return this.props.updateNameHandler({ name: name }, taskId)
    }
  }

  onChange = e => {
    this.setState({ textValue: e.target.value })
  }

  createNewTaskHandler = taskId => {
    this.props.createNewTaskHandler(taskId)
  }

  updateLevelCount() {
    if (this.props.partitionData.data.tasks) {
      this.levelCount = getTaskDepth(this.props.partitionData.data) - 1
    }
  }

  setScrollForIndicators = scrollTop => {
    document.querySelectorAll('[id^="level-"]').forEach(indicator => {
      indicator.style.top = scrollTop + 'px'
    })
  }
  scrollIndicatorUpdate = throttle(this.setScrollForIndicators, 200, {
    trailing: true,
  })

  render() {
    this.updateLevelCount()
    return (
      <React.Fragment>
        <div className={styles.container} data-test="container">
          {this.props.canvasOptions ? (
            <div
              data-test="desktop-icicle"
              ref={node => (this.node = node)}
              className={styles['map-minimap']}
              tabIndex="0"
              style={
                this.props.showPhaseLabels ? { overflow: 'visible' } : undefined
              }
            >
              <canvas
                id={this.props.canvasOptions.id}
                ref={this.canvasRef}
                width={this.props.canvasOptions.width}
                height={this.props.canvasOptions.height}
              ></canvas>
            </div>
          ) : (
            <div
              data-test="desktop-icicle"
              ref={node => (this.node = node)}
              className={styles.map}
              onClick={this.handleClick}
              tabIndex="0"
              style={
                this.props.showPhaseLabels ? { overflow: 'visible' } : undefined
              }
              onScroll={e => {
                this.scrollIndicatorUpdate(e.nativeEvent.target.scrollTop)
              }}
            >
              {this.props.levelIndicators &&
                renderLevelIndicators(this.levelCount)}
            </div>
          )}
        </div>
        <TaskOperationsMenu
          isTemplate={this.props.isTemplate}
          handleRenameClick={this.handleRenameClick}
          anchor={this.state.menuAnchor}
          task={this.state.menuTask}
          matterId={
            this.props.partitionData.data.matterId
              ? this.props.partitionData.data.matterId.toString()
              : undefined
          }
          onClose={this.closeMenuHandler}
          isMatterAdmin={this.props.isMatterAdmin}
          taskMenuContext={TASK_MENU_CONTEXT.TASK_MAP}
          viewOnly={this.props.viewOnly}
        />
        <TaskRenamePopover
          anchor={this.state.taskNameAnchor}
          isTemplate={this.props.isTemplate}
          task={this.state.taskNameTask}
          onClose={() => {
            this.setState({
              taskNameAnchor: null,
              taskNameTask: null,
            })
            if (
              this.props.newTask &&
              this.props.newTask.id === TASKMAP_NEW_TASK_FLOW_STARTED
            ) {
              this.cancelNewTaskCreation()
            }
          }}
          updateNameHandler={this.onUpdateTaskName}
        />
        {!this.props.isTemplate && this.state.statusChangeTargetTask ? (
          <ConfirmStatusChangeContainer
            task={this.state.statusChangeTargetTask}
            confirmHandler={this.props.confirmStatusChangeHandler(
              this.state.statusChangeTargetTask.id
            )}
          />
        ) : null}
      </React.Fragment>
    )
  }

  closeMenuHandler = () => this.setState({ menuAnchor: null, menuTask: null })
}

function mapStateToProps(state) {
  return {
    userData: state.auth.data,
    filterTasksByEmailOn: state.taskMapFilter.filterOn,
    filterMilestone: state.taskMapFilter.statusMilestone,
    project: state.project,
    templateTasks: state.template.templateTasks,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: {
      clearTour: bindActionCreators(clearTour, dispatch),
    },
  }
}

DesktopIcicle.propTypes = {
  /** anchor */
  anchor: PropTypes.func,
  /** task */
  task: PropTypes.func,
  /** matterId */
  matterId: PropTypes.func,
  /** onClose */
  onClose: PropTypes.func,
  /** getIcicleRef */
  getIcicleRef: PropTypes.func.isRequired,
  /** partitionData */
  partitionData: PropTypes.object,
  /** interactive */
  interactive: PropTypes.bool.isRequired,
  /** interactiveProps */
  interactiveProps: PropTypes.object,
  /** separatorPadding */
  separatorPadding: PropTypes.number,
  /** data */
  data: PropTypes.func,
  /** cellClickHandler */
  cellClickHandler: PropTypes.func,
  /** parentPropertyName */
  parentPropertyName: PropTypes.string,
  /** Template */
  Template: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  /** overviewHeightThreshold */
  overviewHeightThreshold: PropTypes.number,
  /** goInteractive */
  goInteractive: PropTypes.func,
  mainIcicleRef: PropTypes.object,
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopIcicle)
