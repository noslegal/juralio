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

import { StatusCodes } from 'http-status-codes'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import projectService from '../../../services/project/project-service'
import * as globalSnackBar from '../../global-snackbar/global-snackbar-actions'
import {
  clearErrorMessage,
  createProject,
  createProjectFromTemplate,
  createProjectFromTemplateTask,
  CREATE_PROJECT,
  CREATE_PROJECT_FAILURE,
  CREATE_PROJECT_SUCCESS,
  fetchProjects,
  RECEIVE_PROJECTS_FAILURE,
  RECEIVE_PROJECTS_SUCCESS,
  REQUEST_PROJECTS,
  RESET_CREATE_VALIDATION,
  RESET_UPDATE_VALIDATION,
  updateProject,
  UPDATE_PROJECT,
  UPDATE_PROJECT_IN_LIST_SUCCESS_ORG,
  UPDATE_PROJECT_NAME_FAILURE,
} from './projects-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('projects-actions', () => {
  describe('fetchProjects', () => {
    const projects = [
        { id: 543, name: 'b1', active: 'true' },
        { id: 123, name: 'a2', active: 'false' },
        { id: 324, name: 'a1', active: 'true' },
        { id: 984, name: 'b2', active: 'false' },
      ],
      matterId = 456
    let store, actions

    beforeEach(done => {
      projectService.getProjectsByMatterId = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({ status: StatusCodes.OK, body: projects })
        )

      store = mockStore({})
      store.dispatch(fetchProjects(matterId)).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call getProjectsByMatterId', () => {
      expect(projectService.getProjectsByMatterId).toHaveBeenCalledWith(
        matterId,
        undefined,
        undefined,
        undefined
      )
    })

    it('should dispatch REQUEST_PROJECTS', () => {
      expect(actions[0].type).toEqual(REQUEST_PROJECTS)
      expect(actions[0].matterId).toEqual(matterId)
    })

    it('should dispatch RECEIVE_PROJECTS_SUCCESS', () => {
      expect(actions[1].type).toEqual(RECEIVE_PROJECTS_SUCCESS)
      expect(actions[1].projects).toEqual(projects)
    })
  })

  describe('fetchProjects when getProjects returns forbidden', () => {
    const matterId = 789
    let store, actions

    beforeEach(done => {
      projectService.getProjectsByMatterId = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ status: StatusCodes.FORBIDDEN }))

      store = mockStore({})
      store.dispatch(fetchProjects(matterId)).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call getProjectsByMatterId', () => {
      expect(projectService.getProjectsByMatterId).toHaveBeenCalledWith(
        matterId,
        undefined,
        undefined,
        undefined
      )
    })

    it('should dispatch REQUEST_PROJECTS', () => {
      expect(actions[0].type).toEqual(REQUEST_PROJECTS)
      expect(actions[0].matterId).toEqual(matterId)
    })

    it('should dispatch RECEIVE_PROJECTS_FAILURE', () => {
      expect(actions[1].type).toEqual(RECEIVE_PROJECTS_FAILURE)
    })
  })

  describe('createProject - success', () => {
    const matterId = 123,
      name = 'test-project-name',
      project = 'test-project'

    let store, actions

    beforeEach(done => {
      globalSnackBar.showSnackbar = jest
        .fn()
        .mockReturnValueOnce({ type: 'mock_show_snackbar' })
      projectService.createProject = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.CREATED,
          body: project,
        })
      )
      store = mockStore({})
      store.dispatch(createProject(matterId, name)).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call createProject', () => {
      expect(projectService.createProject).toHaveBeenCalledWith(matterId, name)
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch showSnackBar', () => {
      expect(actions[1].type).toEqual('mock_show_snackbar')
    })

    it('should dispatch CREATE_PROJECT_SUCCESS', () => {
      expect(actions[2].type).toEqual(CREATE_PROJECT_SUCCESS)
      expect(actions[2].project).toEqual(project)
    })
  })

  describe('createProject - failure', () => {
    const matterId = 123,
      name = 'test-project-name'

    let store, actions

    beforeEach(done => {
      projectService.createProject = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.BAD_REQUEST,
          body: {
            errors: [
              {
                message: 'Duplicate Org',
                field: 'name',
                codes: ['unique'],
              },
            ],
          },
        })
      )
      store = mockStore({})
      store.dispatch(createProject(matterId, name)).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call createProject', () => {
      expect(projectService.createProject).toHaveBeenCalledWith(matterId, name)
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch CREATE_PROJECT_FAILURE', () => {
      expect(actions[1].type).toEqual(CREATE_PROJECT_FAILURE)
      expect(actions[1].errorMessage).toEqual(
        'Workstream name must be unique within the matter.'
      )
    })
  })

  describe('updateProject - success', () => {
    const matterId = 123,
      projectId = 222,
      name = 'test-project',
      project = 'updated-project'

    let store, actions

    beforeEach(done => {
      projectService.updateProject = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.OK,
          body: project,
        })
      )

      store = mockStore({})
      store.dispatch(updateProject(matterId, projectId, { name })).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call updateProject', () => {
      expect(projectService.updateProject).toHaveBeenCalledWith(
        matterId,
        projectId,
        { name }
      )
    })

    it('should dispatch UPDATE_PROJECT', () => {
      expect(actions[0].type).toEqual(UPDATE_PROJECT)
      expect(actions[0].projectId).toEqual(projectId)
    })

    it('should dispatch UPDATE_PROJECT_IN_LIST_SUCCESS', () => {
      expect(actions[1].type).toEqual(UPDATE_PROJECT_IN_LIST_SUCCESS_ORG)
      expect(actions[1].project).toEqual(project)
    })
  })

  describe('updateProject - failure', () => {
    const matterId = 123,
      projectId = 222,
      name = 'test-project'

    let store, actions

    beforeEach(done => {
      projectService.updateProject = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.BAD_REQUEST,
          body: {
            errors: [
              {
                message: 'Duplicate org',
                field: 'name',
                codes: ['unique'],
              },
            ],
          },
        })
      )

      store = mockStore({})
      store.dispatch(updateProject(matterId, projectId, { name })).then(() => {
        actions = store.getActions()
        done()
      })
    })

    it('should call updateProject', () => {
      expect(projectService.updateProject).toHaveBeenCalledWith(
        matterId,
        projectId,
        { name }
      )
    })

    it('should dispatch UPDATE_PROJECT', () => {
      expect(actions[0].type).toEqual(UPDATE_PROJECT)
      expect(actions[0].projectId).toEqual(projectId)
    })

    it('should dispatch UPDATE_PROJECT_NAME_FAILURE', () => {
      expect(actions[1].type).toEqual(UPDATE_PROJECT_NAME_FAILURE)
      expect(actions[1].projectId).toEqual(projectId)
      expect(actions[1].errorMessage).toEqual(
        'Workstream name must be unique within the matter.'
      )
    })
  })

  describe('clearErrorMessage - create', () => {
    let store, actions

    beforeEach(done => {
      store = mockStore({})
      store.dispatch(clearErrorMessage())
      actions = store.getActions()
      done()
    })

    it('should dispatch RESET_CREATE_VALIDATION', () => {
      expect(actions[0].type).toEqual(RESET_CREATE_VALIDATION)
    })
  })

  describe('clearErrorMessage - update', () => {
    let store, actions

    beforeEach(done => {
      store = mockStore({})
      store.dispatch(clearErrorMessage(123))
      actions = store.getActions()
      done()
    })

    it('should dispatch RESET_UPDATE_VALIDATION', () => {
      expect(actions[0].type).toEqual(RESET_UPDATE_VALIDATION)
      expect(actions[0].projectId).toEqual(123)
    })
  })

  describe('createProjectFromTemplate - success', () => {
    const matterId = 123,
      templateId = 456,
      name = 'test-project-name',
      project = 'test-project'

    let store, actions

    beforeEach(done => {
      globalSnackBar.showSnackbar = jest
        .fn()
        .mockReturnValueOnce({ type: 'mock_show_snackbar' })
      projectService.createProjectFromTemplate = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.CREATED,
          body: project,
        })
      )
      store = mockStore({})
      store
        .dispatch(
          createProjectFromTemplate(
            matterId,
            templateId,
            name,
            true,
            true,
            true
          )
        )
        .then(() => {
          actions = store.getActions()
          done()
        })
    })

    it('should call createProjectFromTemplate', () => {
      expect(projectService.createProjectFromTemplate).toHaveBeenCalledWith(
        matterId,
        name,
        templateId,
        true,
        true,
        undefined
      )
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch showSnackBar', () => {
      expect(actions[1].type).toEqual('mock_show_snackbar')
    })

    it('should dispatch CREATE_PROJECT_SUCCESS', () => {
      expect(actions[2].type).toEqual(CREATE_PROJECT_SUCCESS)
      expect(actions[2].project).toEqual(project)
    })
  })

  describe('createProjectFromTemplate - failure duplicated name', () => {
    const matterId = 123,
      templateId = 456,
      name = 'test-project-name'

    let store, actions

    beforeEach(done => {
      projectService.createProjectFromTemplate = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          status: StatusCodes.BAD_REQUEST,
          body: {
            errors: [
              {
                message: 'Duplicate org',
                field: 'name',
                codes: ['unique'],
              },
            ],
          },
        })
      )
      store = mockStore({})
      store
        .dispatch(
          createProjectFromTemplate(
            matterId,
            templateId,
            name,
            true,
            true,
            true
          )
        )
        .then(() => {
          actions = store.getActions()
          done()
        })
    })

    it('should call createProject', () => {
      expect(projectService.createProjectFromTemplate).toHaveBeenCalledWith(
        matterId,
        name,
        templateId,
        true,
        true,
        undefined
      )
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch CREATE_PROJECT_FAILURE', () => {
      expect(actions[1].type).toEqual(CREATE_PROJECT_FAILURE)
      expect(actions[1].errorMessage).toEqual(
        'Workstream name must be unique within the matter.'
      )
    })
  })
})

