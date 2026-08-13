import HttpStatus from 'http-status-codes'
import { createOrganisationLabel } from '../../../../helpers/labels/labels_api_helper'
import {
  addMatterAdmin,
  addMatterViewer,
  addTeamMember,
  createMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import {
  addNoteToTask,
  createTask,
} from '../../../../helpers/matterprojects/task_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplate,
  createTemplateTask,
  createTemplateTaskPost,
} from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('all_endpoints_matterViewer_permissions.cy', () => {
  let anonymous,
    sysAdmin,
    matterCreator,
    orgAdmin,
    knowledgeManager,
    matterAdmin,
    matterEditor,
    matterViewer
  let organisation,
    matter,
    project,
    task,
    milestone,
    post,
    label,
    user,
    template,
    templateTask,
    templatePost
  let endpoint

  before(() => {
    const resetPassword = true
    const assignDefaultOrg = false
    // anonymous is a user not logged in
    // sysAdmin is default sysadmin account
    // create matterCreator
    createUser('matterCreator', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
    })
      .then(createdUser => {
        matterCreator = createdUser
      })
      // create orgAdmin
      .then(() => {
        return createUser('orgAdmin', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
        })
      })
      .then(createdUser => {
        orgAdmin = createdUser
      })
      // create knowledgeManager
      .then(() => {
        return createUser('knowledgeManager', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
        })
      })
      .then(createdUser => {
        knowledgeManager = createdUser
      })
      // create matterAdmin
      .then(() => {
        return createUser('matterAdmin', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
        })
      })
      .then(createdUser => {
        matterAdmin = createdUser
      })
      // create matterEditor
      .then(() => {
        return createUser('matterEditor', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER'],
        })
      })
      .then(createdUser => {
        matterEditor = createdUser
      })
      // create matterViewer
      .then(() => {
        return createUser('matterViewer', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER'],
        })
      })
      .then(createdUser => {
        matterViewer = createdUser
      })
      // create user
      .then(() => {
        return createUser('user', resetPassword, assignDefaultOrg, {
          roles: ['ROLE_USER'],
        })
      })
      .then(createdUser => {
        user = createdUser
      })
      // create organisation
      .then(() => {
        const MFAEnabled = false
        return createOrganisation('org' + new Date().toISOString(), MFAEnabled)
      })
      // add users to organisation
      .then(createdOrganisation => {
        organisation = createdOrganisation.body
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, matterCreator)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, orgAdmin)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, knowledgeManager)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, matterAdmin)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, matterEditor)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, matterViewer)
      })
      .then(() => {
        return sysadminAddUserToOrganisation(organisation, user)
      })
      // Create matter
      .then(() => {
        return createMatter('matter', matterCreator.username)
      })
      .then(createdMatter => {
        matter = createdMatter
      })
      // Add users to matter
      .then(() => {
        addMatterAdmin(matter.id, matterAdmin.id, matterCreator.username)
        addTeamMember(matter.id, matterEditor.id, matterCreator.username)
        addMatterViewer(matter.id, matterViewer.id, matterCreator.username)
      })
      // Create workstream
      .then(() => {
        createProject(matter.id, 'project')
      })
      .then(createdProject => (project = createdProject))
      // Create task
      .then(() => {
        createTask(matter.id, project.id, 'not-started', 'task')
      })
      .then(createdTask => (task = createdTask))
      // Create milestone
      .then(() => {
        const isMilestone = true
        return createTask(
          matter.id,
          project.id,
          'in-progress',
          'milestone',
          isMilestone
        )
      })
      .then(createdMilestone => (milestone = createdMilestone))
      // Create post
      .then(() =>
        addNoteToTask(matter.id, project.id, task.id, {
          name: 'post',
          privatePost: false,
          finalised: true,
        })
      )
      .then(createdPost => {
        post = createdPost
      })
      // Create label
      .then(() => createOrganisationLabel(orgAdmin, 'orgLabel', 'risk'))
      .then(createdLabel => {
        label = createdLabel
      })
      // Create template
      .then(() => {
        cy.login(knowledgeManager.username)
        return createTemplate('template')
      })
      .then(createdTemplate => (template = createdTemplate))
      // Create template task
      .then(() => {
        createTemplateTask(template.id, null, 'templateTask')
      })
      .then(createdTemplateTask => (templateTask = createdTemplateTask))
      // Create template post
      .then(() =>
        createTemplateTaskPost(template.id, templateTask.id, 'templatePost')
      )
      .then(createdTemplatePost => (templatePost = createdTemplatePost))
  })

  const makeRequest = (endpoint, method, body) => {
    let url = `${Cypress.env('serverBaseUrl')}${endpoint}`
    url = url.replace('/api', '')
    return cy.apiSpecRequest({
      url: url,
      method: method,
      body: body,
    })
  }

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisations/`
    })

    describe('when making a POST request to /api/organisations/', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisations/', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisations/', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisations/', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisations/${organisation?.id}`
    })

    describe('when making a POST request to /api/organisations/${organisation?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisations/${organisation?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisations/${organisation?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisations/${organisation?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisation`
    })

    describe('when making a POST request to /api/organisation', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisation', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/organisation', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisation', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisations/${organisation?.id}/users`
    })

    describe('when making a POST request to /api/organisations/${organisation?.id}/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisations/${organisation?.id}/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisations/${organisation?.id}/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisations/${organisation?.id}/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisations/${organisation?.id}/logo`
    })

    describe('when making a POST request to /api/organisations/${organisation?.id}/logo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisations/${organisation?.id}/logo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisations/${organisation?.id}/logo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisations/${organisation?.id}/logo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matters`
    })

    describe('when making a POST request to /api/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matters/shared`
    })

    describe('when making a POST request to /api/matters/shared', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/matters/shared', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matters/shared', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matters/shared', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matters/search/teammembers`
    })

    describe('when making a POST request to /api/matters/search/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/matters/search/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matters/search/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matters/search/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/team`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/team', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/team', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/team', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/team', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/matters`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/matters', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/matters/${matter?.id}`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/matters/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/matters/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/matters/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/matters/${matter?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/teammembers`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/teammembers/${matterEditor?.id}?`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/teammembers/${matterEditor?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/teammembers/${matterEditor?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/teammembers/${matterEditor?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/teammembers/${matterEditor?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/viewers`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/viewers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/viewers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/viewers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/viewers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/viewers/${matterViewer?.id}?`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/viewers/${matterViewer?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/viewers/${matterViewer?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/viewers/${matterViewer?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/viewers/${matterViewer?.id}?', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/matter/${matter?.id}/workstreams/${project?.id}`
    })

    describe('when making a POST request to /api/admin/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/preview`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/visit`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/link`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/tasks/new`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/new', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/new', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/new', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/new', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/tasks/${task?.id}/seen`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/${task?.id}/seen', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/${task?.id}/seen', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/${task?.id}/seen', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks/${task?.id}/seen', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/tasks`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/tasks/archived`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/tasks/archived', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/tasks/archived', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/tasks/archived', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/tasks/archived', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/siblings`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/siblings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/siblings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/siblings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/siblings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/link`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/link', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers/${user?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/followers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {
          body: {
            user: { id: 1 },
          },
        }).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers/${user?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/teammembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/copy`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/move`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/archive`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/archive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/archive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/archive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/archive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/unarchive`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/unarchive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/unarchive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/unarchive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/unarchive', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/checkConsistency`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/checkConsistency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/checkConsistency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/checkConsistency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/checkConsistency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/tasks/recent`
    })

    describe('when making a POST request to /api/tasks/recent', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/tasks/recent', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/tasks/recent', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/tasks/recent', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/search/users/${user?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/search/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/search/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/search/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/search/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/search/users`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/search/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/search/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/search/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/search/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/tasksAffected`
    })

    describe('when making a POST request to /api/tasksAffected', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/tasksAffected', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/tasksAffected', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/tasksAffected', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/posts`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors/${user?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/authors/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers/${user?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/postmembers/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/move`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/post/${post?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/posts`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/post/${post?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/post/${post?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usage`
    })

    describe('when making a POST request to /api/usage', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usage', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usage', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usage', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usage/report/summary`
    })

    describe('when making a POST request to /api/usage/report/summary', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usage/report/summary', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usage/report/summary', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usage/report/summary', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usage/report/month`
    })

    describe('when making a POST request to /api/usage/report/month', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usage/report/month', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usage/report/month', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usage/report/month', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/users/search`
    })

    describe('when making a POST request to /api/users/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/users/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/users/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/users/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/users`
    })

    describe('when making a POST request to /api/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/users', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/user`
    })

    describe('when making a POST request to /api/user', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/user', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/user', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/user', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/users/${user?.id}`
    })

    describe('when making a POST request to /api/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/users/${user?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/password`
    })

    describe('when making a POST request to /api/settings/user/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/users/${user?.id}/password`
    })

    describe('when making a POST request to /api/settings/users/${user?.id}/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/users/${user?.id}/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/users/${user?.id}/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/users/${user?.id}/password', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/updateftue`
    })

    describe('when making a POST request to /api/settings/user/updateftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/updateftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/updateftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/updateftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/${user?.id}/resetftue`
    })

    describe('when making a POST request to /api/settings/user/${user?.id}/resetftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/${user?.id}/resetftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/${user?.id}/resetftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/${user?.id}/resetftue', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/${user?.id}/visit`
    })

    describe('when making a POST request to /api/settings/user/${user?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/${user?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/${user?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/${user?.id}/visit', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/tours`
    })

    describe('when making a POST request to /api/settings/user/tours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/tours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/tours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/tours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/completeTour`
    })

    describe('when making a POST request to /api/settings/user/completeTour', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/completeTour', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/completeTour', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/completeTour', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/settings/user/${user?.id}/resetTours`
    })

    describe('when making a POST request to /api/settings/user/${user?.id}/resetTours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/settings/user/${user?.id}/resetTours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/settings/user/${user?.id}/resetTours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/settings/user/${user?.id}/resetTours', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/${user / user?.id}/todo`
    })

    describe('when making a POST request to /api/${user/user?.id}/todo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/${user/user?.id}/todo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/${user/user?.id}/todo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/${user/user?.id}/todo', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates`
    })

    describe('when making a POST request to /api/projecttemplates', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/${template?.id}`
    })

    describe('when making a POST request to /api/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/${template?.id}/preview`
    })

    describe('when making a POST request to /api/${template?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/${template?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/${template?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/${template?.id}/preview', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/projecttemplates/${template?.id}`
    })

    describe('when making a POST request to /api/admin/projecttemplates/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/projecttemplates/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/projecttemplates/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/projecttemplates/${template?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/search`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${task?.id}`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${task?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${task?.id}/copy`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${task?.id}/move`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${task?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/copy`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/copy', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/favourite`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/favourite', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/favourite', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/favourite', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/favourite', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}/move`
    })

    describe('when making a POST request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/projecttemplates/${template?.id}/tasks/${templateTask?.id}/posts/${templatePost?.id}/move', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usernotifications`
    })

    describe('when making a POST request to /api/usernotifications', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usernotifications', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/usernotifications', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usernotifications', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usernotifications/count`
    })

    describe('when making a POST request to /api/usernotifications/count', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usernotifications/count', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/usernotifications/count', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usernotifications/count', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usernotifications/read-all`
    })

    describe('when making a POST request to /api/usernotifications/read-all', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a GET request to /api/usernotifications/read-all', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usernotifications/read-all', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usernotifications/read-all', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usernotifications/999999999/read`
    })

    describe('when making a POST request to /api/usernotifications/${notification?.id}/read', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usernotifications/${notification?.id}/read', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usernotifications/${notification?.id}/read', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usernotifications/${notification?.id}/read', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/usernotifications/999999999/dismiss`
    })

    describe('when making a POST request to /api/usernotifications/${notification?.id}/dismiss', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/usernotifications/${notification?.id}/dismiss', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/usernotifications/${notification?.id}/dismiss', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/usernotifications/${notification?.id}/dismiss', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/notificationfilteruserrecency`
    })

    describe('when making a POST request to /api/notificationfilteruserrecency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/notificationfilteruserrecency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/notificationfilteruserrecency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/notificationfilteruserrecency', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/todo/search`
    })

    describe('when making a POST request to /api/todo/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/todo/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/todo/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/todo/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/search`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/search', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/universal/fuzzysearch`
    })

    describe('when making a POST request to /api/universal/fuzzysearch', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/universal/fuzzysearch', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/universal/fuzzysearch', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/universal/fuzzysearch', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/labels/system`
    })

    describe('when making a POST request to /api/labels/system', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/labels/system', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/labels/system', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/labels/system', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/labels`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/labels/${label?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisation/labels/${label?.id}`
    })

    describe('when making a POST request to /api/organisation/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisation/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisation/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisation/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/organisation/labels`
    })

    describe('when making a POST request to /api/organisation/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/organisation/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/organisation/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/organisation/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels/${label?.id}`
    })

    describe('when making a POST request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/matter/${matter?.id}/workstreams/${project?.id}/task/${task?.id}/labels/${label?.id}', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/health`
    })

    describe('when making a POST request to /health', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /health', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /health', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /health', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/version`
    })

    describe('when making a POST request to /version', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /version', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /version', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /version', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/mslogin`
    })

    describe('when making a POST request to /mslogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /mslogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return an error status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /mslogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /mslogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/oktalogin`
    })

    describe('when making a POST request to /oktalogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    // describe('when making a GET request to /oktalogin', () => {
    //   beforeEach(() => {
    //     cy.login(matterViewer, 'Password2Password2$')
    //   })
    //   it('should return client error response', () => {
    //     makeRequest(endpoint, 'GET', {})
    //     .then(response => {
    //       expect(response.status).to.be.within(400, 499)
    //     })
    //   })
    // })

    describe('when making a PATCH request to /oktalogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /oktalogin', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/experimental`
    })

    describe('when making a POST request to /experimental', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /experimental', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /experimental', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /experimental', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/instance/settings`
    })

    describe('when making a POST request to /instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return OK status', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when making a PATCH request to /instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })

  describe('when as a matterViewer user', () => {
    let endpoint = ''
    before(() => {
      endpoint = `/api/admin/instance/settings`
    })

    describe('when making a POST request to /api/admin/instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'POST', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a GET request to /api/admin/instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'GET', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a PATCH request to /api/admin/instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'PATCH', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })

    describe('when making a DELETE request to /api/admin/instance/settings', () => {
      beforeEach(() => {
        cy.login(matterViewer, 'Password2Password2$')
      })
      it('should return client error response', () => {
        makeRequest(endpoint, 'DELETE', {}).then(response => {
          expect(response.status).to.be.within(400, 499)
        })
      })
    })
  })
})
