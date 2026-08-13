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

import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import TaskmapFtue from '../../components/data-display/ftue/taskmap/TaskmapFtue'
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import CreateProjectFromTemplateFlowContainer from '../../components/flows/use-template-flow/CreateProjectFromTemplateFlowContainer'

import {
  getMatterAdminUrl,
  getOverviewUrl,
  getSingleWorkstreamTaskMapUrl,
  getTaskMapUrl,
  getTemplateOverviewUrl,
  isInTemplate,
} from '../../components/navigation/common/location-context-helper'
import {
  completeCreateTaskFromTemplateTask,
  fetchTaskmapStructure,
  fetchTemplateTaskmapStructure,
  getNewTasks,
  overwriteIncludePosts,
  storeSelectedTasksFromTemplate,
  updateTaskmapZoomLevel,
  visitTemplate,
  visitWorkstream,
} from '../../redux/ducks/improved-taskmap'
import { getLocationParams } from '../../services/helpers/route/route-helper'
import { gettingStartedTutorialStepsPart3 } from '../../services/tour/steps/getting-started-tutorial-steps-part-3'
import { setTour } from '../../services/tour/tour-actions'
import { getDetailsAttribute } from '../../services/user/user-data-service'
import {
  enterSelectionMode,
  fetchProjectWithPostsAndTaskTeam,
} from '../project/project-actions'
import { exitSelectionMode as exitProjectSelectionMode } from '../project/project-actions'
import {
  ACTIVITIES,
  CONFIG,
  MATTER_STATUS,
  MINI_MAP_VISIBILITY_THRESHOLD,
  TASK_STATUS,
} from '../constants'
import MatterClosed from '../../components/data-display/matter-closed/MatterClosed'
import { taskFilterActions } from '../task-map/task-filter/task-filter-actions'
import TaskmapFilterZeroState from '../task-map/zero-state/TaskmapFilterZeroState'
import { templateToProject } from '../template/project-creation/template-to-project-actions'
import TaskSelectionPanel from '../template/TaskSelectionPanel'
import {
  exitSelectionMode,
  fetchTemplate,
  fetchTemplateOverview,
  fetchTemplateTasks,
  reset,
} from '../template/template-actions'
import ImprovedTaskmap from './ImprovedTaskmap'
import LevelIndicators from './LevelIndicators'
import { confirmTaskSelection } from './taskmap-interaction-helpers/taskmap-selection-helpers'
import TaskmapInteractionsContainer from './taskmap-interactions/TaskmapInteractionsContainer'
import MiniMap from './taskmap-minimap/MiniMap'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import TaskmapFilters from './taskmap-filters/TaskmapFilters'
import { isKnowledgeManager } from '../../services/user/helper/user-role-service'
import { useUserAuthData } from '../../hooks/user-hooks'
import TemplateTaskmapFtue from '../../components/data-display/ftue/template-taskmap/TemplateTaskmapFtue'
import { getFilteredStructure } from './taskmap-helpers/taskmap-helpers'
import { flatTaskListFromTree } from '../../services/task/data-provider/task-list-data-provider'
import cloneDeep from 'lodash/cloneDeep'
import ImprovedTaskmapZoom from './ImprovedTaskmapZoom'
import taskService from '../../services/task/task-service'
import projectService from '../../services/project/project-service'

const useStyles = makeStyles()(() => ({
  dragImage: {
    position: 'absolute',
  },
  dragCanvas: {
    zIndex: 1000,
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: -100000,
  },
  dragImageElement: {
    zIndex: -1,
    position: 'absolute',
    top: 0,
    left: -100000,
  },
  taskmapWrapper: {
    display: 'flex',
    position: 'relative',
    overflow: 'auto',
    width: '100%',
    height: '100%',
  },
}))