describe('createProjectFromTemplate - failure user does not have permission', () => {
  const matterId = 123,
    templateId = 456,
    name = 'test-project-name'

  let store, actions

  beforeEach(done => {
    projectService.createProjectFromTemplate = jest.fn().mockReturnValueOnce(
      Promise.resolve({
        status: StatusCodes.FORBIDDEN,
        body: {
          code: '259',
        },
      })
    )
    store = mockStore({})
    store
      .dispatch(createProjectFromTemplate(matterId, templateId, name, true))
      .then(() => {
        actions = store.getActions()
        done()
      })
  })

  it('should call createProject', () => {
    expect(projectService.createProjectFromTemplate).toHaveBeenCalledWith(
      matterId,
      name,
      templateId,
      true,
      false,
      undefined
    )
  })

  it('should dispatch CREATE_PROJECT', () => {
    expect(actions[0].type).toEqual(CREATE_PROJECT)
  })

  it('should dispatch CREATE_PROJECT_FAILURE', () => {
    expect(actions[1].type).toEqual(CREATE_PROJECT_FAILURE)
    expect(actions[1].errorMessage).toEqual(
      'You must be a matter admin to create workstreams.'
    )
  })
})

describe('createProjectFromTemplateTask', () => {
  describe('- success', () => {
    const matterId = 123,
      templateTaskId = 456,
      name = 'test-project-name',
      project = 'test-project'

    let store, actions

    beforeEach(done => {
      globalSnackBar.showSnackbar = jest
        .fn()
        .mockReturnValueOnce({ type: 'mock_show_snackbar' })
      projectService.createProjectFromTemplateTask = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.CREATED,
            body: project,
          })
        )
      store = mockStore({})
      store
        .dispatch(
          createProjectFromTemplateTask(
            matterId,
            templateTaskId,
            name,
            true,
            true
          )
        )
        .then(() => {
          actions = store.getActions()
          done()
        })
    })

    it('should call createProjectFromTemplateTask', () => {
      expect(projectService.createProjectFromTemplateTask).toHaveBeenCalledWith(
        matterId,
        name,
        templateTaskId,
        true,
        true
      )
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch CREATE_PROJECT_SUCCESS', () => {
      expect(actions[2].type).toEqual(CREATE_PROJECT_SUCCESS)
      expect(actions[2].project).toEqual(project)
    })
  })

  describe(' - failure duplicated name', () => {
    const matterId = 123,
      templateTaskId = 456,
      name = 'test-project-name'

    let store, actions

    beforeEach(done => {
      projectService.createProjectFromTemplateTask = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.BAD_REQUEST,
            body: {
              errors: [
                {
                  message: 'Duplicate org',
                  field: 'name',
                  codes: ['unique'],
                },
              ],
            },
          })
        )
      store = mockStore({})
      store
        .dispatch(
          createProjectFromTemplateTask(matterId, templateTaskId, name, true)
        )
        .then(() => {
          actions = store.getActions()
          done()
        })
    })

    it('should call createProject', () => {
      expect(projectService.createProjectFromTemplateTask).toHaveBeenCalledWith(
        matterId,
        name,
        templateTaskId,
        true,
        false
      )
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch CREATE_PROJECT_FAILURE', () => {
      expect(actions[1].type).toEqual(CREATE_PROJECT_FAILURE)
      expect(actions[1].errorMessage).toEqual(
        'Workstream name must be unique within the matter.'
      )
    })
  })

  describe(' - failure user does not have permission', () => {
    const matterId = 123,
      templateTaskId = 456,
      name = 'test-project-name'

    let store, actions

    beforeEach(done => {
      projectService.createProjectFromTemplateTask = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.FORBIDDEN,
            body: {
              code: '259',
            },
          })
        )
      store = mockStore({})
      store
        .dispatch(
          createProjectFromTemplateTask(matterId, templateTaskId, name, true)
        )
        .then(() => {
          actions = store.getActions()
          done()
        })
    })

    it('should call createProject', () => {
      expect(projectService.createProjectFromTemplateTask).toHaveBeenCalledWith(
        matterId,
        name,
        templateTaskId,
        true,
        false
      )
    })

    it('should dispatch CREATE_PROJECT', () => {
      expect(actions[0].type).toEqual(CREATE_PROJECT)
    })

    it('should dispatch CREATE_PROJECT_FAILURE', () => {
      expect(actions[1].type).toEqual(CREATE_PROJECT_FAILURE)
      expect(actions[1].errorMessage).toEqual(
        'You must be a matter admin to create workstreams.'
      )
    })
  })
})
