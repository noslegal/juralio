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

import {
  recordProjectVisit,
  recordTaskSeen,
} from '../../app/project/project-actions'
import projectService from '../../services/project/project-service'
import taskService from '../../services/task/task-service'
import templateService from '../../services/template/template-service'

export const TASKMAP_ACTIONS = {
  REQUEST_STRUCTURE: 'taskmap/REQUEST_STRUCTURE',
  RECIEVE_STRUCTURE: 'taskmap/RECIEVE_STRUCTURE',
  REQUEST_CONTENT: 'taskmap/REQUEST_CONTENT',
  RECEIVE_CONTENT: 'taskmap/RECEIVE_CONTENT',
  UPDATE_TASK_NO_FETCH: 'taskmap/UPDATE_TASK_NO_FETCH',
  REQUEST_PLACEHOLDER_TASK: 'taskmap/REQUEST_PLACEHOLDER_TASK',
  REMOVE_PLACEHOLDER_TASK: 'taskmap/REMOVE_PLACEHOLDER_TASK',
  REPLACE_PLACEHOLDER_TASK: 'taskmap/REPLACE_PLACEHOLDER_TASK',
  REPLACE_TASK: 'taskmap/REPLACE_TASK',
  REQUEST_NEW_TASKS: 'taskmap/REQUEST_NEW_TASKS',
  REMOVE_NEW_TASK: 'taskmap/REMOVE_NEW_TASK',
  REMOVE_ALL_NEW_TASKS: 'taskmap/REMOVE_ALL_NEW_TASKS',
  ADD_NEW_CREATED_TASK: 'taskmap/ADD_NEW_CREATED_TASK',
  REQUEST_TEMPLATE_STRUCTURE: 'taskmap/REQUEST_TEMPLATE_STRUCTURE',
  REMOVE_ZERO_STATE_TASK: 'taskmap/REMOVE_ZERO_STATE_TASK',
  CHANGE_TASKMAP_TYPE: 'taskmap/CHANGE_TASKMAP_TYPE',
  CHANGE_TASKMAP_ZOOM: 'taskmap/CHANGE_TASKMAP_ZOOM',
  CREATE_TASK_FROM_TEMPLATE: 'taskmap/CREATE_TASK_FROM_TEMPLATE',
  OVERWRITE_INCLUDE_POSTS: 'taskmap/OVERWRITE_INCLUDE_POSTS',
  TASKS_FROM_TEMPLATE: 'taskmap/TASKS_FROM_TEMPLATE',
  CREATE_TASK_FROM_TEMPLATE_COMPLETE:
    'taskmap/CREATE_TASK_FROM_TEMPLATE_COMPLETE',
}

const update = (targetObject, obj) => {
  Object.keys(obj).forEach(function (key) {
    // delete property if set to undefined or null
    if (undefined === obj[key] || null === obj[key]) {
      delete targetObject[key]
    }

    // property value is object, so recurse
    else if ('object' === typeof obj[key] && !Array.isArray(obj[key])) {
      // target property not object, overwrite with empty object
      if (
        !(
          'object' === typeof targetObject[key] &&
          !Array.isArray(targetObject[key])
        )
      ) {
        targetObject[key] = {}
      }
      // recurse
      update(targetObject[key], obj[key])
    }
    // set target property to update property
    else {
      targetObject[key] = obj[key]
    }
  })
}

