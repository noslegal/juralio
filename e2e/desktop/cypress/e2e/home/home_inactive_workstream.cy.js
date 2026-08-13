import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let admin, seed

describe('home_inactive_workstream.cy', () => {
  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR'],
    }).then(user => {
      admin = user
      seed = {
        matter: {
          prefex: 'home_inactive',
          teamMembers: [admin],
          matterAdmins: [admin],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'task1', teamMembers: [admin] }],
            },
            {
              name: 'Project 2',
              tasks: [
                { name: 'task2', teamMembers: [admin] },
                { name: 'task3' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when visiting the home page', () => {
    before(() => {
      cy.login(admin)
      appPage.visitHome()
    })
    it('should show both projects', () => {
      cy.get('[data-test=workstream-chip-title]').should('have.length', 2)
    })
    describe('when a workstream is maked as inactive', () => {
      before(() => {
        cy.login(admin).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}`,
            method: 'PATCH',
            body: {
              active: false,
            },
          }).then(() => {
            cy.reload()
            cy.login(admin)
            appPage.visitHome()
          })
        })
      })
      it('should show one project', () => {
        cy.get('[data-test=workstream-chip-title]').should('have.length', 0)
      })
    })
  })
})
