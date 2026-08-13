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

import stringify from 'json-stringify-safe'
import isEqual from 'lodash/isEqual'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import {
  CONFIG,
  MINI_MAP_VISIBILITY_THRESHOLD,
  TASK_MAP_VIEW_MODE_ENUM,
  TASK_STATUS,
} from '../../../app/constants'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import {
  disableImmediateAdd as disableImmediateAddProject,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../app/project/project-actions'
import TaskmapFilterZeroState from '../../../app/task-map/zero-state/TaskmapFilterZeroState'
import TaskMapZeroState from '../../../app/task-map/zero-state/TaskMapZeroState'
import { disableImmediateAdd as disableImmediateAddTemplate } from '../../../app/template/template-actions'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import juralioSizes from '../../../theme/juralio-sizes'
import { getPartitionData } from '../common/data/data-provider'
import { TASKMAP_NEW_TASK_FLOW_CONFIRMED } from '../common/render/update/interaction/usability-applicator'
import DesktopIcicle from './DesktopIcicle'
import {
  createNewTaskPlaceholder,
  getStatusForSiblingTask,
  getTaskFlatList,
} from './helper/data-tree-helper'
import {
  filterTaskByLabel,
  filterTasksByEmail,
  filterTasksByMilestone,
} from './helper/filter-tasks/filter-tasks'
import MiniMapContainer from './minimap/MinimapContainer'
import { applyTransition } from './transition/icicleTransition'
import TaskCell from '../../data-display/task-cell/TaskCell'

const INTER_PHASE_PADDING = 27
const COMPACT_INTER_PHASE_PADDING = 5

class DesktopIcicleContainer extends React.Component {
  constructor(props) {
    super(props)
    const partitionData = this.getUpdatedPartitionData()
    this.state = {
      newTask: null,
      interactive: !!this.props.interactiveMode,
      minimiseMinimap: false,
      partitionData: partitionData,
      taskCount: getTaskFlatList(partitionData).length,
      mainIcicleRef: undefined,
      highlightedTaskList: undefined,
    }
    this.prevScrollPosition = undefined
  }
  //this is used to stop issues with wrong zero state showing with the filters
  filterToggle = false
  componentDidMount() {
    this.filterToggle = false
    if (
      this.props.immediateAddTaskProject ||
      this.props.immediateAddTaskTemplate
    ) {
      this.openFirstTaskCreation()
    }

    this.filterTasksByUser()
    this.filterTasksByMilestone()
  }

  componentWillUnmount = () => this.resetImmediateAdd()

  resetImmediateAdd() {
    if (this.props.immediateAddTaskProject)
      this.props.actions.exitAddingProjectTaskHandler()
    else if (this.props.immediateAddTaskTemplate)
      this.props.actions.exitAddingTemplateTaskHandler()
  }

  componentDidUpdate(prevProps) {
    this.filterToggle = false
    if (
      stringify(this.props.interactiveProps) !==
        stringify(prevProps.interactiveProps) ||
      stringify(this.props.data) !== stringify(prevProps.data) ||
      stringify(this.props.taskmap) !== stringify(prevProps.taskmap) ||
      this.props.isReadOnly !== prevProps.isReadOnly
    ) {
      const { newTask } = this.state
      if (
        (this.state.taskCount < CONFIG.PROJECT_TASK_LIMIT - 1 &&
          !isEqual(
            this.props.project.taskCounts,
            prevProps.project.taskCounts
          )) ||
        (this.props.isTemplate &&
          this.state.taskCount < CONFIG.PROJECT_TASK_LIMIT - 1)
      ) {
        if (this.props.isReadOnly !== false) {
          this.autoCreateNextTask(newTask)
        }
      }

      const partitionData = this.getUpdatedPartitionData()
      this.setState(
        {
          partitionData: partitionData,
          taskCount: getTaskFlatList(partitionData).length,
        },
        () => {
          this.filterTasksByUser()
          this.filterTasksByMilestone()
        }
      )
    }

    if (prevProps.emailToFilterTasks !== this.props.emailToFilterTasks) {
      this.filterTasksByUser()
    }
    if (prevProps.statusMilestone !== this.props.statusMilestone) {
      this.filterTasksByMilestone()
    }

    if (
      prevProps.statusDoneToFilterTasks !==
        this.props.statusDoneToFilterTasks ||
      prevProps.statusNotStartedToFilterTasks !==
        this.props.statusNotStartedToFilterTasks ||
      prevProps.statusNotRequiredToFilterTasks !==
        this.props.statusNotRequiredToFilterTasks
    ) {
      this.props.actions.fetchProjectWithPostsAndTaskTeam(
        this.props.project.matterId,
        this.props.project.id
      )
      this.filterToggle = true
      this.updatePartitionDataState()
    }
  }

  filterTasksByUser = () => {
    if (this.props.emailToFilterTasks) {
      let {
        taskMemberOf,
        following,
        logicOperator,
        isTemplate,
        selectionMode,
      } = this.props
      if (!isTemplate && !selectionMode) {
        this.setState({
          highlightedTaskList: filterTasksByEmail(
            this.state.partitionData,
            this.props.emailToFilterTasks,
            this.props.matterTeam,
            { taskMemberOf, following, logicOperator }
          ),
        })

        if (this.props.statusMilestone) {
          this.multipleHighlightFilters()
        }
      }
    }
  }

  filterTasksByMilestone = () => {
    if (this.props.statusMilestone) {
      let { selectionMode } = this.props
      if (!selectionMode) {
        this.setState({
          highlightedTaskList: filterTaskByLabel(
            filterTasksByMilestone(
              this.state.partitionData,
              this.props.statusMilestone
            ),
            this.props.filteredLabels
          ),
        })
      }
      if (this.props.emailToFilterTasks) {
        this.multipleHighlightFilters()
      }
    }
  }

  multipleHighlightFilters = () => {
    let { taskMemberOf, following, logicOperator } = this.props
    var emailFilterList = filterTasksByEmail(
      this.state.partitionData,
      this.props.emailToFilterTasks,
      this.props.matterTeam,
      { taskMemberOf, following, logicOperator }
    )

    var milestoneAndEmailFilterList = emailFilterList.filter(
      task => task.data.isMilestone === this.props.statusMilestone
    )
    this.setState({
      highlightedTaskList: milestoneAndEmailFilterList,
    })
  }

  autoCreateNextTask = newTask => {
    if (newTask) {
      const insertionIndex = newTask.parent.tasks.findIndex(
        t => t.id === newTask.id
      )

      const projectTasks = flatTaskListFromTree(this.props.project)
      let siblings = 0

      const foundTask = projectTasks.find(task => task.id === newTask.parent.id)
      if (foundTask) {
        siblings = foundTask.tasks.length
      } else if (newTask.level === 1) {
        //level A
        const levelATasks = projectTasks.filter(task => task.level === 1).length
        siblings = levelATasks
      } else {
        siblings = newTask.parent.tasks.length
      }

      if (insertionIndex !== -1 && siblings < CONFIG.SUBTASK_LIMIT) {
        const newTaskList = flatTaskListFromTree(this.props.data)

        let newTaskParentInData = null

        if (newTask.level === 1) {
          newTaskParentInData = this.props.data
        } else {
          newTaskParentInData = newTaskList.find(
            t => t.id === newTask.parent.id
          )
        }
        if (newTaskParentInData) {
          this.openSiblingTaskCreation(
            false,
            { data: newTaskParentInData },
            insertionIndex + 1
          )
        } else {
          this.setState({ newTask: null })
        }
      } else {
        this.setState({ newTask: null })
      }
    }
  }

  goInteractive = scrollToClickedPosition => {
    applyTransition(this.state.mainIcicleRef, () => {
      this.setState({ interactive: true })
      if (this.props.interactiveModeCallback) {
        this.props.interactiveModeCallback()
      }
      this.prevScrollPosition = null
      scrollToClickedPosition()
    })
  }

  onMouseClickMinimap = () => {
    this.setState({
      minimiseMinimap: !this.state.minimiseMinimap,
    })
  }

  renderMinimap = () => {
    return this.state.interactive &&
      this.state.taskCount >= MINI_MAP_VISIBILITY_THRESHOLD ? (
      <MiniMapContainer
        isTemplate={this.props.isTemplate}
        separatorPadding={4}
        partitionData={this.state.partitionData}
        childrenPropertyName={this.props.childrenPropertyName}
        parentPropertyName={this.props.parentPropertyName}
        mainIcicleRef={this.state.mainIcicleRef}
        minimiseMinimap={this.state.minimiseMinimap}
        onMouseClickCallback={this.onMouseClickMinimap}
        highlightedTaskList={this.state.highlightedTaskList}
        isUserFilterActive={
          this.props.isUserFilterActive && !this.props.isTemplate
        }
        newTasks={this.props.newTasks}
      />
    ) : null
  }

  setMainIcicleRef = mainIcicleRef => {
    this.setState({
      mainIcicleRef: mainIcicleRef,
    })
  }

  getUpdatedPartitionData = (data = this.props.data) => {
    if (
      this.props.matterId &&
      !this.props.isMatterTeamLoaded &&
      !this.props.immediateAddTaskProject
    ) {
      this.props.actions.fetchTeamHandler(this.props.matterId, false, true)
    }
    return getPartitionData(data, this.props.childrenPropertyName)
  }

  updatePartitionDataState = (data = this.props.data) => {
    let updatedData = this.getUpdatedPartitionData(data)
    this.setState(
      {
        partitionData: updatedData,
      },
      () => {
        this.filterTasksByMilestone()
        this.filterTasksByUser()
      }
    )
  }

  openChildTaskCreation = parentDatum => {
    const parentTask = parentDatum.data
    const newTask = createNewTaskPlaceholder(
      parentTask.level + 1,
      parentTask,
      parentTask.projectId,
      parentTask.status === TASK_STATUS.IN_PROGRESS
        ? TASK_STATUS.NOT_STARTED
        : parentTask.status
    )
    parentTask.tasks.push(newTask)
    this.updatePartitionDataState(this.state.partitionData.data)
    this.setState({ newTask: newTask })
  }

  openFirstTaskCreation = () => {
    const data = this.state.partitionData.data
    const newTask = createNewTaskPlaceholder(
      1,
      data,
      data.id,
      this.props.isTemplate ? undefined : TASK_STATUS.NOT_STARTED
    )

    if (this.state.partitionData.data.tasks) {
      this.state.partitionData.data.tasks.push(newTask)
    }

    this.updatePartitionDataState(this.state.partitionData.data)
    this.setState({ newTask: newTask })
  }

  handleIndexRefresh = (tasks, insertionIndex) => {
    if (tasks[insertionIndex - 1] === undefined && insertionIndex !== 0) {
      return (insertionIndex = insertionIndex - 1)
    }
    const hidden = tasks.filter(t => t.filteredOut).length
    return insertionIndex + hidden
  }

  openSiblingTaskCreation = (
    above,
    parentDatum,
    insertionIndex,
    newTaskStatus
  ) => {
    if (
      parentDatum.data &&
      parentDatum.data.tasks.length < CONFIG.SUBTASK_LIMIT
    ) {
      //fixes issue with auto create new task/filtering temp fix
      insertionIndex = this.handleIndexRefresh(
        parentDatum.data.tasks,
        insertionIndex
      )
      const previousTask =
        insertionIndex > 0 && parentDatum.data.tasks[insertionIndex - 1]
      const nextTask =
        insertionIndex < parentDatum.data.tasks.length &&
        parentDatum.data.tasks[insertionIndex]
      const parentLevel = parentDatum.data.level || 0
      const status = this.props.isTemplate
        ? undefined
        : newTaskStatus
          ? newTaskStatus
          : getStatusForSiblingTask(previousTask, nextTask)
      const newTask = createNewTaskPlaceholder(
        parentLevel + 1,
        parentDatum.data,
        parentDatum.data.projectId,
        status
      )
      newTask.isCreatedFromSibling = true
      newTask.above = above
      parentDatum.data.tasks.splice(insertionIndex, 0, newTask)
      this.updatePartitionDataState(this.state.partitionData.data)
      this.setState({ newTask: newTask })
    }
  }

  insertIntoParentsChildren = (tasks, parentId, task, insertionIndex) => {
    tasks.forEach(t => {
      if (t.id === parentId) {
        if (!t.tasks.map(c => c.id).includes(task.id)) {
          t.tasks.splice(insertionIndex, 0, task)
        }
      } else {
        this.insertIntoParentsChildren(t.tasks, parentId, task, insertionIndex)
      }
    })
  }

  confirmNewTaskCreation = (taskDatum, name) => {
    taskDatum.name = name
    taskDatum.id = TASKMAP_NEW_TASK_FLOW_CONFIRMED

    const insertionIndex = taskDatum.parent.tasks.findIndex(
      t => t.id === taskDatum.id
    )

    this.insertIntoParentsChildren(
      this.props.data.tasks,
      taskDatum.parent.id,
      taskDatum,
      insertionIndex
    )

    this.updatePartitionDataState()

    this.props
      .createNewTaskHandler(
        taskDatum.parent,
        taskDatum.status,
        name,
        insertionIndex
      )
      .then(() => {
        this.resetImmediateAdd()
      })
  }

  cancelNewTaskCreation = newTaskDatum => {
    const parent =
      newTaskDatum.level === 1 ? this.props.data : newTaskDatum.parent
    parent.tasks = parent.tasks.filter(t => t !== newTaskDatum)
    this.setState({ newTask: null })
    this.updatePartitionDataState()
  }

  isWidthDown = () => {
    return false //useMediaQuery(juralioTheme.breakpoints.down(breakpoint))
  }

  render() {
    if (!this.props.data || !this.props.data.tasks) {
      return null
    }
    if (this.props.data.tasks.locked) {
      return <Navigate push to="/404" />
    }
    const edgePadding = this.isWidthDown('sm')
      ? juralioSizes.mobile.mainViewPadding
      : juralioSizes.mainViewPadding
    const { t } = this.props
    const shouldShowZeroState =
      !this.props.isReadOnly &&
      (!this.state.partitionData ||
        !this.state.partitionData.children ||
        this.state.partitionData.children.length === 0)
    const isFilterOn =
      this.props.statusDoneToFilterTasks ||
      !this.props.statusNotStartedToFilterTasks

    return (
      <React.Fragment>
        {shouldShowZeroState && !this.filterToggle && !isFilterOn && (
          <TaskMapZeroState
            title={t(
              this.props.isTemplate
                ? 'taskmapZeroState.template.title'
                : 'taskmapZeroState.title'
            )}
            caption={t('taskmapZeroState.caption')}
            createFirstTask={this.openFirstTaskCreation}
            isReadOnly={this.props.isReadOnly}
            viewOnly={this.props.viewOnly}
          />
        )}
        {shouldShowZeroState && isFilterOn && <TaskmapFilterZeroState />}
        {!shouldShowZeroState && (
          <React.Fragment>
            <DesktopIcicle
              Template={TaskCell}
              isReadOnly={this.props.isReadOnly}
              newTask={this.state.newTask}
              updateNameHandler={this.props.updateNameHandler}
              confirmStatusChangeHandler={this.props.confirmStatusChangeHandler}
              createNewTaskHandler={this.confirmNewTaskCreation}
              getIcicleRef={this.setMainIcicleRef}
              separatorPadding={
                this.props.detailedView?.viewMode ===
                TASK_MAP_VIEW_MODE_ENUM.COMPACT
                  ? COMPACT_INTER_PHASE_PADDING
                  : INTER_PHASE_PADDING
              }
              edgePadding={edgePadding}
              partitionData={this.state.partitionData}
              childrenPropertyName={this.props.childrenPropertyName}
              parentPropertyName={this.props.parentPropertyName}
              interactiveProps={this.props.interactiveProps}
              interactive={this.state.interactive}
              selectionMode={this.props.selectionMode}
              goInteractive={this.goInteractive}
              cellClickHandler={this.props.cellClickHandler}
              overviewHeightThreshold={this.props.overviewHeightThreshold}
              openChildTaskCreation={this.openChildTaskCreation}
              openSiblingTaskCreation={this.openSiblingTaskCreation}
              cancelNewTaskCreation={this.cancelNewTaskCreation}
              isMatterAdmin={this.props.isMatterAdmin}
              isTemplate={this.props.isTemplate}
              highlightedTaskList={
                (this.props.isUserFilterActive || this.props.statusMilestone) &&
                !this.props.isTemplate
                  ? this.state.highlightedTaskList
                  : this.props.highlightedTaskList
              }
              showSnackbarHandler={this.props.actions.showSnackbarHandler}
              translationHandler={t}
              reorderTaskHandler={this.props.reorderTaskHandler}
              handleTaskMove={this.props.handleTaskMove}
              moveTargets={this.props.moveTargets}
              moveTaskToNewParent={this.props.moveTaskToNewParent}
              selectedItem={this.props.selectedItem}
              recentlyMovedTasks={this.props.recentlyMovedTasks}
              getTaskDetails={this.props.getTaskDetails}
              getLatestPost={this.props.getLatestPost}
              newTasks={this.props.newTasks}
              dismissNewTasks={this.props.dismissNewTasks}
              mainIcicleRef={this.state.mainIcicleRef}
              style={this.props.styles}
              levelIndicators={true}
              taskmap={this.props.taskmap}
              doneTasksToShow={this.props.doneTasksToShow}
              showDone={this.props.statusDoneToFilterTasks}
              navigatedFromTaskDetails={this.props.lastLocation?.split('/')[6]}
              filteredLabels={this.props.filteredLabels}
              detailedView={this.props.detailedView}
              viewOnly={this.props.viewOnly}
              externalUser={this.props.externalUser}
            />
            {this.renderMinimap()}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      exitAddingTemplateTaskHandler: bindActionCreators(
        disableImmediateAddTemplate,
        dispatch
      ),
      exitAddingProjectTaskHandler: bindActionCreators(
        disableImmediateAddProject,
        dispatch
      ),
      showSnackbarHandler: bindActionCreators(displaySnackbar, dispatch),
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
      fetchTeamHandler: bindActionCreators(fetchTeam, dispatch),
    },
  }
}

function mapStateToProps(state) {
  return {
    immediateAddTaskProject: state.project.immediateAddTask,
    immediateAddTaskTemplate: state.template.immediateAddTask,
    emailToFilterTasks: state.taskMapFilter.email,
    statusMilestone: state.taskMapFilter.statusMilestone,
    statusDoneToFilterTasks: state.taskMapFilter.statusDone,
    statusNotStartedToFilterTasks: state.taskMapFilter.statusNotStarted,
    statusNotRequiredToFilterTasks: state.taskMapFilter.statusNotRequired,
    taskMemberOf: state.taskMapFilter.filterOptions.taskMemberOf,
    following: state.taskMapFilter.filterOptions.following,
    logicOperator: state.taskMapFilter.filterOptions.logicOperator,
    filterSelectionUser: state.taskMapFilter.filterSelectionUser,
    isUserFilterActive: state.taskMapFilter.filterOn,
    matterTeam: state.matterTeam.mainPage.team,
    isMatterTeamLoaded: state.matterTeam.isLoaded,
    taskmap: state.taskmap,
    project: state.project,
    lastLocation: state.lastLocationRecorder.lastLocation,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(DesktopIcicleContainer))