export default function reducer(
  state = {
    structure: [],
    tasks: [],
    matterId: null,
    workstreamId: null,
    height: null,
    isLoaded: false,
    depth: null,
    newTasks: [],
    templateId: null,
    zoomLevel: 1,
    taskCreateMId: null,
    taskCreatePId: null,
    taskFromTemplate: false,
    taskFromTemplateIncludeDesc: false,
    taskFromTemplateIncludePosts: false,
    taskFromTemplateTasks: null,
    destinationLevelACount: null,
  },
  action = {}
) {
  switch (action.type) {
    case TASKMAP_ACTIONS.REQUEST_STRUCTURE:
      return {
        ...state,
        isLoaded: action.loaded || false,
        matterId: action.matterId,
        workstreamId: action.workstreamId,
      }
    case TASKMAP_ACTIONS.RECIEVE_STRUCTURE:
      return {
        ...state,
        structure: action.structure,
        height: action.height ? action.height : state.height,
        depth: action.depth ? action.depth : state.depth,
      }
    case TASKMAP_ACTIONS.REQUEST_CONTENT:
      return {
        ...state,
      }
    case TASKMAP_ACTIONS.RECEIVE_CONTENT:
      return {
        ...state,
        isLoaded: true,
        tasks: action.tasks,
      }
    case TASKMAP_ACTIONS.UPDATE_TASK_NO_FETCH:
      let taskToUpdate = state.tasks.find(task => task.id === action.taskId)
      //do update
      update(taskToUpdate, action.properties)
      return {
        ...state,
        tasks: [
          taskToUpdate,
          ...state.tasks.filter(task => task.id !== action.taskId),
        ],
      }
    case TASKMAP_ACTIONS.REQUEST_PLACEHOLDER_TASK:
      return {
        ...state,
        tasks: [action.placeholderObject, ...state.tasks],
        height: action.increasedHeight ? state.height + 1 : state.height,
        depth: action.increasedDepth ? state.depth + 1 : state.depth,
      }
    case TASKMAP_ACTIONS.REMOVE_PLACEHOLDER_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== -1),
      }
    case TASKMAP_ACTIONS.REPLACE_PLACEHOLDER_TASK:
      return {
        ...state,
        structure: action.structure,
        tasks: [...state.tasks.filter(t => t.id !== -1), action.newTask],
      }
    case TASKMAP_ACTIONS.REPLACE_TASK:
      return {
        ...state,
        tasks: [
          ...state.tasks.filter(t => t.id !== action.task.id),
          action.task,
        ],
      }
    case TASKMAP_ACTIONS.REQUEST_NEW_TASKS:
      return {
        ...state,
        newTasks: action.newTasks,
      }
    case TASKMAP_ACTIONS.REMOVE_NEW_TASK:
      return {
        ...state,
        newTasks: state.newTasks.filter(t => t !== action.taskId),
      }
    case TASKMAP_ACTIONS.REMOVE_ALL_NEW_TASKS:
      return {
        ...state,
        newTasks: [],
      }
    case TASKMAP_ACTIONS.ADD_NEW_CREATED_TASK:
      return {
        ...state,
        structure: [...state.structure, { id: action.task.id, tasks: [] }],
        tasks: [...state.tasks, action.task],
      }
    case TASKMAP_ACTIONS.REQUEST_TEMPLATE_STRUCTURE:
      return {
        ...state,
        isLoaded: action.loaded || false,
        matterId: null,
        workstreamId: null,
        templateId: action.templateId,
      }
    case TASKMAP_ACTIONS.REMOVE_ZERO_STATE_TASK:
      return {
        ...state,
        structure: state.structure.filter(t => t.id !== -1),
      }
    case TASKMAP_ACTIONS.CHANGE_TASKMAP_TYPE:
      return {
        ...state,
        structure:
          (action.taskmapType === 'workstream' && state.templateId !== null) ||
          (action.taskmapType === 'template' && state.workstreamId !== null)
            ? []
            : state.structure,
        workstreamId:
          action.taskmapType === 'workstream' ? state.workstreamId : null,
        templateId: action.taskmapType === 'template' ? state.templateId : null,
      }
    case TASKMAP_ACTIONS.CHANGE_TASKMAP_ZOOM:
      return {
        ...state,
        zoomLevel: action.zoomLevel,
      }
    case TASKMAP_ACTIONS.CREATE_TASK_FROM_TEMPLATE:
      return {
        ...state,
        taskFromTemplate: true,
        taskCreateMId: action.matterId,
        taskCreatePId: action.projectId,
        taskFromTemplateIncludeDesc: action.includeDescription,
        taskFromTemplateIncludePosts: action.includePost,
        destinationLevelACount: action.destinationLevelACount,
      }
    case TASKMAP_ACTIONS.OVERWRITE_INCLUDE_POSTS:
      return {
        ...state,
        taskFromTemplateIncludePosts: false,
      }
    case TASKMAP_ACTIONS.TASKS_FROM_TEMPLATE:
      return {
        ...state,
        taskFromTemplateTasks: action.taskList,
      }
    case TASKMAP_ACTIONS.CREATE_TASK_FROM_TEMPLATE_COMPLETE:
      return {
        ...state,
        taskFromTemplate: false,
        taskCreateMId: null,
        taskCreatePId: null,
        taskFromTemplateIncludeDesc: null,
        taskFromTemplateIncludePosts: null,
        taskFromTemplateTasks: null,
        destinationLevelACount: null,
      }
    default:
      return state
  }
}

