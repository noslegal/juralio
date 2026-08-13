import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('patch_template_task_post.cy', () => {
  let orgUsers, otherOrgUsers, fixture
  let template, templateId, templateTaskId, postUrl, taskUrl

  const sendRequest = body => {
    return cy.apiSpecRequest({
      url: postUrl,
      method: 'PATCH',
      body: body,
    })
  }

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'task a' }, { name: 'Task 2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when trying to patch a post to a given template', () => {
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template test',
          projectId: fixture.projects[0].id,
        },
      }).then(response => {
        template = response.body
        templateId = template.id
        templateTaskId = template.tasks[0].id
        taskUrl = `${Cypress.env(
          'serverBaseUrl'
        )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`
        cy.apiSpecRequest({
          url: taskUrl,
          method: 'POST',
          body: { name: 'Monkey', privatePost: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
          postUrl = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts/${
            response.body.id
          }`
        })
      })
    })

    const DATASET = [
      { name: 'update the name' },
      { description: 'update the description' },
      {
        name: 'Update the name',
        description: 'Update the description',
      },
      {
        name: 'Update the name',
        description: 'Update the description',
        url: 'Update the url',
      },
      {
        link: 'http://bing.com', //Invalid field.
      },
      {
        url: "javascript:alert('P0wn3d');",
      },
    ]

    describe('as a standard user', () => {
      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('name only should return FORBIDDEN status', () => {
        sendRequest(DATASET[0]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('description only should return FORBIDDEN status', () => {
        sendRequest(DATASET[1]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('name and description should return FORBIDDEN status', () => {
        cy.wait(1000) // ensure timestamp changes.
        sendRequest(DATASET[2]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('name, description and url should return FORBIDDEN status', () => {
        sendRequest(DATASET[3]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('invalid field only should return FORBIDDEN status', () => {
        sendRequest(DATASET[4]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('invalid url should return FORBIDDEN status', () => {
        sendRequest(DATASET[5]).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a standard user with KM role', () => {
      let lastUpdateDateFirst, lastUpdateDateSecond

      beforeEach(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('name only should return OK status', () => {
        sendRequest(DATASET[0]).then(response => {
          lastUpdateDateFirst = response.body.lastUpdated
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('description only should return OK status', () => {
        sendRequest(DATASET[1]).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('name and description should return OK status', () => {
        cy.wait(1000) // ensure timestamp changes.
        sendRequest(DATASET[2]).then(response => {
          lastUpdateDateSecond = response.body.lastUpdated
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('name, description and url should return OK status', () => {
        sendRequest(DATASET[3]).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('invalid field only should return BAD_REQUEST status', () => {
        sendRequest(DATASET[4]).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('the last updated date has changed', () => {
        assert.notEqual(lastUpdateDateFirst, undefined)
        assert.notEqual(lastUpdateDateSecond, undefined)
        assert.notEqual(lastUpdateDateSecond, lastUpdateDateFirst)
      })
      it('invalid url should return BAD_REQUEST status', () => {
        sendRequest(DATASET[5]).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    //   describe('as other org user', () => {
    //     beforeEach(() => {
    //       cy.login(otherOrgUsers.teamMember.username)
    //     })
    //     it('name only should return FORBIDDEN status', () => {
    //       sendRequest(DATASET[0]).then(response => {
    //         expect(response.status).to.eq(HttpStatus.FORBIDDEN)
    //       })
    //     })
    //     it('description only should return FORBIDDEN status', () => {
    //       sendRequest(DATASET[1]).then(response => {
    //         expect(response.status).to.eq(HttpStatus.FORBIDDEN)
    //       })
    //     })
    //     it('name and description should return FORBIDDEN status', () => {
    //       sendRequest(DATASET[2]).then(response => {
    //         expect(response.status).to.eq(HttpStatus.FORBIDDEN)
    //       })
    //     })
    //     it('name, description and url should return FORBIDDEN status', () => {
    //       sendRequest(DATASET[3]).then(response => {
    //         expect(response.status).to.eq(HttpStatus.FORBIDDEN)
    //       })
    //     })
    //   })

    //   describe('when attempting other Verbs on template posts endpoint', () => {
    //     beforeEach(() => {
    //       cy.login(orgUsers.teamMember.username)
    //     })
    //     ;['PUT'].forEach(method => {
    //       it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
    //         cy.apiSpecRequest({
    //           url: postUrl,
    //           method: method,
    //           body: {},
    //         }).then(response => {
    //           expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
    //         })
    //       })
    //     })
    //   })
  })
  // describe('when trying to patch a post in a different task', () => {
  //   before(() => {
  //     cy.login(orgUsers.teamMember.username)
  //     cy.apiSpecRequest({
  //       url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
  //       method: 'POST',
  //       body: {
  //         name: 'new template test',
  //         projectId: fixture.projects[0].id,
  //       },
  //     }).then(response => {
  //       template = response.body
  //       templateId = template.id
  //       templateTaskId = template.tasks[0].id
  //       postUrl = `${Cypress.env(
  //         'serverBaseUrl'
  //       )}/projecttemplates/${templateId}/tasks/${templateTaskId}/posts`

  //       sendRequest({ name: 'nw', privatePost: false }).then(response => {
  //         let postId = response.body.id
  //         postUrl = `${Cypress.env(
  //           'serverBaseUrl'
  //         )}/projecttemplates/${templateId}/tasks/${
  //           template.tasks[1].id
  //         }/posts/${postId}`
  //       })
  //     })
  //   })
  //   it('should return FORBIDDEN status when accessing from the wrong task', () => {
  //     sendRequest({}).then(response => {
  //       expect(response.status).to.eq(HttpStatus.FORBIDDEN)
  //     })
  //   })
  // })
})
