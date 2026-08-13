/*
Purpose: A useful set of default data and users for developers.


Last Updated: 18/03/2022
*/
// Name : 'seed.cy' (for e2e checker)
import HttpStatus from 'http-status-codes'
import { getProjectForValidation } from '../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../helpers/matterprojects/task_api_helper'
import {
  createTemplate,
  createTemplateTaskLink,
  createTemplateTaskNote,
} from '../../../helpers/templates/template_api_helper'
import {
  createOrganisationUser,
  createUserFromUsername,
} from '../../../helpers/users/user_api_helper'

//If dev mode is true, then a prefix is added to the Username.
const DEV_MODE = false

let prefix = DEV_MODE ? new Date().getTime().toString().slice(8) : ''
let fixture1, fixture, appPage
let jurUser, jurOrgAdmin, jurViewer
let users = []
let archivedNote

const createFillerOrgTestUsers = number => {
  createOrganisationUser({
    firstname: 'User' + number,
    lastname: 'User' + number,
    username: prefix + 'juruser' + number + '@juralio.com',
    email: prefix + 'juruser' + number + '@juralio.com',
  }).then(createdUser => {
    users.push(createdUser)
  })
}

const createDefaultOrgTestUsers = () => {
  createUserFromUsername(
    prefix + 'juruser@juralio.com',
    'Juralio',
    'User',
    true,
    true,
    true
  ).then(createdUser => {
    jurUser = createdUser

    createUserFromUsername(
      prefix + 'jurorgadmin@juralio.com',
      'Org',
      'Admin'
    ).then(createdUser => {
      jurOrgAdmin = createdUser

      createUserFromUsername(
        prefix + 'jurviewer@juralio.com',
        'AMatter',
        'VViewer'
      ).then(createdUser => {
        jurViewer = createdUser
      })
    })
  })
}

const createMatterWorkstream = () => {
  const workstreams = []
  workstreams.push(...getProjectForValidation('Seed'))
  workstreams.push({
    name: 'Workstream with Archived Items',
    tasks: [{ name: 'Climb every mountain' }, { name: 'Forge every stream' }],
  })

  const seed = {
    matter: {
      prefix: 'New Matter',
      teamMembers: [jurUser, ...users],
      matterViewer: [jurViewer],
      matterAdmins: [jurUser],
      projects: workstreams,
    },
  }

  fixture1 = generateFixture(seed)
  appPage = getWrapper(fixture1)
}

describe('seed_spec - create a useful set of data for development', () => {
  before(() => {
    createDefaultOrgTestUsers()
  })

  describe('Create extra organisation users', () => {
    before(() => {
      cy.login(jurOrgAdmin.username)
      for (let i = 0; i < 10; i++) createFillerOrgTestUsers(i)
    })

    describe('Create a matter and workstream', () => {
      before(() => {
        cy.login(jurUser.username)
        createMatterWorkstream()
      })

      describe('Create template and a selection of posts', () => {
        before(() => {
          cy.login(jurUser.username)
          createTemplate('Sample Template', fixture1.projects[0].id).then(
            template => {
              for (let i = 0; i < template.tasks.length; i++) {
                createTemplateTaskNote(
                  template.id,
                  template.tasks[i].id,
                  'Test Post [' + i + ']',
                  'This is sample text.'.repeat(i * i)
                )
                createTemplateTaskLink(
                  template.id,
                  template.tasks[i].id,
                  'Test Post [' + i + ']',
                  'This is sample text.'.repeat(i * i),
                  'https://en.wikipedia.org/wiki/Squirrel',
                  'Word document'
                )
              }
            }
          )
          addWorkstreamPosts(addPostToWorkstreamTask)
          addNoteToTask(
            fixture1.projects[1].matter.id,
            fixture1.projects[1].id,
            fixture1.tasks[22].id,
            {
              name: 'This is an archived note.',
              finalised: false,
              privateNote: false,
              description: '<p>Unlimited power!</p>',
            }
          ).then(result => {
            archivedNote = result
          })
        })
        describe('Archive a task', () => {
          before(() => {
            cy.login(jurUser.username)
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/matter/${
                fixture1.projects[1].matter.id
              }/workstreams/${fixture1.projects[1].id}/task/${
                fixture1.tasks[21].id
              }/archive`,
              method: 'POST',
              body: {},
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.OK)
            })
          })
          it('All done.', () => {
            cy.wait(100)
          })
        })
        describe('Archive a post', () => {
          before(() => {
            cy.login(jurUser.username)
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/matter/${
                fixture1.projects[1].matter.id
              }/workstreams/${fixture1.projects[1].id}/task/${
                fixture1.tasks[22].id
              }/post/${archivedNote.id}`,
              method: 'PATCH',
              body: { archive: true },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.OK)
            })
          })
          it('All done.', () => {
            cy.wait(100)
          })
        })
        describe('Create and Empty Workstreams Matter.', () => {
          before(() => {
            const seed = {
              matter: {
                prefix: 'Empty Workstreams Matter',
                teamMembers: [jurUser],
                matterAdmins: [jurUser],
                projects: [{ name: 'No Tasks' }, { name: 'Empty Workstream' }],
              },
            }
            fixture = generateFixture(seed)
          })
          it('All done.', () => {
            cy.wait(100)
          })
        })
      })
    })
  })

  const addPostToWorkstreamTask = (taskIndex, note) => {
    addNoteToTask(
      fixture1.matter.id,
      fixture1.projects[0].id,
      fixture1.tasks[taskIndex].id,
      note
    )
  }
})

const addWorkstreamPosts = addPostToWorkstreamTask => {
  addPostToWorkstreamTask(0, {
    name: 'This is a note.',
    description: '<p>This is a test note.</p>',
  })
  addPostToWorkstreamTask(0, {
    name: 'This is a private note.',
    privateNote: true,
    description: '<p>Sensitive information.</p>',
  })
  addPostToWorkstreamTask(0, {
    name: 'This is a link.',
    url: 'http://www.bing.com',
    type: 'Link',
    description: '<p>Best search engine in the world.</p>',
  })
  addPostToWorkstreamTask(0, {
    name: 'This is a finalised note.',
    finalised: true,
    description: '<p>Finalised information.</p>',
  })
  addPostToWorkstreamTask(0, {
    name: 'This is a private and finalised note.',
    finalised: true,
    privateNote: true,
    description: '<p>Sensitive finalised information.</p>',
  })
}