const creators = {
  requestTaskmapStructure(matterId, workstreamId, loaded = false) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_STRUCTURE,
      matterId: matterId,
      workstreamId: workstreamId,
      loaded: loaded,
    }
  },
  requestTaskmapTypeChange(type) {
    return {
      type: TASKMAP_ACTIONS.CHANGE_TASKMAP_TYPE,
      taskmapType: type,
    }
  },
  removeZeroStateTask() {
    return {
      type: TASKMAP_ACTIONS.REMOVE_ZERO_STATE_TASK,
    }
  },
  requestTemplateTaskmapStructure(templateId, loaded = false) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_TEMPLATE_STRUCTURE,
      templateId: templateId,
      loaded: loaded,
    }
  },

  recieveTaskmapStructure(structure) {
    return {
      type: TASKMAP_ACTIONS.RECIEVE_STRUCTURE,
      structure: structure.tasks,
      height: structure.height,
      depth: structure.depth,
    }
  },
  receiveTemplateTaskmapStructure(structure) {
    return {
      type: TASKMAP_ACTIONS.RECIEVE_STRUCTURE,
      structure: structure.tasks,
      height: structure.height,
      depth: structure.depth,
    }
  },
  requestTaskmapContent() {
    return {
      type: TASKMAP_ACTIONS.REQUEST_CONTENT,
    }
  },
  receiveTaskmapContent(tasks) {
    return {
      type: TASKMAP_ACTIONS.RECEIVE_CONTENT,
      tasks: tasks,
    }
  },
  updateTaskWithoutFetch(taskId, properties) {
    return {
      type: TASKMAP_ACTIONS.UPDATE_TASK_NO_FETCH,
      taskId: taskId,
      properties: properties,
    }
  },
  requestPlaceholderTask(
    placeholderObject,
    increasedHeight = false,
    increasesDepth = false
  ) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_PLACEHOLDER_TASK,
      placeholderObject: placeholderObject,
      increasedHeight: increasedHeight,
      increasesDepth: increasesDepth,
    }
  },
  removePlaceholderTask() {
    return {
      type: TASKMAP_ACTIONS.REMOVE_PLACEHOLDER_TASK,
    }
  },
  replacePlaceholderTaskWithCreatedTask(newTask, structure) {
    return {
      type: TASKMAP_ACTIONS.REPLACE_PLACEHOLDER_TASK,
      newTask: newTask,
      structure: structure,
    }
  },
  replaceTask(task) {
    return {
      type: TASKMAP_ACTIONS.REPLACE_TASK,
      task: task,
    }
  },
  requestNewTasks(tasks) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_NEW_TASKS,
      newTasks: tasks,
    }
  },
  removeNewTask(taskId) {
    return {
      type: TASKMAP_ACTIONS.REMOVE_NEW_TASK,
      taskId: taskId,
    }
  },
  removeAllNewTasks() {
    return {
      type: TASKMAP_ACTIONS.REMOVE_ALL_NEW_TASKS,
    }
  },
  addNewCreatedTask(task) {
    return {
      type: TASKMAP_ACTIONS.ADD_NEW_CREATED_TASK,
      task: task,
    }
  },
  updateTaskmapZoom(zoomLevel) {
    return {
      type: TASKMAP_ACTIONS.CHANGE_TASKMAP_ZOOM,
      zoomLevel: zoomLevel,
    }
  },
  createFromTemplateDetails(
    matterId,
    projectId,
    includeDescription,
    includePost,
    levelATaskCount
  ) {
    return {
      type: TASKMAP_ACTIONS.CREATE_TASK_FROM_TEMPLATE,
      matterId: matterId,
      projectId: projectId,
      includeDescription: includeDescription,
      includePost: includePost,
      destinationLevelACount: levelATaskCount,
    }
  },
  _overwriteIncludePosts() {
    return {
      type: TASKMAP_ACTIONS.OVERWRITE_INCLUDE_POSTS,
    }
  },
  storeTasksFromTemplate(taskList) {
    return {
      type: TASKMAP_ACTIONS.TASKS_FROM_TEMPLATE,
      taskList: taskList,
    }
  },
  completeTaskFromTemplateTask() {
    return {
      type: TASKMAP_ACTIONS.CREATE_TASK_FROM_TEMPLATE_COMPLETE,
    }
  },
}

