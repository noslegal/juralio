/*
Purpose: Templates Posts are protected for being exposed to other orgs. General testing.

Test flow:  Create orgs and content. Access 1 post from another.


Date created: 10/12/2021
*/

import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'

describe('move_template_task_post.cy', () => {
  let organisation1, orgAdminUser1, orgMC1, orgKM1, fixture1
  let organisation2, orgAdminUser2, orgMC2, orgKM2, fixture2

  let post1
  let template1
  let template2
  let templatePostUrl1, templatePostsUrl1
  let templatePostUrl2, templatePostsUrl2

  before(() => {
    setupOrganisationWithMatter(true, [
      { name: 'task 1' },
      { name: 'task 2' },
    ]).then(result => {
      organisation1 = result.organisationLabels
      orgAdminUser1 = result.orgAdminUser
      orgMC1 = result.orgMC
      fixture1 = result.fixture
      orgKM1 = result.orgKM

      cy.login(orgKM1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template test',
          projectId: fixture1.projects[0].id,
        },
      }).then(response => {
        template1 = response.body

        templatePostsUrl1 = `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template1.id
        }/tasks/${template1.tasks[0].id}/posts`

        cy.login(orgKM1.username)
        cy.apiSpecRequest({
          url: templatePostsUrl1,
          method: 'POST',
          body: { name: 'nw', privatePost: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
          post1 = response.body
          templatePostUrl1 = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${template1.id}/tasks/${
            template1.tasks[0].id
          }/posts/${post1.id}/move`
        })
      })
    })

    setupOrganisationWithMatter(true, [
      { name: 'task 1' },
      { name: 'task 2' },
    ]).then(result => {
      organisation2 = result.organisationLabels
      orgAdminUser2 = result.orgAdminUser
      orgMC2 = result.orgMC
      orgKM2 = result.orgKM
      fixture2 = result.fixture

      cy.login(orgKM2.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template test',
          projectId: fixture2.projects[1].id,
        },
      }).then(response => {
        template2 = response.body

        templatePostsUrl2 = `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template2.id
        }/tasks/${template2.tasks[0].id}/posts`

        cy.login(orgKM2.username)
        cy.apiSpecRequest({
          url: templatePostsUrl2,
          method: 'POST',
          body: { name: 'nw', privatePost: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
          let post = response.body
          templatePostUrl2 = `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${template2.id}/tasks/${
            template2.tasks[0].id
          }/posts/${post.id}/move`
        })
      })
    })
  })

  describe('when not logged in moving a post between template tasks Org1', () => {
    it('should return UNAUTHORIZED status', () => {
      cy.logoutServerSide()
      cy.apiSpecRequest({
        url: templatePostUrl1,
        method: 'POST',
        body: { newTaskId: template1.tasks[1].id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when moving a post between template tasks Org1', () => {
    before(() => {
      cy.login(orgKM1.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: templatePostUrl1,
        method: 'POST',
        body: { newTaskId: template1.tasks[1].id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when moving a post between template tasks Org2', () => {
    before(() => {
      cy.login(orgKM2.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: templatePostUrl2,
        method: 'POST',
        body: { newTaskId: template2.tasks[1].id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when moving a post between Org1 and Org2 template tasks', () => {
    before(() => {
      cy.login(orgKM2.username)
    })

    it('should return BAD_REQUEST status', () => {
      cy.apiSpecRequest({
        url: templatePostUrl2,
        method: 'POST',
        body: { newTaskId: template1.tasks[1].id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('when attempting other verbs on the endpoint', () => {
    before(() => {
      cy.login(orgKM1.username)
    })

    const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']
    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.login(orgKM1.username)
        cy.apiSpecRequest({
          url: templatePostUrl1,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })
})
