import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_minimap.cy', () => {
  let user, fixture

  before(() => {
    // eslint-disable-next-line arrow-parens
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_minimap.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}, {}, {}, {}] },
              ],
            },
            {
              tasks: [
                { tasks: [{}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}] },
                { tasks: [{}, {}, {}, {}, {}] },
                {},
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when navigate to taskmap in overview', () => {
    before(() => {
      cy.login(user.username)
      cy.backendRoute(
        `/matter/${fixture.matter.id}/workstreams/${fixture.projects[0].id}?includePosts=true&includeTaskTeam=true`
      ).as('fetchData')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
      cy.wait('@fetchData')
    })

    it('should display the minimap', () => {
      cy.get('[data-test=icicle-minimap]').should('have.length', 1)
    })
  })

  describe('when navigate to taskmap for a small project view', () => {
    before(() => {
      cy.login(user.username)
      cy.backendRoute(
        `/matter/${fixture.matter.id}/workstreams/${fixture.projects[1].id}?includePosts=true&includeTaskTeam=true`
      ).as('fetchData')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[1].id}/taskmap`
      )
      cy.wait('@fetchData')
    })

    it('should not display minimap', () => {
      cy.get('[data-test=icicle-minimap]', { timeout: 30000 }).should(
        'have.length',
        0
      )
    })
  })
})