export const updateTaskmapStructure =
  (structure, matterId, workstreamId, loaded, taskContent) => dispatch => {
    dispatch(creators.requestTaskmapStructure(matterId, workstreamId, loaded))

    dispatch(creators.recieveTaskmapStructure(structure))
    if (taskContent) {
      dispatch(creators.receiveTaskmapContent(taskContent))
    }
  }

export const fetchTaskmapContent =
  (matterId, workstreamId, timeout = 0) =>
  dispatch => {
    let startTime = new Date().getTime()
    dispatch(creators.requestTaskmapContent())
    projectService
      .getFlatTasksList(matterId, workstreamId, true)
      .then(response => {
        if (response.status === 200) {
          let endTime = new Date().getTime()
          while (endTime - startTime < timeout) {
            endTime = new Date().getTime()
          }
          window.localStorage.removeItem('taskmapFadeOut')
          window.dispatchEvent(new Event('taskmapFadeOut'))

          dispatch(creators.receiveTaskmapContent(response.body))
        }
      })
  }

export const fetchTemplateTaskmapContent = templateId => dispatch => {
  dispatch(creators.requestTaskmapContent())
  templateService.getFlatTasksList(templateId, true).then(response => {
    if (response.status === 200) {
      dispatch(creators.receiveTaskmapContent(response.body))
    }
  })
}

export const updateTaskWithoutFetch = (taskId, properties) => dispatch => {
  dispatch(creators.updateTaskWithoutFetch(taskId, properties))
}

export const reorder =
  (matterId, projectId, parentTaskId, newOrderOfTasks, force) => dispatch => {
    taskService
      .updateTaskSubtasks(
        matterId,
        projectId,
        parentTaskId,
        newOrderOfTasks,
        true
      )
      .then(res => {
        if (res.status !== 200) {
          dispatch(fetchTaskmapStructure(matterId, projectId, true, true))
          dispatch(creators.requestTaskmapStructure())
        } else if (force) {
          dispatch(fetchTaskmapStructure(matterId, projectId, true, true))
        }
      })
  }

export const templateReorder =
  (templateId, parentTaskId, newOrderOfTasks, structure) => dispatch => {
    dispatch(creators.recieveTaskmapStructure(structure))
    if (parentTaskId === undefined) {
      templateService
        .updateTemplateTasks(templateId, { taskOrder: newOrderOfTasks })
        .then(res => {
          dispatch(fetchTemplateTaskmapStructure(templateId))
          if (res.status !== 200) {
            dispatch(creators.requestTaskmapStructure())
          }
        })
    } else {
      templateService
        .updateTemplateTasks(templateId, {
          taskOrder: newOrderOfTasks,
          parentTaskId: parentTaskId,
        })

        .then(res => {
          dispatch(fetchTemplateTaskmapStructure(templateId))
          if (res.status !== 200) {
            dispatch(creators.requestTaskmapStructure())
          }
        })
    }
  }

export const addPlaceholderTask =
  (newStructure, placeholderObject, isSibling, isChild) => dispatch => {
    dispatch(
      creators.requestPlaceholderTask(placeholderObject, isSibling, isChild)
    )
    dispatch(creators.recieveTaskmapStructure(newStructure))
  }
export const removePlaceHolderTask = newStructure => dispatch => {
  dispatch(creators.removePlaceholderTask())
  dispatch(creators.recieveTaskmapStructure(newStructure))
}

export const removeZeroStateTask = () => dispatch => {
  dispatch(creators.removeZeroStateTask())
}
export const replacePlaceholderTaskWithCreatedTask =
  (newTask, newStructure, placeholderObject) => dispatch => {
    dispatch(
      creators.replacePlaceholderTaskWithCreatedTask(newTask, newStructure)
    )
    if (placeholderObject) {
      dispatch(creators.requestPlaceholderTask(placeholderObject, true, false))
    }
  }

