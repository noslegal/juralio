import { ROLE } from './constants'

export const getImports = () => `
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
import { getNotifications } from '../../../../helpers/notifications/notifications_api_helper'
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
  `

export const getBeforeAll = () => `
  let ${ROLE.ANONYMOUS},
  ${ROLE.SYS_ADMIN},
  ${ROLE.MATTER_CREATOR},
  ${ROLE.ORG_ADMIN},
  ${ROLE.KNOWLEDGE_MANAGER},
  ${ROLE.MATTER_ADMIN},
  ${ROLE.MATTER_EDITOR},
  ${ROLE.MATTER_VIEWER}
  let organisation,
    matter,
    project,
    task,
    milestone,
    post,
    label,
    user,
    notification,
    template,
    templateTask,
    templatePost
  let endpoint

before(() => {
  const resetPassword = true
  const assignDefaultOrg = false
  // ${ROLE.ANONYMOUS} is a user not logged in
  // ${ROLE.SYS_ADMIN} is default sysadmin account
  // create ${ROLE.MATTER_CREATOR}
  createUser('${ROLE.MATTER_CREATOR}', resetPassword, assignDefaultOrg, {
  roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
  })
  .then(createdUser => {
    ${ROLE.MATTER_CREATOR} = createdUser
  })
  // create ${ROLE.ORG_ADMIN}
  .then(() => {
    return createUser('${ROLE.ORG_ADMIN}', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER', 'ROLE_ORG_ADMIN'],
    })
  })
  .then(createdUser => {
    ${ROLE.ORG_ADMIN} = createdUser
  })
  // create ${ROLE.KNOWLEDGE_MANAGER}
  .then(() => {
    return createUser('${ROLE.KNOWLEDGE_MANAGER}', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
    })
  })
  .then(createdUser => {
    ${ROLE.KNOWLEDGE_MANAGER} = createdUser
  })
  // create ${ROLE.MATTER_ADMIN}
  .then(() => {
    return createUser('${ROLE.MATTER_ADMIN}', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
    })
  })
  .then(createdUser => {
    ${ROLE.MATTER_ADMIN} = createdUser
  })
  // create ${ROLE.MATTER_EDITOR}
  .then(() => {
    return createUser('${ROLE.MATTER_EDITOR}', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER'],
    })
  })
  .then(createdUser => {
    ${ROLE.MATTER_EDITOR} = createdUser
  })
  // create ${ROLE.MATTER_VIEWER}
  .then(() => {
    return createUser('${ROLE.MATTER_VIEWER}', resetPassword, assignDefaultOrg, {
      roles: ['ROLE_USER'],
    })
  })
  .then(createdUser => {
    ${ROLE.MATTER_VIEWER} = createdUser
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
    return sysadminAddUserToOrganisation(organisation, ${ROLE.MATTER_CREATOR})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, ${ROLE.ORG_ADMIN})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, ${ROLE.KNOWLEDGE_MANAGER})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, ${ROLE.MATTER_ADMIN})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, ${ROLE.MATTER_EDITOR})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, ${ROLE.MATTER_VIEWER})
  })
  .then(() => {
    return sysadminAddUserToOrganisation(organisation, user)
  })
  // Create matter
  .then(() => {
    return createMatter('matter', ${ROLE.MATTER_CREATOR}.username)
  })
  .then(createdMatter => {
    matter = createdMatter
  })
  // Add users to matter
  .then(() => {
    addMatterAdmin(matter.id, ${ROLE.MATTER_ADMIN}.id, ${ROLE.MATTER_CREATOR}.username)
    addTeamMember(matter.id, ${ROLE.MATTER_EDITOR}.id, ${ROLE.MATTER_CREATOR}.username)
    addMatterViewer(matter.id, ${ROLE.MATTER_VIEWER}.id, ${ROLE.MATTER_CREATOR}.username)
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
  // Get a notification
  .then(() => getNotifications(user))
  .then(notifications => (notification = notifications[0]))
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
`

export const getCypressHelpers = () => `
  const makeRequest = (endpoint, method, body) => {
      let url = \`\${Cypress.env('serverBaseUrl')}\${endpoint}\`
      url = url.replace('/api', '')
      return cy.apiSpecRequest({
        url: url,
        method: method,
        body: body,
      })
    }
  `

export const loginUser = role => {
  if (role === ROLE.ANONYMOUS) {
    return 'cy.logoutServerSide()'
  } else if (role === ROLE.SYS_ADMIN) {
    return "cy.login('sysadmin@juralio.com', 'Password1Password1$')"
  }
  return `cy.login(${role}, 'Password2Password2$')`
}

export const getExpectation = (role, verb, config) => {
  const expectedResponse = config.permissions[`${verb}`]
  if (expectedResponse === 'OK') {
    return {
      itText: 'should return OK status',
      expect: 'expect(response.status).to.eq(HttpStatus.OK)',
    }
  } else if (expectedResponse === 'Redirection response (300-399)') {
    return {
      itText: 'should return redirection response',
      expect: 'expect(response.status).to.be.within(300, 399)',
    }
  } else {
    return {
      itText: 'should return client error response',
      expect: 'expect(response.status).to.be.within(400, 499)',
    }
  }
}

export const getBody = (role, verb, config) => {
  return {}
}

export const getCypressTemplate = () => `
${getImports()}
describe('<TESTNAME>', () => {
    ${getBeforeAll()}
    ${getCypressHelpers()}
    <TESTS>
})
  `

export const mutateEndpoint = endpoint =>
  endpoint
    .replace('organisations/$id', 'organisations/${organisation?.id}')
    .replace('$organisationId', '${organisation?.id}')
    // Matter
    .replace('matter/$id', 'matter/${matter?.id}')
    .replace('matters/$id?', 'matters/${matter?.id}')
    .replace('$matterId', '${matter?.id}')
    .replace('$matter_id', '${matter?.id}')
    // Project
    .replace('projects/$id', 'projects/${project?.id}')
    .replace('$projectId', '${project?.id}')
    .replace('$project_id', '${project?.id}')
    // Task
    .replace('tasks/$id', 'tasks/${task?.id}')
    .replace('task/$id', 'task/${task?.id}')
    .replace('$taskId', '${task?.id}')
    .replace('$task_id', '${task?.id}')
    // Post
    .replace('posts/$id', 'posts/${post?.id}')
    .replace('$postId', '${post?.id}')
    .replace('$post_id', '${post?.id}')
    // Template
    .replace('projecttemplates/$id', '${template?.id}')
    .replace('$templateId', '${template?.id}')
    .replace('$template_id', '${template?.id}')
    // Template task
    .replace('$templateTaskId', '${templateTask?.id}')
    // Template post
    .replace('$templatePostId', '${templatePost?.id}')
    // Notification
    .replace('usernotifications/$id', 'usernotifications/${notification?.id}')
    // Label
    .replace('$labelId', '${label?.id}')
    .replace('$label_id', '${label?.id}')
    // User
    .replace('user/$id', 'user/${user?.id}')
    .replace('users/$id', 'users/${user?.id}')
    .replace('$userId', '${user?.id}')
    .replace('$user_id', '${user?.id}')
    // Matter editor
    .replace('teammembers/$id', 'teammembers/${matterEditor?.id}')
    // Matter viewer
    .replace('viewers/$id', 'viewers/${matterViewer?.id}')