const ImprovedTaskmapContainer = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const matterId = props.identifiers?.matterId || getLocationParams('matter')
  const workstreamId =
    props.identifiers?.workstreamId || getLocationParams('workstream')
  const history = useNavigate()
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const matter = useSelector(state => state.matterDetails.matter)
  const project = useSelector(state => state.project)
  const [reload, setReload] = useState(false)
  const [focusTask, setFocusTask] = useState(null)
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const improvedTaskmap = useSelector(state => state.improvedTaskmap)
  const auth = useSelector(state => state.auth)
  const currentUser = auth.data.details
  const templateToProjectState = useSelector(state => state.templateToProject)
  const [showMinimised, setShowMinimised] = useState(
    props.height < MINI_MAP_VISIBILITY_THRESHOLD
  )

  const [hasLoadedOnce, setHasLoadedOnce] = useState(0)
  const isTemplate = isInTemplate(window.location.href)
  const template = useSelector(state => state.template)
  const templateId = getLocationParams('template')
  const isViewOnly = useIsViewOnly(matter)
  const userAuthData = useUserAuthData()
  const checkIfIsReadOnly = () => {
    if (isTemplate && template.isLoaded) {
      if (
        template.template.isSystemTemplate ||
        template.selectionMode ||
        !isKnowledgeManager(userAuthData)
      ) {
        return true
      }
    } else {
      return isViewOnly
    }
  }
  const isReadOnly = checkIfIsReadOnly()
  const taskFromTemplate = useSelector(
    state => state.improvedTaskmap.taskFromTemplate
  )
  const taskFromTemplateMatterId = useSelector(
    state => state.improvedTaskmap.taskCreateMId
  )
  const taskFromTemplateProjectId = useSelector(
    state => state.improvedTaskmap.taskCreatePId
  )

  const { t } = useTranslation()
  const taskmapStructure = useSelector(state => state.improvedTaskmap.structure)
  const isLoaded = useSelector(state => state.improvedTaskmap.isLoaded)
  const zoom = useSelector(state => state.improvedTaskmap.zoomLevel)

  //DON'T TOUCH. this fixes latency issues with the zoom redux
  const [localZoom, setLocalZoom] = useState(zoom)

  const doc_keyUp = e => {
    if ((e.ctrlKey || e.metaKey) && e.code === 'Equal') {
      e.stopImmediatePropagation()
      e.preventDefault()
      if (localZoom < 1.2) {
        dispatch(updateTaskmapZoomLevel(localZoom + 0.1))
        setLocalZoom(localZoom + 0.1)
        window.removeEventListener('keydown', doc_keyUp, true)
      }
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'Minus') {
      e.stopImmediatePropagation()
      e.preventDefault()
      if (localZoom > 0.4) {
        dispatch(updateTaskmapZoomLevel(localZoom - 0.1))
        setLocalZoom(localZoom - 0.1)
        window.removeEventListener('keydown', doc_keyUp, true)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', doc_keyUp, true)
  }, [localZoom]) //eslint-disable-line

  useEffect(() => {
    const handleWheel = e => {
      // Windows & Linux: ctrl, Mac: meta
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY > 0) {
          if (zoom > 0.5) {
            dispatch(updateTaskmapZoomLevel(zoom - 0.1))
          }
        } else {
          if (zoom < 1.2) {
            dispatch(updateTaskmapZoomLevel(zoom + 0.1))
          }
        }
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      // Remove listener if component is removed
      document.removeEventListener('wheel', handleWheel)
    }
  }, [zoom]) // eslint-disable-line

  useEffect(() => {
    if (isTemplate && !templateId) {
      setReload(true)
    } else if (!isTemplate && templateId) {
      setReload(true)
    }
  }, []) //eslint-disable-line

  const isTaskVisible = element => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  const [hasJumped, setHasJumped] = useState(false)

  useEffect(() => {
    window.addEventListener('viewport-move', () => {
      let wrapper = document.getElementById('improved-taskmap-wrapper')
      //Set the window scroll values by finding the 1% value from the miniMap value and multiplying it by 100
      if (wrapper) {
        wrapper.scrollLeft = window.localStorage.getItem(
          'viewportLeftScrollValue'
        )
        wrapper.scrollTop = window.localStorage.getItem(
          'viewportTopScrollValue'
        )
      }
    })

    if (matter?.matterStatus === MATTER_STATUS.CLOSED) {
    } else if (matterId && workstreamId) {
      dispatch(visitWorkstream())
      dispatch(
        fetchTaskmapStructure(
          matterId,
          workstreamId,
          true,
          improvedTaskmap.isLoaded &&
            improvedTaskmap.workstreamId === workstreamId
        )
      )
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, workstreamId)) //used for legacy components
      dispatch(getNewTasks(matterId, workstreamId))
    } else {
      if (isTemplate && templateId) {
        dispatch(visitTemplate())
        dispatch(
          fetchTemplateTaskmapStructure(
            templateId,
            true,
            improvedTaskmap.isLoaded &&
              improvedTaskmap.templateId === templateId
          )
        )
        dispatch(fetchTemplateOverview(templateId))
        dispatch(fetchTemplate(templateId))
        dispatch(fetchTemplateTasks(templateId)) //used for legacy components
        if (taskMapFilter) dispatch(taskFilterActions.resetAllFilter())
        // dispatch(taskFilterActions.resetAllFiltersTemplate())
      }
    }
  }, [templateId, workstreamId, matterId, matter?.matterStatus]) //eslint-disable-line

  useEffect(() => {
    //this is a bit of a hack to allow the icicles to resize
    let l = document.getElementById('improved-taskmap-wrapper')?.scrollLeft
    let t = document.getElementById('improved-taskmap-wrapper')?.scrollTop

    setReload(true)
    setTimeout(() => {
      setReload(false)
      if (document.getElementById('improved-taskmap-wrapper')) {
        document.getElementById('improved-taskmap-wrapper').scrollLeft = l
        document.getElementById('improved-taskmap-wrapper').scrollTop = t
      }
    }, 100)
  }, [taskMapFilter.detailedView])

  useEffect(() => {
    if (isLoaded) {
      setHasLoadedOnce(hasLoadedOnce + 1)
    }
  }, [isLoaded, taskmapStructure]) //eslint-disable-line

  const height = useSelector(state => state.improvedTaskmap.height)
  const width = useSelector(state => state.improvedTaskmap.depth)
  const showSpinner =
    (!isLoaded && taskmapStructure.length === 0) ||
    (parseInt(improvedTaskmap.matterId) !== parseInt(matterId) && !isTemplate)
  const handleTutorialTour = (force = false) => {
    if (
      force ||
      getDetailsAttribute(['firstTimeUserExperience', 'hasSeenTaskmap'])
    ) {
      if (window.sessionStorage.getItem('onInitialTutorial') === 'true') {
        if (
          props?.project?.template?.id ===
          props?.instanceSettings?.settings?.initialTemplateId
        ) {
          dispatch(
            setTour(
              'gettingStartedtutorial',
              gettingStartedTutorialStepsPart3(t),
              true,
              false
            )
          )
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      //stuff
      if (project.selectionMode && !improvedTaskmap.taskFromTemplate) {
        return dispatch(exitProjectSelectionMode())
      } else if (template.selectionMode) {
        return dispatch(exitSelectionMode())
      }
    } //eslint-disable-next-line
  }, [])

  const cancelCreateProjectFromTemplateDialog = () => {
    dispatch(reset())
    dispatch(exitProjectSelectionMode())
    if (!taskFromTemplate) {
      history(getMatterAdminUrl(matterId))
    }
  }

  const filteredStructure = getFilteredStructure(
    taskMapFilter,
    taskmapStructure,
    tasks,
    true
  )

  useEffect(() => {
    if (isLoaded) {
      let splitUrl = window.location.href.split('?')
      if (splitUrl.length > 1) {
        let urlParams = new URLSearchParams(
          '?' + window.location.href.split('?')[1]
        )
        let focusTaskId = urlParams.get('id')
        if (focusTaskId[focusTaskId.length - 1] === 'h') {
          focusTaskId = focusTaskId.substring(0, focusTaskId.length - 1)
        }
        if (focusTaskId) {
          setFocusTask(document.getElementById(`task-wrapper-${focusTaskId}`))
        }
      }
    }
  }, [isLoaded, filteredStructure])

  useEffect(() => {
    if (isTemplate) {
    } else {
    }
    if (!hasJumped && focusTask) {
      if (!isTaskVisible(focusTask)) {
        focusTask.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHasJumped(true)
      }
    }
  }, [focusTask]) //eslint-disable-line

  if (matter?.matterStatus === MATTER_STATUS.CLOSED) {
    return (
      <MatterClosed
        isAdmin={matter.activities?.includes(ACTIVITIES.MATTER_ADMIN)}
        matterId={matterId}
      />
    )
  }
  if (project.isForbidden) {
    return (
      <NoPermission
        text={t('taskmapZeroState.permissionToAccessProjectDenied')}
      />
    )
  }
  if (!project.active && project.isLoaded) {
    return (
      <NoPermission
        data-test="workstream-closed"
        text={t('taskmapZeroState.workstreamClosed')}
      />
    )
  }

  const getFilteredHeight = () => {
    if (!isLoaded) {
      return height
    }
    return cloneDeep(
      flatTaskListFromTree({
        tasks: filteredStructure,
      }).filter(t => {
        if (taskMapFilter.statusNotRequired) {
          return true
        }
        if (!taskMapFilter.statusDone && t.status === TASK_STATUS.DONE) {
          return false
        }
        if (
          !taskMapFilter.statusNotStarted &&
          t.status === TASK_STATUS.NOT_STARTED
        ) {
          return false
        }
        return t.status !== TASK_STATUS.NOT_REQUIRED
      })
    ).filter(t => t.tasks && t.tasks.length === 0).length
  }
  const getFilteredWidth = () => {
    if (!isLoaded) {
      return width
    }
    return Math.max(
      ...flatTaskListFromTree({
        tasks: filteredStructure,
      })
        .filter(t => {
          if (taskMapFilter.statusNotRequired) {
            return true
          }
          if (!taskMapFilter.statusDone && t.status === TASK_STATUS.DONE) {
            return false
          }
          if (
            !taskMapFilter.statusNotStarted &&
            t.status === TASK_STATUS.NOT_STARTED
          ) {
            return false
          }
          return t.status !== TASK_STATUS.NOT_REQUIRED
        })
        .map(t => (t.level ? t.level : 1))
    )
  }
  const filteredHeight = getFilteredHeight()
  const filteredWidth = getFilteredWidth()
  const levelIndicatorMaxWidth = Math.max(
    ...flatTaskListFromTree({
      tasks: getFilteredStructure(
        { ...taskMapFilter, expandCollapseTaskFilter: [] },
        taskmapStructure,
        tasks,
        false
      ),
    }).map(t => (t.level ? t.level : 1))
  )
  const filterZeroState =
    taskmapStructure?.length > 0 &&
    filteredStructure.length === 0 &&
    !showSpinner &&
    isLoaded

  return (
    <>
      <div id="drag-image" className={classes.dragImage}>
        <canvas id="drag-canvas" className={classes.dragCanvas} />
        <img
          id="drag-image-element"
          alt="drag-element"
          className={classes.dragImageElement}
        />
      </div>
      <div
        className={classes.taskmapWrapper}
        id="improved-taskmap-wrapper"
        onScroll={() => {
          window.dispatchEvent(new Event('taskmap-scroll'))
        }}
      >
        {!filterZeroState &&
          filteredStructure?.length > 0 &&
          filteredStructure[0]?.id !== -1 && (
            <LevelIndicators
              width={filteredWidth > 0 ? filteredWidth : 0}
              structure={filteredStructure}
              maxWidth={levelIndicatorMaxWidth}
            />
          )}
        {!showSpinner && !reload && (
          <ImprovedTaskmap
            structure={filteredStructure}
            height={filteredHeight}
            width={filteredWidth}
            isLoaded={isLoaded}
            hasLoadedOnce={hasLoadedOnce}
            filterZeroState={filterZeroState}
            isReadOnly={isReadOnly}
          />
        )}
        {showSpinner && (
          <div
            style={{
              position: 'absolute',
              left: window.innerWidth / 2,
              top: window.innerHeight / 2 - 150,
            }}
          >
            <BigDataSpinner size={80} />
          </div>
        )}
        {/* <UsageHelper /> */}
        <TaskmapInteractionsContainer
          matterId={matterId}
          project={project}
          viewOnly={isViewOnly}
        />
        {!getDetailsAttribute([
          'firstTimeUserExperience',
          'hasSeenTemplateTaskmap',
        ]) &&
          isTemplate && <TemplateTaskmapFtue />}
        {!getDetailsAttribute(['firstTimeUserExperience', 'hasSeenTaskmap']) &&
          !isTemplate && (
            <TaskmapFtue onClose={() => handleTutorialTour(true)} />
          )}
        {!showSpinner && filterZeroState && <TaskmapFilterZeroState />}
      </div>
      {tasks.length > 0 && (
        <>
          <MiniMap
            structure={filteredStructure}
            height={filteredHeight}
            width={filteredWidth > 0 ? filteredWidth : 0}
            tasks={tasks}
            showMinimised={showMinimised}
            setShowMinimised={setShowMinimised}
          />
          <ImprovedTaskmapZoom zoom={zoom} />
          {!isTemplate && (
            <TaskmapFilters
              matterId={matterId}
              workstreamId={workstreamId}
              showMinimisedMinimap={showMinimised}
            />
          )}
        </>
      )}

      {project.selectionMode && (
        <TaskSelectionPanel
          cancelTaskSelection={cancelCreateProjectFromTemplateDialog}
          confirmTaskSelection={() => {
            confirmTaskSelection(
              matterId,
              project,
              currentUser,
              history,
              dispatch,
              t
            )
          }}
          confirmEnabled={
            !project.highlightList || project.highlightList.length === 0
          }
          hideConfirm={improvedTaskmap.taskFromTemplate}
          panelText={
            improvedTaskmap.taskFromTemplate
              ? t('templates.hoverToAddTasksToMap')
              : t('workstreamCreation.selectTask')
          }
        />
      )}
      {template.selectionMode && (
        <TaskSelectionPanel
          cancelTaskSelection={() => {
            dispatch(templateToProject.resetTemplateToProjectState())
            dispatch(exitSelectionMode())
            if (taskFromTemplate) {
              dispatch(reset())
              if (taskFromTemplateProjectId) {
                history(
                  getTaskMapUrl(
                    null,
                    taskFromTemplateMatterId,
                    taskFromTemplateProjectId
                  )
                )
              } else {
                history(getSingleWorkstreamTaskMapUrl(taskFromTemplateMatterId))
              }
            } else {
              history(getTemplateOverviewUrl(template.template.id))
            }
          }}
          confirmTaskSelection={() => {
            if (
              template?.highlightList
                .map(t => t?.posts.filter(t => t.finalised === true)?.length)
                .reduce((partialSum, a) => partialSum + a, 0) +
                project?.posts?.length >
                CONFIG.POSTS_LIMIT &&
              improvedTaskmap.taskFromTemplateIncludePosts
            ) {
              dispatch(overwriteIncludePosts())
            }
            if (taskFromTemplate) {
              if (taskFromTemplateProjectId === 'new') {
                dispatch(exitSelectionMode())
                projectService
                  .createProjectFromTemplateTask(
                    taskFromTemplateMatterId,
                    { name: 'Workstream ' + (matter.projects.length + 1) },
                    template.highlightList[0].id,
                    template?.highlightList
                      .map(
                        t => t?.posts.filter(t => t.finalised === true)?.length
                      )
                      .reduce((partialSum, a) => partialSum + a, 0) +
                      project?.posts?.length >
                      CONFIG.POSTS_LIMIT
                      ? false
                      : improvedTaskmap.taskFromTemplateIncludePosts,
                    improvedTaskmap.taskFromTemplateIncludeDesc
                  )
                  .then(res => {
                    if (res.status === 201) {
                      dispatch(reset())
                      history(
                        getOverviewUrl(taskFromTemplateMatterId, res.body.id)
                      )
                    }
                  })
              } else if (improvedTaskmap.destinationLevelACount > 0) {
                dispatch(storeSelectedTasksFromTemplate(template.highlightList))
                dispatch(exitSelectionMode())
                dispatch(enterSelectionMode())
                if (taskFromTemplateProjectId) {
                  history(
                    getTaskMapUrl(
                      null,
                      taskFromTemplateMatterId,
                      taskFromTemplateProjectId
                    )
                  )
                } else {
                  history(
                    getSingleWorkstreamTaskMapUrl(taskFromTemplateMatterId)
                  )
                }
              } else {
                dispatch(exitSelectionMode())
                taskService
                  .createTaskFromTemplateTask(
                    improvedTaskmap.taskCreateMId,
                    improvedTaskmap.taskCreatePId,
                    template.highlightList[0].id,
                    undefined,
                    template?.highlightList
                      .map(
                        t => t?.posts.filter(t => t.finalised === true)?.length
                      )
                      .reduce((partialSum, a) => partialSum + a, 0) +
                      project?.posts?.length >
                      CONFIG.POSTS_LIMIT
                      ? false
                      : improvedTaskmap.taskFromTemplateIncludePosts,
                    improvedTaskmap.taskFromTemplateIncludeDesc
                  )
                  .then(res => {
                    if (res.status === 201) {
                      dispatch(completeCreateTaskFromTemplateTask())
                      dispatch(reset())
                      if (improvedTaskmap.taskCreatePId) {
                        history(
                          getTaskMapUrl(
                            res.body.id,
                            improvedTaskmap.taskCreateMId,
                            improvedTaskmap.taskCreatePId
                          ) + 'h'
                        )
                      } else {
                        history(
                          getSingleWorkstreamTaskMapUrl(
                            improvedTaskmap.taskCreateMId
                          ) +
                            '?id=' +
                            res.body.id +
                            'h'
                        )
                      }
                    }
                  })
              }
            } else {
              dispatch(templateToProject.updateTaskSelectionConfirmed(true))
            }
          }}
          confirmEnabled={
            template.highlightList.length === 0 ||
            template?.highlightList
              .map(t => t?.posts.filter(t => t.finalised === true)?.length)
              .reduce((partialSum, a) => partialSum + a, 0) +
              project?.posts?.length >
              CONFIG.POSTS_LIMIT
          }
          postError={
            template?.highlightList
              .map(t => t?.posts.filter(t => t.finalised === true)?.length)
              .reduce((partialSum, a) => partialSum + a, 0) +
              project?.posts?.length >
            CONFIG.POSTS_LIMIT
          }
          panelText={
            template?.highlightList
              .map(t => t?.posts.filter(t => t.finalised === true)?.length)
              .reduce((partialSum, a) => partialSum + a, 0) +
              project?.posts?.length >
            CONFIG.POSTS_LIMIT
              ? t('templates.tooManyPosts')
              : t('templates.selectTheTaskYouWantToUse')
          }
        />
      )}
      {templateToProjectState.taskSelectionConfirmed &&
        !improvedTaskmap.taskFromTemplate && (
          <CreateProjectFromTemplateFlowContainer
            cancelHandler={skipForFlow => {
              if (!skipForFlow) {
                dispatch(templateToProject.resetTemplateToProjectState())
                history(getTemplateOverviewUrl(template.template.id))
                dispatch(exitSelectionMode())
              } else {
                dispatch(exitSelectionMode())
              }
            }}
          />
        )}
    </>
  )
}
export default ImprovedTaskmapContainer