export const replaceTemplateTask = (templateId, task) => dispatch => {
  if (task.tasks && task.tasks.length > 0) {
    task.tasks.map(t => {
      //this could be one call
      templateService.getTemplateTask(templateId, t.id).then(response => {
        if (response.status === 200) {
          dispatch(creators.replaceTask(response.body))
        }
      })
      return true
    })
  }
  dispatch(creators.replaceTask(task))
}

export const replaceTask = task => dispatch => {
  if (!task) {
    return
  }
  if (task?.datesLinkedToSiblings) {
    taskService
      .getTaskSiblings(task.matterId, task.project.id, task.id)
      .then(response => {
        if (response.status === 200) {
          response.body.map(t => {
            dispatch(creators.replaceTask(t))
            return true
          })
        }
      })
  }

  if (task.tasks && task.tasks.length > 0) {
    taskService
      .getTaskChildren(task.matterId, task.project.id, task.id)
      .then(response => {
        if (response.status === 200) {
          response.body.map(t => {
            dispatch(creators.replaceTask(t))
            return true
          })
        }
      })
  }
  dispatch(creators.replaceTask(task))
}

export const updateTasksList = tasks => dispatch => {
  dispatch(creators.receiveTaskmapContent(tasks))
}
export const getNewTasks = (matterId, projectId) => dispatch => {
  projectService.getNewTasks(matterId, projectId).then(response => {
    if (response.status === 200) {
      if (response.body.length) {
        dispatch(creators.requestNewTasks(response.body.map(t => t.id)))
      }
    }
  })
}
export const removeNewTask = (matterId, projectId, taskId) => dispatch => {
  dispatch(recordTaskSeen(matterId, projectId, taskId))
  dispatch(creators.removeNewTask(taskId))
}
export const removeAllNewTasks = (matterId, projectId) => dispatch => {
  dispatch(recordProjectVisit(matterId, projectId))
  dispatch(creators.removeAllNewTasks())
}

export const fetchTaskmapStructure =
  (matterId, workstreamId, fetchContent = true, loaded = false, timeout = 0) =>
  dispatch => {
    let startTime = new Date().getTime()
    dispatch(creators.requestTaskmapStructure(matterId, workstreamId, loaded))
    projectService.getStructure(matterId, workstreamId).then(response => {
      if (response.status === 200) {
        let endTime = new Date().getTime()
        while (endTime - startTime < timeout) {
          endTime = new Date().getTime()
        }
        window.localStorage.removeItem('taskmapFadeOut')
        window.dispatchEvent(new Event('taskmapFadeOut'))
        dispatch(creators.recieveTaskmapStructure(response.body))
        if (fetchContent) {
          dispatch(fetchTaskmapContent(matterId, workstreamId))
        }
      }
    })
  }
export const addNewCreatedTask = newTask => dispatch => {
  dispatch(creators.addNewCreatedTask(newTask))
}

export const fetchTemplateTaskmapStructure =
  (templateId, fetchContent = true, loaded = false) =>
  dispatch => {
    dispatch(creators.requestTemplateTaskmapStructure(templateId, loaded))
    templateService.getStructure(templateId).then(response => {
      if (response.status === 200) {
        dispatch(creators.receiveTemplateTaskmapStructure(response.body))
        if (fetchContent) {
          dispatch(fetchTemplateTaskmapContent(templateId))
        }
      }
    })
  }

export const visitWorkstream = () => dispatch => {
  dispatch(creators.requestTaskmapTypeChange('workstream'))
}
export const visitTemplate = () => dispatch => {
  dispatch(creators.requestTaskmapTypeChange('template'))
}

export const updateTaskmapZoomLevel = newZoom => dispatch => {
  dispatch(creators.updateTaskmapZoom(newZoom))
}

export const createTaskFromTemplateTask =
  (matterId, projectId, includeDescription, includePost, levelATaskCount) =>
  dispatch => {
    dispatch(
      creators.createFromTemplateDetails(
        matterId,
        projectId,
        includeDescription,
        includePost,
        levelATaskCount
      )
    )
  }

export const storeSelectedTasksFromTemplate = tasks => dispatch => {
  dispatch(creators.storeTasksFromTemplate(tasks))
}

export const overwriteIncludePosts = () => dispatch => {
  dispatch(creators._overwriteIncludePosts())
}

export const completeCreateTaskFromTemplateTask = () => dispatch => {
  dispatch(creators.completeTaskFromTemplateTask())
}
