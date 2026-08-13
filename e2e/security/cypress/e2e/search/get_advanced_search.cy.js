import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { addNoteToTask } from '../../../../helpers/matterprojects/task_api_helper'

describe('get_advanced_search.cy', () => {
  const USER = {
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  const URL = 'search'

  describe('when trying to perform a search when NOT logged in', () => {
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when trying to perform a search as SysAdmin', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
    })
    it('should return OK status and an empty response', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.body.length).to.eq(0)
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when trying to perform a search as an authenticated user', () => {
    beforeEach(() => {
      cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
    })
    it('should return OK status for GET', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for POST', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when searching for items without read access', () => {
    let user, matter1Fixture, newTemplate, projectId
    before(() => {
      createUser('', true, true, '', true).then(createdUser => {
        user = createdUser

        const matterSeed = {
          matter: {
            prefix: 'testMatter',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'MainProject',
                tasks: [{ name: 'Task1' }, { name: 'Task 2' }],
              },
              {
                name: 'OtherProject',
                tasks: [{ name: 'Task 3' }, { name: 'Task 4' }],
              },
            ],
          },
        }

        matter1Fixture = generateFixture(matterSeed)
      })
    })
    describe('when performing each search', () => {
      before(() => {
        cy.login(user.username)
        addNoteToTask(
          matter1Fixture.matter.id,
          matter1Fixture.projects[0].id,
          matter1Fixture.tasks[0].id,
          {
            name: 'Note',
            description: 'Trains are wonderful machines.',
            finalised: false,
          }
        )

        projectId = matter1Fixture.projects[0].id
        createTemplate('TestTemplate', projectId).then(template => {
          newTemplate = template
        })
      })
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })
      it('should return 0 results  when searching for the matter name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}?query=testMatter`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return 0 results when searching for the workstream name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}?query=MainProject`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return 0 results  when searching for the task name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}?query=Task1`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return 0 results  when searching for the post name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}?query=note`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return 0 results  when searching for the template name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}?query=TestTemplate`,
          method: 'GET',
        }).then(response => {
          expect(response.body.length).to.eq(0)
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
