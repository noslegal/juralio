import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('project_overview_posts.cy', () => {
  let testUser, fixture, matter, project, postId

  before(() => {
    createUser('ZZZ')
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec with Tasks',
                tasks: [{ name: 'Task1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        matter = fixture.matter
        project = fixture.projects[0]
      })
  })

  describe('When navigating to project overview with no posts', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
    })

    it('should show the posts header', () => {
      cy.wait(2000)
      cy.get('[data-test=post-count]').should('have.text', '0 Posts')
    })
  })

  describe('When navigating to project overview with 3 posts', () => {
    before(() => {
      cy.login(testUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/posts`,
        method: 'POST',
        body: { name: 'Notey note 1', description: 'A test note.' },
      }).then(() => {
        cy.wait(2000) // Ensure last updated is different
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/posts`,
          method: 'POST',
          body: { name: 'Notey note 2', description: 'A test note.' },
        }).then(() => {
          cy.wait(2000) // Ensure last updated is different
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/posts`,
            method: 'POST',
            body: { name: 'Notey note 3', description: 'A test note 3.' },
          }).then(response => {
            postId = response.body.id
          })
        })
      })
      visitHelpers.visitProjectOverview(matter.id, project.id)
    })

    it('should show the posts header', () => {
      cy.wait(2000)
      cy.get('[data-test=post-count]').should('have.text', '3 Posts')
    })
  })

  describe('when selecting the posts tab', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
      cy.wait(1000)
      cy.get('[data-test=workstream-content]').click()
      cy.get('[data-test=post-tab]').eq(0).click()
    })
    it('should display the projects posts', () => {
      cy.get('[data-test=postColumnHeader]').should('be.visible')
    })

    describe('clicking a row', () => {
      before(() => {
        cy.get('[data-rowindex=0] [data-colindex=1]').click()
      })
      it('should redirect to the post details', () => {
        cy.url().should(
          'contain',
          `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}/post/`
        )
      })
    })
  })
  describe('when selecting the tasks tab', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
      cy.wait(1000)
      cy.get('[data-test=workstream-content]').click()
    })

    it('displays the correct title and description', () => {
      cy.get('[data-test=content-title]').should(
        'contain.text',
        'Workstream content'
      )
    })

    describe('clicking a row', () => {
      before(() => {
        cy.get('[data-test=task-tab]').eq(0).click()
        cy.get('[data-test=task-name]').click()
      })

      it('should redirect to the task details', () => {
        cy.url().should(
          'contain',
          `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
        )
      })
    })
  })
})
